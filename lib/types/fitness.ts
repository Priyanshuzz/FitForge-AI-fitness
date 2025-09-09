// Fitness Coach Types and Interfaces

// User Profile Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
}

// Intake Form Types
export enum Sex {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum ActivityLevel {
  SEDENTARY = 'SEDENTARY',
  LIGHT = 'LIGHT',
  MODERATE = 'MODERATE',
  ACTIVE = 'ACTIVE',
  VERY_ACTIVE = 'VERY_ACTIVE',
}

export enum FitnessLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum PrimaryGoal {
  LOSE_WEIGHT = 'LOSE_WEIGHT',
  BUILD_MUSCLE = 'BUILD_MUSCLE',
  MAINTAIN = 'MAINTAIN',
  IMPROVE_ENDURANCE = 'IMPROVE_ENDURANCE',
  GENERAL_HEALTH = 'GENERAL_HEALTH',
  SPORT_SPECIFIC = 'SPORT_SPECIFIC',
}

export enum TrainingStyle {
  STRENGTH = 'STRENGTH',
  HYPERTROPHY = 'HYPERTROPHY',
  HIIT = 'HIIT',
  ENDURANCE = 'ENDURANCE',
  BODYWEIGHT = 'BODYWEIGHT',
  YOGA = 'YOGA',
  PILATES = 'PILATES',
  MIXED = 'MIXED',
}

export enum Equipment {
  NONE = 'NONE',
  DUMBBELLS = 'DUMBBELLS',
  BARBELL = 'BARBELL',
  KETTLEBELLS = 'KETTLEBELLS',
  RESISTANCE_BANDS = 'RESISTANCE_BANDS',
  BENCH = 'BENCH',
  CABLE_MACHINE = 'CABLE_MACHINE',
  PULL_UP_BAR = 'PULL_UP_BAR',
  CARDIO_EQUIPMENT = 'CARDIO_EQUIPMENT',
  FULL_GYM = 'FULL_GYM',
}

export enum DietPreference {
  NO_RESTRICTIONS = 'NO_RESTRICTIONS',
  VEGETARIAN = 'VEGETARIAN',
  VEGAN = 'VEGAN',
  PESCATARIAN = 'PESCATARIAN',
  KETO = 'KETO',
  MEDITERRANEAN = 'MEDITERRANEAN',
  PALEO = 'PALEO',
  INTERMITTENT_FASTING = 'INTERMITTENT_FASTING',
}

export enum MotivationStyle {
  GENTLE = 'GENTLE',
  FIRM = 'FIRM',
  DATA_DRIVEN = 'DATA_DRIVEN',
  COMMUNITY = 'COMMUNITY',
}

export interface IntakeForm {
  id?: string;
  user_id: string;

  // Personal Info
  age: number;
  sex: Sex;
  height_cm: number;
  weight_kg: number;
  goal_weight_kg?: number;
  target_date?: string;

  // Fitness Assessment
  activity_level: ActivityLevel;
  training_styles: TrainingStyle[];
  days_per_week: number;
  session_minutes: number;
  equipment: Equipment[];
  fitness_level: FitnessLevel;

  // Health & Nutrition
  injuries_limitations?: string;
  diet_preferences: DietPreference[];
  food_allergies?: string;
  cuisine_preferences?: string[];
  foods_to_avoid?: string;

  // Goals & Motivation
  primary_goal: PrimaryGoal;
  motivation_style: MotivationStyle;

  // Permissions
  photo_permission: boolean;
  medical_consent: boolean;
  terms_accepted: boolean;

  // Calculated values
  calculated_bmr?: number;
  calculated_tdee?: number;

  created_at?: string;
}

// Workout Types
export enum WorkoutStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export interface Exercise {
  id?: string;
  name: string;
  sets?: number;
  reps?: string; // Can be "8-10" or "30 seconds"
  duration?: string; // For time-based exercises
  rest_seconds?: number;
  instructions: string;
  modifications?: string;
  target_muscles: string[];
  video_url?: string;
}

export interface Workout {
  id?: string;
  plan_id: string;
  user_id: string;
  workout_date: string;
  title: string;
  duration_min: number;
  difficulty_level: DifficultyLevel;
  status: WorkoutStatus;

  // Workout structure
  warmup: Exercise[];
  exercises: Exercise[];
  cooldown: Exercise[];

  // Tracking data
  estimated_calories_burned?: number;
  actual_duration_min?: number;
  calories_burned?: number;
  user_rating?: number; // 1-5 stars
  user_notes?: string;

  // Timestamps
  started_at?: string;
  completed_at?: string;
  created_at?: string;
}

// Meal Types
export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK',
}

export enum MealStatus {
  PLANNED = 'PLANNED',
  PREPARED = 'PREPARED',
  CONSUMED = 'CONSUMED',
  SKIPPED = 'SKIPPED',
}

export interface Macros {
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export interface Meal {
  id?: string;
  plan_id: string;
  user_id: string;
  meal_date: string;
  meal_type: MealType;
  name: string;

  // Nutrition info
  calories: number;
  macros: Macros;

  // Recipe details
  ingredients: string[];
  prep_time_min?: number;
  recipe_instructions?: string;

  // Tracking
  status: MealStatus;
  user_rating?: number; // 1-5 stars
  user_notes?: string;
  consumed_at?: string;

  created_at?: string;
}

// Plan Types
export enum PlanType {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum PlanStatus {
  GENERATING = 'GENERATING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
  FAILED = 'FAILED',
}

export interface CalorieCalculation {
  bmr: number;
  tdee: number;
  daily_target: number;
  deficit_or_surplus?: number;
}

export interface Plan {
  id?: string;
  user_id: string;
  intake_form_id: string;
  plan_type: PlanType;
  status: PlanStatus;
  start_date: string;
  end_date: string;

  // Nutrition targets
  daily_calorie_target: number;
  calorie_calculation: CalorieCalculation;

  // Plan metadata
  generation_prompt_hash?: string;
  llm_response_cached?: boolean;

  // Generated content
  weekly_workouts?: Workout[];
  meal_plan?: Meal[];
  grocery_list?: GroceryList;
  notes?: string;
  weekly_tips?: string[];
  check_in_questions?: string[];

  created_at?: string;
  updated_at?: string;
}

// Progress Tracking Types
export interface ProgressEntry {
  id?: string;
  user_id: string;
  entry_date: string;

  // Measurements
  weight_kg?: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;

  // Body measurements (in cm)
  waist_circumference?: number;
  chest_circumference?: number;
  arm_circumference?: number;
  thigh_circumference?: number;

  // Progress photos
  photo_urls?: string[];

  // Notes
  notes?: string;
  mood_rating?: number; // 1-5
  energy_level?: number; // 1-5

  created_at?: string;
}

// Chat Types
export enum MessageType {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
}

export interface ChatMessage {
  id?: string;
  user_id: string;
  message_type: MessageType;
  content: string;
  context_data?: Record<string, any>;

  // AI response metadata
  response_cached?: boolean;
  tokens_used?: number;

  created_at?: string;
}

export interface ChatContext {
  current_workout?: Workout;
  current_meal_plan?: Meal[];
  recent_progress?: ProgressEntry[];
  user_preferences?: Partial<IntakeForm>;
  available_equipment?: Equipment[];
}

// Grocery List Types
export interface GroceryItem {
  name: string;
  category: string;
  quantity?: string;
  estimated_cost?: number;
}

export interface GroceryList {
  produce: GroceryItem[];
  proteins: GroceryItem[];
  dairy: GroceryItem[];
  grains: GroceryItem[];
  pantry: GroceryItem[];
  spices: GroceryItem[];
}

// LLM Integration Types
export interface LLMRequest {
  prompt: string;
  context?: Record<string, any>;
  max_tokens?: number;
  temperature?: number;
  user_id?: string;
}

export interface LLMResponse {
  content: string;
  tokens_used: number;
  cached: boolean;
  cost_estimate?: number;
}

export interface PlanGenerationRequest {
  user_id: string;
  intake_form_id: string;
  start_date?: string;
  plan_type?: PlanType;
  options?: {
    use_cache?: boolean;
    difficulty_adjustment?: number;
    focus_areas?: string[];
  };
}

export interface PlanGenerationJob {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  plan_id?: string;
  user_id: string;
  estimated_completion?: string;
  error_message?: string;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: UserProfile;
  access_token: string;
  refresh_token: string;
}

// Form Validation Schemas (using Zod)
export interface ValidationError {
  field: string;
  message: string;
}

// Analytics Types
export interface UserAnalytics {
  total_workouts_completed: number;
  total_meals_logged: number;
  streak_days: number;
  weight_change_kg: number;
  plan_adherence_percentage: number;
  favorite_workout_types: TrainingStyle[];
  average_workout_rating: number;
  last_active_date: string;
}

// Notification Types
export enum NotificationType {
  WORKOUT_REMINDER = 'WORKOUT_REMINDER',
  MEAL_REMINDER = 'MEAL_REMINDER',
  PROGRESS_CHECK = 'PROGRESS_CHECK',
  PLAN_READY = 'PLAN_READY',
  MOTIVATIONAL = 'MOTIVATIONAL',
  ACHIEVEMENT = 'ACHIEVEMENT',
}

export interface NotificationPreferences {
  workout_reminders: boolean;
  meal_reminders: boolean;
  progress_reminders: boolean;
  motivational_messages: boolean;
  quiet_hours_start?: string; // "22:00"
  quiet_hours_end?: string; // "07:00"
}

// Enhanced Plan Types for Display Components
export interface PlanDay {
  date: string;
  is_rest_day: boolean;
  completed: boolean;
  workout?: DisplayWorkout;
  meals?: DisplayMeal[];
  nutrition_targets?: {
    daily_calories: number;
    protein_grams: number;
    carbs_grams: number;
    fat_grams: number;
  };
  notes?: string;
}

export interface PlanWeek {
  week_number: number;
  start_date: string;
  end_date: string;
  days: PlanDay[];
  nutrition_targets?: {
    daily_calories: number;
    protein_grams: number;
    carbs_grams: number;
    fat_grams: number;
  };
}

// Extended Plan interface for display components
export interface DisplayPlan extends Plan {
  goal: string;
  weeks: PlanWeek[];
}

// Enhanced Workout interface for display
export interface DisplayWorkout {
  id: string;
  name: string;
  type: string;
  difficulty: string;
  estimated_duration: number;
  estimated_calories: number;
  target_muscle_groups: string[];
  exercises: DisplayExercise[];
  notes?: string;
}

// Enhanced Exercise interface for display
export interface DisplayExercise {
  id: string;
  name: string;
  sets: number;
  reps?: number;
  duration_seconds?: number;
  rest_seconds: number;
  instructions?: string;
  muscle_group: string;
  equipment?: string;
  demo_url?: string;
}

// Enhanced Meal interface for display
export interface DisplayMeal {
  id: string;
  name: string;
  meal_type: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  saturated_fat?: number;
  prep_time: number;
  cook_time?: number;
  servings: number;
  difficulty?: string;
  rating?: number;
  ingredients?: {
    name: string;
    amount: string;
    unit: string;
  }[];
  instructions?: string;
}

// Meal Plan interface for display
export interface MealPlan {
  id: string;
  date: string;
  meals: DisplayMeal[];
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
}

// Export utility type helpers
export type CreateIntakeForm = Omit<IntakeForm, 'id' | 'created_at'>;
export type UpdateIntakeForm = Partial<CreateIntakeForm>;
export type CreateWorkout = Omit<Workout, 'id' | 'created_at'>;
export type CreateMeal = Omit<Meal, 'id' | 'created_at'>;
export type CreateProgressEntry = Omit<ProgressEntry, 'id' | 'created_at'>;
