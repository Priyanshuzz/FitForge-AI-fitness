import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import type {
  IntakeForm,
  Plan,
  Workout,
  Meal,
  CalorieCalculation,
  GroceryList,
  ChatMessage,
  ChatContext,
} from '../types/fitness';

// AI Configuration
const AI_CONFIG = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 4000,
  timeout: 30000, // 30 seconds
};

// Prompt Templates
const SYSTEM_PROMPT = `You are FitForge AI, an expert fitness coach and nutritionist with years of experience creating personalized workout and meal plans.

CORE PRINCIPLES:
- Provide evidence-based, safe recommendations only
- Prioritize user safety - never recommend potentially harmful exercises
- Respect user limitations, equipment constraints, and dietary restrictions
- Provide clear, actionable guidance with proper form instructions
- NEVER give medical advice - always refer users to healthcare professionals
- Focus on sustainable, realistic lifestyle changes

SAFETY RULES:
- Always include proper warm-up and cool-down exercises
- Provide exercise modifications for different fitness levels
- Include rest days in weekly plans to prevent overtraining
- Respect reported injuries and physical limitations
- Ensure nutritional plans meet basic macro and micronutrient needs

OUTPUT FORMAT:
- Always return valid JSON matching the requested schema
- Include detailed instructions and safety notes
- Provide exercise modifications and progressions
- Make meal plans practical with simple, accessible ingredients`;

// Schemas for AI-generated content
const calorieCalculationSchema = z.object({
  bmr: z.number().describe('Basal Metabolic Rate in calories'),
  tdee: z.number().describe('Total Daily Energy Expenditure'),
  daily_target: z.number().describe('Daily calorie target for user goal'),
  deficit_or_surplus: z
    .number()
    .optional()
    .describe('Calorie deficit (-) or surplus (+)'),
});

const exerciseSchema = z.object({
  name: z.string().describe('Exercise name'),
  sets: z.number().optional().describe('Number of sets'),
  reps: z
    .string()
    .optional()
    .describe('Reps or duration (e.g., "8-10" or "30 seconds")'),
  rest_seconds: z.number().optional().describe('Rest time between sets'),
  instructions: z.string().describe('How to perform the exercise correctly'),
  modifications: z.string().optional().describe('Easier/harder variations'),
  target_muscles: z.array(z.string()).describe('Primary muscles worked'),
});

const workoutSchema = z.object({
  day: z.string().describe('Day of the week'),
  title: z.string().describe('Workout title'),
  duration_min: z.number().describe('Total workout duration'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  warmup: z.array(exerciseSchema).describe('Warm-up exercises'),
  exercises: z.array(exerciseSchema).describe('Main workout exercises'),
  cooldown: z.array(exerciseSchema).describe('Cool-down exercises'),
  estimated_calories: z.number().describe('Estimated calories burned'),
});

const mealSchema = z.object({
  type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  name: z.string().describe('Meal name'),
  calories: z.number().describe('Total calories'),
  protein: z.number().describe('Protein in grams'),
  carbs: z.number().describe('Carbohydrates in grams'),
  fat: z.number().describe('Fat in grams'),
  prep_time_min: z.number().describe('Preparation time in minutes'),
  ingredients: z.array(z.string()).describe('List of ingredients'),
  instructions: z.string().describe('Cooking/preparation instructions'),
});

const dailyMealPlanSchema = z.object({
  day: z.string().describe('Day of the week'),
  meals: z.array(mealSchema).describe('All meals for the day'),
  daily_calories: z.number().describe('Total calories for the day'),
  daily_macros: z.object({
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
  }),
});

const groceryListSchema = z.object({
  produce: z.array(z.string()).describe('Fruits and vegetables'),
  proteins: z.array(z.string()).describe('Meat, fish, dairy, plant proteins'),
  grains: z.array(z.string()).describe('Rice, pasta, bread, cereals'),
  pantry: z.array(z.string()).describe('Oils, spices, condiments'),
  dairy: z.array(z.string()).describe('Milk, cheese, yogurt'),
  other: z.array(z.string()).describe('Other items'),
});

const fitnessplanSchema = z.object({
  user_summary: z.string().describe('Brief summary of user profile and goals'),
  calorie_calculation: calorieCalculationSchema,
  weekly_workouts: z.array(workoutSchema).describe('7-day workout plan'),
  meal_plan: z.array(dailyMealPlanSchema).describe('7-day meal plan'),
  grocery_list: groceryListSchema,
  weekly_tips: z
    .array(z.string())
    .describe('3-5 motivational tips for the week'),
  check_in_questions: z
    .array(z.string())
    .describe('3 questions to ask user next week'),
  important_notes: z.string().describe('Important safety notes and reminders'),
});

// Utility Functions
function calculateBMR(
  age: number,
  sex: string,
  weightKg: number,
  heightCm: number
): number {
  // Mifflin-St Jeor Equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex.toUpperCase() === 'MALE' ? base + 5 : base - 161;
}

function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers = {
    SEDENTARY: 1.2,
    LIGHT: 1.375,
    MODERATE: 1.55,
    ACTIVE: 1.725,
    VERY_ACTIVE: 1.9,
  };
  return bmr * (multipliers[activityLevel as keyof typeof multipliers] || 1.2);
}

function getCalorieAdjustment(
  goal: string,
  currentWeight: number,
  goalWeight?: number
): number {
  if (!goalWeight) return 0;

  const weightDiff = currentWeight - goalWeight;

  switch (goal) {
    case 'LOSE_WEIGHT':
      return Math.min(-300, -weightDiff * 50); // Max deficit of 300 cal/day
    case 'BUILD_MUSCLE':
      return Math.max(200, Math.abs(weightDiff) * 25); // Surplus for muscle gain
    case 'MAINTAIN':
      return 0;
    default:
      return weightDiff > 0 ? -200 : 100; // Small adjustment
  }
}

// Main AI Service Class
export class FitnessCoachAI {
  private static instance: FitnessCoachAI;
  private cache: Map<string, any> = new Map();
  private readonly cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

  static getInstance(): FitnessCoachAI {
    if (!FitnessCoachAI.instance) {
      FitnessCoachAI.instance = new FitnessCoachAI();
    }
    return FitnessCoachAI.instance;
  }

  /**
   * Generate a comprehensive 7-day fitness and nutrition plan
   */
  async generateWeeklyPlan(
    intakeForm: IntakeForm,
    useCache: boolean = true
  ): Promise<any> {
    try {
      // Create cache key from intake form
      const cacheKey = this.createCacheKey(intakeForm);

      // Check cache first
      if (useCache && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheExpiry) {
          console.log('Returning cached plan');
          return cached.data;
        }
      }

      // Calculate nutritional needs
      const bmr = calculateBMR(
        intakeForm.age,
        intakeForm.sex,
        intakeForm.weight_kg,
        intakeForm.height_cm
      );

      const tdee = calculateTDEE(bmr, intakeForm.activity_level);

      const calorieAdjustment = getCalorieAdjustment(
        intakeForm.primary_goal,
        intakeForm.weight_kg,
        intakeForm.goal_weight_kg
      );

      // Build comprehensive prompt
      const prompt = this.buildPlanGenerationPrompt(intakeForm, {
        bmr,
        tdee,
        dailyTarget: tdee + calorieAdjustment,
      });

      console.log('Generating plan with AI...');

      // Generate plan using AI
      const result = await generateObject({
        model: openai(AI_CONFIG.model),
        system: SYSTEM_PROMPT,
        prompt,
        schema: fitnessplanSchema,
        temperature: AI_CONFIG.temperature,
        maxTokens: AI_CONFIG.maxTokens,
      });

      const planData = result.object;

      // Cache the result
      if (useCache) {
        this.cache.set(cacheKey, {
          data: planData,
          timestamp: Date.now(),
        });
      }

      return planData;
    } catch (error) {
      console.error('Error generating fitness plan:', error);
      throw new Error('Failed to generate fitness plan. Please try again.');
    }
  }

  /**
   * Generate AI chat response for user questions
   */
  async generateChatResponse(
    message: string,
    context: ChatContext,
    userId: string
  ): Promise<string> {
    try {
      const contextPrompt = this.buildChatContextPrompt(context);

      const prompt = `
${contextPrompt}

User Question: "${message}"

Provide a helpful, encouraging response that:
1. Directly addresses their question
2. Offers practical advice or modifications
3. Stays within your role as a fitness coach (no medical advice)
4. Maintains a motivational, supportive tone
5. Suggests specific actions if appropriate

Keep your response under 200 words and actionable.`;

      const result = await generateText({
        model: openai(AI_CONFIG.model),
        system: SYSTEM_PROMPT,
        prompt,
        temperature: 0.8,
        maxTokens: 300,
      });

      return result.text;
    } catch (error) {
      console.error('Error generating chat response:', error);
      return "I'm having trouble processing your question right now. Please try again, or contact support if the issue persists.";
    }
  }

  /**
   * Modify an existing workout based on user feedback
   */
  async modifyWorkout(
    originalWorkout: Workout,
    userFeedback: string,
    availableEquipment: string[]
  ): Promise<Partial<Workout>> {
    try {
      const prompt = `
Current Workout: ${JSON.stringify(originalWorkout, null, 2)}

User Feedback: "${userFeedback}"
Available Equipment: ${availableEquipment.join(', ')}

Modify this workout based on the user's feedback. Return only the parts that need to change:
- If they need easier exercises, provide modifications
- If they want more challenge, increase intensity appropriately
- If equipment is missing, suggest alternatives
- Maintain the same overall structure and target muscles

Respond with specific exercise modifications, not a complete new workout.`;

      const result = await generateText({
        model: openai(AI_CONFIG.model),
        system: SYSTEM_PROMPT,
        prompt,
        temperature: 0.6,
        maxTokens: 1000,
      });

      // Parse the AI response and return workout modifications
      // In a real implementation, you'd parse this more carefully
      return {
        user_notes: `Modified based on feedback: ${userFeedback}`,
        // Add parsed modifications here
      };
    } catch (error) {
      console.error('Error modifying workout:', error);
      throw new Error('Failed to modify workout. Please try again.');
    }
  }

  /**
   * Generate motivational message based on user progress
   */
  async generateMotivationalMessage(
    completedWorkouts: number,
    streak: number,
    goal: string
  ): Promise<string> {
    try {
      const prompt = `
User Progress:
- Completed workouts this week: ${completedWorkouts}
- Current streak: ${streak} days
- Primary goal: ${goal}

Generate a motivational message (2-3 sentences) that:
1. Acknowledges their progress
2. Encourages consistency
3. Relates to their specific goal
4. Maintains an upbeat, supportive tone`;

      const result = await generateText({
        model: openai(AI_CONFIG.model),
        system: SYSTEM_PROMPT,
        prompt,
        temperature: 0.9,
        maxTokens: 150,
      });

      return result.text;
    } catch (error) {
      console.error('Error generating motivational message:', error);
      return 'Keep up the great work! Every workout brings you closer to your goals. 💪';
    }
  }

  /**
   * Build prompt for plan generation
   */
  private buildPlanGenerationPrompt(
    intakeForm: IntakeForm,
    calories: { bmr: number; tdee: number; dailyTarget: number }
  ): string {
    return `
Generate a personalized 7-day fitness and nutrition plan for this user:

USER PROFILE:
- Age: ${intakeForm.age}, Sex: ${intakeForm.sex}
- Height: ${intakeForm.height_cm}cm, Weight: ${intakeForm.weight_kg}kg
- Goal Weight: ${intakeForm.goal_weight_kg || 'Not specified'}kg
- Activity Level: ${intakeForm.activity_level}
- Fitness Level: ${intakeForm.fitness_level}
- Primary Goal: ${intakeForm.primary_goal}

TRAINING PREFERENCES:
- Training Styles: ${intakeForm.training_styles.join(', ')}
- Days per week: ${intakeForm.days_per_week}
- Session duration: ${intakeForm.session_minutes} minutes
- Available equipment: ${intakeForm.equipment.join(', ')}
- Injuries/limitations: ${intakeForm.injuries_limitations || 'None reported'}

NUTRITION PREFERENCES:
- Diet preferences: ${intakeForm.diet_preferences.join(', ')}
- Food allergies: ${intakeForm.food_allergies || 'None reported'}
- Foods to avoid: ${intakeForm.foods_to_avoid || 'None specified'}

CALCULATED NUTRITION TARGETS:
- BMR: ${calories.bmr} calories
- TDEE: ${calories.tdee} calories  
- Daily target: ${calories.dailyTarget} calories

REQUIREMENTS:
1. Create exactly 7 workouts (one for each day, including rest/active recovery days)
2. Each workout must respect the user's equipment limitations
3. Progress difficulty appropriately throughout the week
4. Include modifications for the user's fitness level
5. Plan 7 days of meals hitting the daily calorie target (±100 calories)
6. Each meal should be realistic with ≤6 ingredients and ≤30 min prep time
7. Respect all dietary restrictions and preferences
8. Include a grocery list organized by category
9. Add motivational tips and check-in questions
10. Include important safety notes

Generate a comprehensive plan that this user can immediately start following.`;
  }

  /**
   * Build context prompt for chat
   */
  private buildChatContextPrompt(context: ChatContext): string {
    let contextStr = 'CURRENT CONTEXT:\n';

    if (context.current_workout) {
      contextStr += `- Today's workout: ${context.current_workout.title} (${context.current_workout.duration_min} min)\n`;
    }

    if (context.available_equipment) {
      contextStr += `- Available equipment: ${context.available_equipment.join(', ')}\n`;
    }

    if (context.user_preferences) {
      contextStr += `- User preferences: ${JSON.stringify(context.user_preferences)}\n`;
    }

    return contextStr;
  }

  /**
   * Create cache key from intake form
   */
  private createCacheKey(intakeForm: IntakeForm): string {
    const keyData = {
      age: intakeForm.age,
      sex: intakeForm.sex,
      weight: intakeForm.weight_kg,
      height: intakeForm.height_cm,
      goal: intakeForm.primary_goal,
      activity: intakeForm.activity_level,
      training: intakeForm.training_styles.sort(),
      equipment: intakeForm.equipment.sort(),
      diet: intakeForm.diet_preferences.sort(),
      days: intakeForm.days_per_week,
      duration: intakeForm.session_minutes,
    };

    return Buffer.from(JSON.stringify(keyData)).toString('base64');
  }

  /**
   * Clear cache (useful for testing or manual cache invalidation)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const fitnessCoachAI = FitnessCoachAI.getInstance();

// Export additional utility functions
export { calculateBMR, calculateTDEE, getCalorieAdjustment };
