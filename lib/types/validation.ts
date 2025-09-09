import { z } from 'zod';
import {
  Sex,
  ActivityLevel,
  FitnessLevel,
  PrimaryGoal,
  TrainingStyle,
  Equipment,
  DietPreference,
  MotivationStyle,
  MealType,
  WorkoutStatus,
  DifficultyLevel,
} from './fitness';

// User Profile Validation
export const userProfileSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  timezone: z.string().default('UTC'),
});

// Intake Form Validation
export const intakeFormSchema = z.object({
  // Personal Info
  age: z
    .number()
    .min(16, 'Must be at least 16 years old')
    .max(100, 'Must be less than 100 years old'),

  sex: z.nativeEnum(Sex, {
    errorMap: () => ({ message: 'Please select your biological sex' }),
  }),

  height_cm: z
    .number()
    .min(100, 'Height must be at least 100cm')
    .max(250, 'Height must be less than 250cm'),

  weight_kg: z
    .number()
    .min(30, 'Weight must be at least 30kg')
    .max(300, 'Weight must be less than 300kg'),

  goal_weight_kg: z
    .number()
    .min(30, 'Goal weight must be at least 30kg')
    .max(300, 'Goal weight must be less than 300kg')
    .optional(),

  target_date: z.string().optional(),

  // Fitness Assessment
  activity_level: z.nativeEnum(ActivityLevel, {
    errorMap: () => ({ message: 'Please select your activity level' }),
  }),

  training_styles: z
    .array(z.nativeEnum(TrainingStyle))
    .min(1, 'Please select at least one training style'),

  days_per_week: z
    .number()
    .min(1, 'Must train at least 1 day per week')
    .max(7, 'Cannot train more than 7 days per week'),

  session_minutes: z
    .number()
    .min(15, 'Sessions must be at least 15 minutes')
    .max(180, 'Sessions cannot exceed 3 hours'),

  equipment: z
    .array(z.nativeEnum(Equipment))
    .min(1, 'Please select available equipment'),

  fitness_level: z.nativeEnum(FitnessLevel, {
    errorMap: () => ({ message: 'Please select your fitness level' }),
  }),

  // Health & Nutrition
  injuries_limitations: z.string().optional(),

  diet_preferences: z
    .array(z.nativeEnum(DietPreference))
    .default([DietPreference.NO_RESTRICTIONS]),

  food_allergies: z.string().optional(),

  cuisine_preferences: z.array(z.string()).optional(),

  foods_to_avoid: z.string().optional(),

  // Goals & Motivation
  primary_goal: z.nativeEnum(PrimaryGoal, {
    errorMap: () => ({ message: 'Please select your primary goal' }),
  }),

  motivation_style: z.nativeEnum(MotivationStyle, {
    errorMap: () => ({ message: 'Please select your motivation style' }),
  }),

  // Permissions & Consent
  photo_permission: z.boolean().default(false),

  medical_consent: z.boolean().refine(val => val === true, {
    message: 'You must acknowledge the medical disclaimer',
  }),

  terms_accepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

// Exercise Validation
export const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  sets: z.number().min(1).max(10).optional(),
  reps: z.string().optional(),
  duration: z.string().optional(),
  rest_seconds: z.number().min(0).max(600).optional(),
  instructions: z.string().min(1, 'Instructions are required'),
  modifications: z.string().optional(),
  target_muscles: z
    .array(z.string())
    .min(1, 'At least one target muscle required'),
  video_url: z.string().url().optional(),
});

// Workout Validation
export const workoutSchema = z.object({
  title: z.string().min(1, 'Workout title is required'),
  duration_min: z.number().min(10).max(180),
  difficulty_level: z.nativeEnum(DifficultyLevel),
  warmup: z.array(exerciseSchema),
  exercises: z.array(exerciseSchema).min(1, 'At least one exercise required'),
  cooldown: z.array(exerciseSchema),
  estimated_calories_burned: z.number().min(0).optional(),
});

// Meal Validation
export const mealSchema = z.object({
  name: z.string().min(1, 'Meal name is required'),
  meal_type: z.nativeEnum(MealType),
  calories: z.number().min(50).max(2000),
  macros: z.object({
    protein: z.number().min(0),
    carbs: z.number().min(0),
    fat: z.number().min(0),
  }),
  ingredients: z.array(z.string()).min(1, 'At least one ingredient required'),
  prep_time_min: z.number().min(0).max(240).optional(),
  recipe_instructions: z.string().optional(),
});

// Progress Entry Validation
export const progressEntrySchema = z.object({
  entry_date: z.string(),
  weight_kg: z.number().min(30).max(300).optional(),
  body_fat_percentage: z.number().min(0).max(50).optional(),
  muscle_mass_kg: z.number().min(10).max(100).optional(),
  waist_circumference: z.number().min(50).max(200).optional(),
  chest_circumference: z.number().min(60).max(200).optional(),
  arm_circumference: z.number().min(15).max(60).optional(),
  thigh_circumference: z.number().min(30).max(100).optional(),
  notes: z.string().optional(),
  mood_rating: z.number().min(1).max(5).optional(),
  energy_level: z.number().min(1).max(5).optional(),
});

// Chat Message Validation
export const chatMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message too long'),
  context_data: z.record(z.any()).optional(),
});

// Plan Generation Request Validation
export const planGenerationRequestSchema = z.object({
  intake_form_id: z.string().uuid('Invalid intake form ID'),
  start_date: z.string().optional(),
  plan_type: z.enum(['WEEKLY', 'MONTHLY']).default('WEEKLY'),
  options: z
    .object({
      use_cache: z.boolean().default(true),
      difficulty_adjustment: z.number().min(-2).max(2).default(0),
      focus_areas: z.array(z.string()).optional(),
    })
    .optional(),
});

// Authentication Validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
    confirm_password: z.string(),
  })
  .refine(data => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

// Workout Completion Validation
export const workoutCompletionSchema = z.object({
  actual_duration_min: z.number().min(1).max(300),
  calories_burned: z.number().min(0).max(2000).optional(),
  user_rating: z.number().min(1).max(5),
  user_notes: z.string().max(500).optional(),
  completed_exercises: z
    .array(
      z.object({
        exercise_id: z.string(),
        sets_completed: z.number().min(0),
        reps_completed: z.array(z.number()).optional(),
        weight_used: z.number().min(0).optional(),
        modifications_used: z.string().optional(),
      })
    )
    .optional(),
});

// Meal Logging Validation
export const mealLoggingSchema = z.object({
  meal_id: z.string().uuid(),
  consumed_at: z.string(),
  user_rating: z.number().min(1).max(5).optional(),
  user_notes: z.string().max(300).optional(),
  actual_portions: z.number().min(0.1).max(3).default(1), // 0.1 = 10%, 3 = 300%
});

// Notification Preferences Validation
export const notificationPreferencesSchema = z.object({
  workout_reminders: z.boolean().default(true),
  meal_reminders: z.boolean().default(true),
  progress_reminders: z.boolean().default(true),
  motivational_messages: z.boolean().default(true),
  quiet_hours_start: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  quiet_hours_end: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
});

// Form Step Validation (for multi-step intake form)
export const personalInfoStepSchema = intakeFormSchema.pick({
  age: true,
  sex: true,
  height_cm: true,
  weight_kg: true,
  goal_weight_kg: true,
  target_date: true,
});

export const fitnessAssessmentStepSchema = intakeFormSchema.pick({
  activity_level: true,
  training_styles: true,
  days_per_week: true,
  session_minutes: true,
  equipment: true,
  fitness_level: true,
});

export const healthNutritionStepSchema = intakeFormSchema.pick({
  injuries_limitations: true,
  diet_preferences: true,
  food_allergies: true,
  cuisine_preferences: true,
  foods_to_avoid: true,
});

export const goalsMotivationStepSchema = intakeFormSchema.pick({
  primary_goal: true,
  motivation_style: true,
});

export const consentStepSchema = intakeFormSchema.pick({
  photo_permission: true,
  medical_consent: true,
  terms_accepted: true,
});

// Export types for TypeScript inference
export type IntakeFormData = z.infer<typeof intakeFormSchema>;
export type PersonalInfoStepData = z.infer<typeof personalInfoStepSchema>;
export type FitnessAssessmentStepData = z.infer<
  typeof fitnessAssessmentStepSchema
>;
export type HealthNutritionStepData = z.infer<typeof healthNutritionStepSchema>;
export type GoalsMotivationStepData = z.infer<typeof goalsMotivationStepSchema>;
export type ConsentStepData = z.infer<typeof consentStepSchema>;
export type WorkoutData = z.infer<typeof workoutSchema>;
export type MealData = z.infer<typeof mealSchema>;
export type ProgressEntryData = z.infer<typeof progressEntrySchema>;
export type ChatMessageData = z.infer<typeof chatMessageSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

// Validation helper functions
export const validateIntakeFormStep = (step: number, data: any) => {
  switch (step) {
    case 0:
      return personalInfoStepSchema.safeParse(data);
    case 1:
      return fitnessAssessmentStepSchema.safeParse(data);
    case 2:
      return healthNutritionStepSchema.safeParse(data);
    case 3:
      return goalsMotivationStepSchema.safeParse(data);
    case 4:
      return consentStepSchema.safeParse(data);
    default:
      throw new Error('Invalid step number');
  }
};

export const validateCompleteIntakeForm = (data: any) => {
  return intakeFormSchema.safeParse(data);
};
