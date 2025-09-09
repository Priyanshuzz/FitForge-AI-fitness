'use server';

import { createSupabaseClient } from '@/lib/supabase/client';
import { fitnessCoachAI } from '@/lib/ai/fitness-coach-ai';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { 
  withServerActionErrorHandling, 
  withDatabaseErrorHandling, 
  withExternalApiErrorHandling 
} from '@/lib/utils/api-error-handling';
import { 
  ValidationError, 
  AuthenticationError, 
  DatabaseError, 
  AIServiceError,
  logger 
} from '@/lib/utils/error-handling';
import type { 
  IntakeForm, 
  Plan, 
  Workout, 
  Meal, 
  ProgressEntry,
  ChatMessage,
  PlanGenerationJob 
} from '@/lib/types/fitness';
import { 
  intakeFormSchema, 
  progressEntrySchema, 
  chatMessageSchema,
  workoutCompletionSchema,
  mealLoggingSchema 
} from '@/lib/types/validation';

/**
 * Submit user intake form and trigger AI plan generation
 */
export const submitIntakeForm = withServerActionErrorHandling(async (formData: FormData) => {
  const supabase = createSupabaseClient();
  
  if (!supabase) {
    throw new DatabaseError('Database service is not available');
  }
  
  // Get current user
  const { data: { user }, error: authError } = await withDatabaseErrorHandling(
    () => supabase.auth.getUser(),
    'getUser'
  );
  
  if (authError || !user) {
    throw new AuthenticationError('Authentication required');
  }

  logger.info('Starting intake form submission', {}, user.id);

  // Parse and validate form data
  const rawData = Object.fromEntries(formData.entries());
  
  // Convert string arrays and booleans
  const processedData = {
    ...rawData,
    age: parseInt(rawData.age as string),
    height_cm: parseFloat(rawData.height_cm as string),
    weight_kg: parseFloat(rawData.weight_kg as string),
    goal_weight_kg: rawData.goal_weight_kg ? parseFloat(rawData.goal_weight_kg as string) : undefined,
    days_per_week: parseInt(rawData.days_per_week as string),
    session_minutes: parseInt(rawData.session_minutes as string),
    training_styles: JSON.parse(rawData.training_styles as string),
    equipment: JSON.parse(rawData.equipment as string),
    diet_preferences: JSON.parse(rawData.diet_preferences as string),
    cuisine_preferences: rawData.cuisine_preferences ? JSON.parse(rawData.cuisine_preferences as string) : undefined,
    photo_permission: rawData.photo_permission === 'true',
    medical_consent: rawData.medical_consent === 'true',
    terms_accepted: rawData.terms_accepted === 'true',
    user_id: user.id,
  };

  // Validate intake form
  const validationResult = intakeFormSchema.safeParse(processedData);
  if (!validationResult.success) {
    throw new ValidationError(`Validation failed: ${validationResult.error.message}`);
  }

  const intakeData = validationResult.data;

  // Save intake form to database
  const intakeForm = await withDatabaseErrorHandling(
    async () => {
      const { data, error } = await supabase
        .from('intake_forms')
        .insert([intakeData])
        .select()
        .single();
      
      if (error) {
        throw new DatabaseError(`Failed to save intake form: ${error.message}`);
      }
      
      return data;
    },
    'saveIntakeForm',
    user.id
  );

  // Create plan generation job
  const job = await withDatabaseErrorHandling(
    async () => {
      const { data, error } = await supabase
        .from('plan_generation_jobs')
        .insert([{
          user_id: user.id,
          intake_form_id: intakeForm.id,
          status: 'PENDING',
          estimated_completion: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
        }])
        .select()
        .single();
      
      if (error) {
        throw new DatabaseError(`Failed to create plan generation job: ${error.message}`);
      }
      
      return data;
    },
    'createPlanJob',
    user.id
  );

  // Trigger plan generation (in background)
  generatePlan(job.id).catch(error => {
    logger.error('Background plan generation failed', error, {}, user.id);
  });

  logger.info('Intake form submitted successfully', { jobId: job.id }, user.id);

  return { 
    success: true, 
    jobId: job.id,
    message: 'Intake form submitted successfully. Generating your personalized plan...' 
  };
});

/**
 * Generate AI-powered fitness plan
 */
export async function generatePlan(jobId: string) {
  try {
    const supabase = createSupabaseClient();

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('plan_generation_jobs')
      .select('*, intake_forms(*)')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      throw new Error('Plan generation job not found');
    }

    // Update job status to in progress
    await supabase
      .from('plan_generation_jobs')
      .update({ 
        status: 'IN_PROGRESS',
        started_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Generate plan using AI
    const planData = await fitnessCoachAI.generateWeeklyPlan(job.intake_forms);

    // Create plan record
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .insert([{
        user_id: job.user_id,
        intake_form_id: job.intake_form_id,
        plan_type: 'WEEKLY',
        status: 'ACTIVE',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        daily_calorie_target: planData.calorie_calculation.daily_target,
        plan_data: planData,
      }])
      .select()
      .single();

    if (planError) {
      throw new Error(`Failed to save plan: ${planError.message}`);
    }

    // Create individual workout records
    for (let i = 0; i < planData.weekly_workouts.length; i++) {
      const workoutData = planData.weekly_workouts[i];
      const workoutDate = new Date();
      workoutDate.setDate(workoutDate.getDate() + i);

      await supabase
        .from('workouts')
        .insert([{
          plan_id: plan.id,
          user_id: job.user_id,
          workout_date: workoutDate.toISOString().split('T')[0],
          title: workoutData.title,
          duration_min: workoutData.duration_min,
          difficulty_level: workoutData.difficulty,
          workout_data: workoutData,
          status: 'SCHEDULED',
          estimated_calories_burned: workoutData.estimated_calories,
        }]);
    }

    // Create individual meal records
    for (let i = 0; i < planData.meal_plan.length; i++) {
      const dayPlan = planData.meal_plan[i];
      const mealDate = new Date();
      mealDate.setDate(mealDate.getDate() + i);

      for (const meal of dayPlan.meals) {
        await supabase
          .from('meals')
          .insert([{
            plan_id: plan.id,
            user_id: job.user_id,
            meal_date: mealDate.toISOString().split('T')[0],
            meal_type: meal.type.toUpperCase(),
            name: meal.name,
            calories: meal.calories,
            macros: {
              protein: meal.protein,
              carbs: meal.carbs,
              fat: meal.fat,
            },
            ingredients: meal.ingredients,
            prep_time_min: meal.prep_time_min,
            recipe_instructions: meal.instructions,
            status: 'PLANNED',
          }]);
      }
    }

    // Update job status to completed
    await supabase
      .from('plan_generation_jobs')
      .update({ 
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        result_data: { plan_id: plan.id }
      })
      .eq('id', jobId);

    revalidatePath('/dashboard');
    return { success: true, planId: plan.id };

  } catch (error) {
    console.error('Error generating plan:', error);
    
    // Update job status to failed
    const supabase = createSupabaseClient();
    await supabase
      .from('plan_generation_jobs')
      .update({ 
        status: 'FAILED',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);

    throw error;
  }
}

/**
 * Get current user's active plan
 */
export async function getCurrentPlan() {
  try {
    const supabase = createSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    const { data: plan, error } = await supabase
      .from('plans')
      .select(`
        *,
        workouts(*),
        meals(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to fetch plan: ${error.message}`);
    }

    return { success: true, plan: plan || null };

  } catch (error) {
    console.error('Error fetching current plan:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch plan' 
    };
  }
}

/**
 * Get today's workout
 */
export async function getTodaysWorkout() {
  try {
    const supabase = createSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    const today = new Date().toISOString().split('T')[0];

    const { data: workout, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .eq('workout_date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch today's workout: ${error.message}`);
    }

    return { success: true, workout: workout || null };

  } catch (error) {
    console.error('Error fetching today\'s workout:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch workout' 
    };
  }
}

/**
 * Complete a workout
 */
export async function completeWorkout(workoutId: string, completionData: FormData) {
  try {
    const supabase = createSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // Parse completion data
    const rawData = Object.fromEntries(completionData.entries());
    const validationResult = workoutCompletionSchema.safeParse({
      actual_duration_min: parseInt(rawData.actual_duration_min as string),
      calories_burned: rawData.calories_burned ? parseInt(rawData.calories_burned as string) : undefined,
      user_rating: parseInt(rawData.user_rating as string),
      user_notes: rawData.user_notes as string || undefined,
    });

    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }

    const completion = validationResult.data;

    // Update workout
    const { error } = await supabase
      .from('workouts')
      .update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        actual_duration_min: completion.actual_duration_min,
        calories_burned: completion.calories_burned,
        user_rating: completion.user_rating,
        user_notes: completion.user_notes,
      })
      .eq('id', workoutId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to complete workout: ${error.message}`);
    }

    revalidatePath('/dashboard');
    revalidatePath('/workouts');
    
    return { success: true, message: 'Workout completed successfully!' };

  } catch (error) {
    console.error('Error completing workout:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to complete workout' 
    };
  }
}

/**
 * Log a meal as consumed
 */
export async function logMeal(mealId: string, loggingData: FormData) {
  try {
    const supabase = createSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // Parse logging data
    const rawData = Object.fromEntries(loggingData.entries());
    const validationResult = mealLoggingSchema.safeParse({
      meal_id: mealId,
      consumed_at: new Date().toISOString(),
      user_rating: rawData.user_rating ? parseInt(rawData.user_rating as string) : undefined,
      user_notes: rawData.user_notes as string || undefined,
      actual_portions: rawData.actual_portions ? parseFloat(rawData.actual_portions as string) : 1,
    });

    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }

    const logging = validationResult.data;

    // Update meal
    const { error } = await supabase
      .from('meals')
      .update({
        status: 'CONSUMED',
        consumed_at: logging.consumed_at,
        user_rating: logging.user_rating,
        user_notes: logging.user_notes,
      })
      .eq('id', mealId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to log meal: ${error.message}`);
    }

    revalidatePath('/dashboard');
    revalidatePath('/nutrition');
    
    return { success: true, message: 'Meal logged successfully!' };

  } catch (error) {
    console.error('Error logging meal:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to log meal' 
    };
  }
}

/**
 * Add progress entry
 */
export async function addProgressEntry(formData: FormData) {
  try {
    const supabase = createSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // Parse form data
    const rawData = Object.fromEntries(formData.entries());
    const processedData = {
      user_id: user.id,
      entry_date: rawData.entry_date as string,
      weight_kg: rawData.weight_kg ? parseFloat(rawData.weight_kg as string) : undefined,
      body_fat_percentage: rawData.body_fat_percentage ? parseFloat(rawData.body_fat_percentage as string) : undefined,
      muscle_mass_kg: rawData.muscle_mass_kg ? parseFloat(rawData.muscle_mass_kg as string) : undefined,
      waist_circumference: rawData.waist_circumference ? parseFloat(rawData.waist_circumference as string) : undefined,
      chest_circumference: rawData.chest_circumference ? parseFloat(rawData.chest_circumference as string) : undefined,
      arm_circumference: rawData.arm_circumference ? parseFloat(rawData.arm_circumference as string) : undefined,
      thigh_circumference: rawData.thigh_circumference ? parseFloat(rawData.thigh_circumference as string) : undefined,
      notes: rawData.notes as string || undefined,
      mood_rating: rawData.mood_rating ? parseInt(rawData.mood_rating as string) : undefined,
      energy_level: rawData.energy_level ? parseInt(rawData.energy_level as string) : undefined,
    };

    // Validate progress entry
    const validationResult = progressEntrySchema.safeParse(processedData);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }

    const progressData = validationResult.data;

    // Save to database
    const { error } = await supabase
      .from('progress_entries')
      .upsert([progressData], { 
        onConflict: 'user_id,entry_date',
        ignoreDuplicates: false 
      });

    if (error) {
      throw new Error(`Failed to save progress entry: ${error.message}`);
    }

    revalidatePath('/progress');
    
    return { success: true, message: 'Progress entry saved successfully!' };

  } catch (error) {
    console.error('Error adding progress entry:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save progress entry' 
    };
  }
}

/**
 * Send message to AI coach
 */
export async function sendChatMessage(formData: FormData) {
  try {
    const supabase = createSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    const message = formData.get('message') as string;
    const contextStr = formData.get('context') as string;
    
    if (!message?.trim()) {
      throw new Error('Message is required');
    }
    
    let context: any = {};
    if (contextStr) {
      try {
        context = JSON.parse(contextStr);
      } catch (e) {
        console.warn('Failed to parse context:', e);
      }
    }

    // Validate message
    const validationResult = chatMessageSchema.safeParse({ content: message, context_data: context });
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }

    // Save user message
    await supabase
      .from('chat_history')
      .insert([{
        user_id: user.id,
        message_type: 'USER',
        message_content: message,
        context_data: context,
      }]);

    // Generate AI response
    const aiResponse = await fitnessCoachAI.generateChatResponse(message, context || {}, user.id);

    // Save AI response
    await supabase
      .from('chat_history')
      .insert([{
        user_id: user.id,
        message_type: 'ASSISTANT',
        message_content: aiResponse,
        context_data: context,
      }]);

    revalidatePath('/coach');
    
    return { success: true, response: aiResponse };

  } catch (error) {
    console.error('Error sending chat message:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send message' 
    };
  }
}

/**
 * Check plan generation job status
 */
export async function checkPlanGenerationStatus(jobId: string) {
  try {
    const supabase = createSupabaseClient();
    
    const { data: job, error } = await supabase
      .from('plan_generation_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      throw new Error(`Failed to check job status: ${error.message}`);
    }

    return { success: true, job };

  } catch (error) {
    console.error('Error checking plan generation status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to check status' 
    };
  }
}