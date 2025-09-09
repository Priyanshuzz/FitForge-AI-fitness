-- FitForge AI Fitness Coach Database Schema
-- This creates all necessary tables for the fitness coaching application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    timezone TEXT DEFAULT 'UTC',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intake forms table
CREATE TABLE IF NOT EXISTS intake_forms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Personal Information
    age INTEGER NOT NULL CHECK (age >= 16 AND age <= 100),
    sex TEXT NOT NULL CHECK (sex IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')),
    height_cm DECIMAL(5,2) NOT NULL CHECK (height_cm >= 100 AND height_cm <= 250),
    weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg >= 30 AND weight_kg <= 300),
    goal_weight_kg DECIMAL(5,2) CHECK (goal_weight_kg >= 30 AND goal_weight_kg <= 300),
    target_date DATE,
    
    -- Fitness Assessment
    activity_level TEXT NOT NULL CHECK (activity_level IN ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE')),
    training_styles JSONB NOT NULL DEFAULT '[]'::jsonb,
    days_per_week INTEGER NOT NULL CHECK (days_per_week >= 1 AND days_per_week <= 7),
    session_minutes INTEGER NOT NULL CHECK (session_minutes >= 15 AND session_minutes <= 180),
    equipment JSONB NOT NULL DEFAULT '[]'::jsonb,
    fitness_level TEXT NOT NULL CHECK (fitness_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    
    -- Health & Nutrition
    injuries_limitations TEXT,
    diet_preferences JSONB DEFAULT '[]'::jsonb,
    food_allergies TEXT,
    cuisine_preferences JSONB DEFAULT '[]'::jsonb,
    foods_to_avoid TEXT,
    
    -- Goals & Motivation
    primary_goal TEXT NOT NULL CHECK (primary_goal IN ('LOSE_WEIGHT', 'BUILD_MUSCLE', 'MAINTAIN', 'IMPROVE_ENDURANCE', 'GENERAL_HEALTH', 'SPORT_SPECIFIC')),
    motivation_style TEXT NOT NULL CHECK (motivation_style IN ('GENTLE', 'FIRM', 'DATA_DRIVEN', 'COMMUNITY')),
    
    -- Permissions & Consent
    photo_permission BOOLEAN DEFAULT FALSE,
    medical_consent BOOLEAN NOT NULL DEFAULT FALSE,
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Calculated Values
    calculated_bmr DECIMAL(8,2),
    calculated_tdee DECIMAL(8,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    intake_form_id UUID REFERENCES intake_forms(id) NOT NULL,
    
    plan_type TEXT DEFAULT 'WEEKLY' CHECK (plan_type IN ('WEEKLY', 'MONTHLY')),
    status TEXT DEFAULT 'GENERATING' CHECK (status IN ('GENERATING', 'ACTIVE', 'COMPLETED', 'ARCHIVED', 'FAILED')),
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    daily_calorie_target INTEGER,
    plan_data JSONB, -- Complete AI-generated plan
    
    generation_prompt_hash TEXT,
    llm_response_cached BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    
    workout_date DATE NOT NULL,
    title TEXT NOT NULL,
    duration_min INTEGER NOT NULL,
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    
    workout_data JSONB NOT NULL, -- Complete workout structure
    status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED')),
    
    -- Tracking Data
    estimated_calories_burned INTEGER,
    actual_duration_min INTEGER,
    calories_burned INTEGER,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_notes TEXT,
    
    -- Timestamps
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meals table
CREATE TABLE IF NOT EXISTS meals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    
    meal_date DATE NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK')),
    name TEXT NOT NULL,
    
    -- Nutrition Info
    calories INTEGER NOT NULL,
    macros JSONB NOT NULL, -- {protein: number, carbs: number, fat: number}
    
    -- Recipe Details
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    prep_time_min INTEGER,
    recipe_instructions TEXT,
    
    -- Tracking
    status TEXT DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'PREPARED', 'CONSUMED', 'SKIPPED')),
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_notes TEXT,
    consumed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress entries table
CREATE TABLE IF NOT EXISTS progress_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    entry_date DATE NOT NULL,
    
    -- Measurements
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    muscle_mass_kg DECIMAL(5,2),
    
    -- Body Measurements (cm)
    waist_circumference DECIMAL(5,2),
    chest_circumference DECIMAL(5,2),
    arm_circumference DECIMAL(5,2),
    thigh_circumference DECIMAL(5,2),
    
    -- Progress Photos
    photo_urls JSONB DEFAULT '[]'::jsonb,
    
    -- Wellness Tracking
    notes TEXT,
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, entry_date)
);

-- Chat history table
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    
    message_type TEXT NOT NULL CHECK (message_type IN ('USER', 'ASSISTANT')),
    message_content TEXT NOT NULL,
    context_data JSONB DEFAULT '{}'::jsonb,
    
    -- AI Response Metadata
    response_cached BOOLEAN DEFAULT FALSE,
    tokens_used INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plan generation jobs table
CREATE TABLE IF NOT EXISTS plan_generation_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    intake_form_id UUID REFERENCES intake_forms(id) NOT NULL,
    
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
    
    estimated_completion TIMESTAMPTZ,
    error_message TEXT,
    result_data JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- User analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    
    total_workouts_completed INTEGER DEFAULT 0,
    total_meals_logged INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    plan_adherence_percentage DECIMAL(5,2) DEFAULT 0,
    
    last_workout_date DATE,
    last_meal_log_date DATE,
    last_progress_update DATE,
    last_active_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_intake_forms_user_id ON intake_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_status ON plans(status);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_workouts_status ON workouts(status);
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, meal_date);
CREATE INDEX IF NOT EXISTS idx_progress_user_date ON progress_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_jobs_user_id ON plan_generation_jobs(user_id);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own intake forms" ON intake_forms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own intake forms" ON intake_forms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own intake forms" ON intake_forms FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own plans" ON plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can create plans" ON plans FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own workouts" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service can create workouts" ON workouts FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own meals" ON meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own meals" ON meals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service can create meals" ON meals FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own progress" ON progress_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own progress entries" ON progress_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress entries" ON progress_entries FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat history" ON chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own chat messages" ON chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own plan jobs" ON plan_generation_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own plan jobs" ON plan_generation_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service can update plan jobs" ON plan_generation_jobs FOR UPDATE WITH CHECK (true);

CREATE POLICY "Users can view own analytics" ON user_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can manage analytics" ON user_analytics FOR ALL WITH CHECK (true);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  -- Initialize user analytics
  INSERT INTO public.user_analytics (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();