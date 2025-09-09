# AI Fitness Coach App - Master Implementation Blueprint

## 🎯 EXECUTIVE SUMMARY

**App Name:** FitForge  
**Vision:** Personalized AI-powered fitness coaching that adapts to user progress and preferences  
**Target:** Busy professionals seeking effective, personalized fitness guidance  
**Core Value:** "Your personal trainer + nutritionist in your pocket - adaptive, intelligent, available 24/7"

## 📋 MVP FEATURE CHECKLIST

### ✅ Core Features

- [ ] User Authentication (JWT + OAuth)
- [ ] Comprehensive Intake Form (20+ questions)
- [ ] AI Plan Generation (Workouts + Meals)
- [ ] Real-time Coach Chat
- [ ] Progress Tracking & Analytics
- [ ] Push Notifications
- [ ] PDF Export (meal plans, grocery lists)
- [ ] Adaptive Plan Modifications

### ✅ Technical Requirements

- [ ] Flutter Mobile App (iOS/Android)
- [ ] Java Spring Boot Backend
- [ ] MySQL Database with Redis Cache
- [ ] LLM Integration (OpenAI/Azure)
- [ ] Background Job Processing
- [ ] Admin Dashboard
- [ ] CI/CD Pipeline
- [ ] Security & Privacy Compliance

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Flutter App │    │ Admin Panel │    │Push Service │
│   (Mobile)  │    │   (React)   │    │    (FCM)    │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       │ REST API         │ REST API         │ HTTP
       │                  │                  │
┌──────▼──────────────────▼──────────────────▼──────┐
│              Load Balancer (Nginx)                │
└──────┬─────────────────────────────────────────────┘
       │
┌──────▼──────┐ ┌─────────────┐ ┌─────────────────┐
│Spring Boot  │ │   Redis     │ │   RabbitMQ      │
│API Server   │◄┤Cache/Session│ │Message Queue    │
└──────┬──────┘ └─────────────┘ └─────────┬───────┘
       │                                  │
┌──────▼──────┐ ┌─────────────┐          │
│   MySQL     │ │File Storage │          │
│  Database   │ │    (S3)     │          │
└─────────────┘ └─────────────┘          │
                                         │
┌────────────────────────────────────────▼─────────┐
│            Background Workers                    │
│ Plan Generation | LLM Processing | Notifications │
└────────────┬─────────────────────────────────────┘
             │
    ┌────────▼────────┐
    │   LLM Service   │
    │ (OpenAI/Azure)  │
    └─────────────────┘
```

### Component Responsibilities

**Flutter App**: User interface, local state management, offline capabilities
**Spring Boot API**: Business logic, authentication, data validation, job orchestration
**MySQL**: Primary data storage with ACID compliance
**Redis**: Session management, LLM response caching, rate limiting
**RabbitMQ**: Asynchronous job processing (plan generation, notifications)
**LLM Service**: AI-powered plan generation and chat responses
**Admin Panel**: Content management, user support, analytics dashboard

---

## 📱 USER FLOWS

### 1. Onboarding Flow

```
App Launch → Welcome Screen → Sign Up/Login →
Email Verification → Intake Form (20 questions) →
Plan Generation (60s loading) → Welcome to Your Plan →
Home Dashboard
```

### 2. Daily Usage Flow

```
Home Dashboard → Today's Schedule → Start Workout →
Exercise Tracking → Workout Complete → Log Meals →
Progress Updates → Tomorrow Preview
```

### 3. Coach Interaction Flow

```
Question/Issue → Open Chat → AI Response →
Plan Modification (if needed) → Updated Schedule →
Confirmation & Motivation
```

### 4. Weekly Review Flow

```
Week Summary → Progress Analysis → Plan Effectiveness →
User Feedback → Adaptive Modifications →
New Week Generation
```

---

## 📝 INTAKE FORM - TYPEFORM STYLE

### Personal Info (4 questions)

1. **Full Name** (text, required)
2. **Email** (email, auto-filled if logged in)
3. **Phone** (optional, for reminders)
4. **Timezone** (auto-detect, confirm)

### Physical Profile (6 questions)

5. **Age** (18-100, slider)
6. **Biological Sex** (Male/Female/Other/Prefer not to say)
7. **Height** (cm/ft toggle, required)
8. **Current Weight** (kg/lbs toggle, required)
9. **Goal Weight** (kg/lbs toggle, optional)
10. **Target Timeline** (date picker, optional)

### Fitness Assessment (6 questions)

11. **Activity Level**
    - Sedentary (desk job, little exercise)
    - Light (light exercise 1-3 days/week)
    - Moderate (moderate exercise 3-5 days/week)
    - Active (hard exercise 6-7 days/week)
    - Very Active (physical job + exercise)

12. **Training Preferences** (multi-select)
    - Strength Training, HIIT, Cardio, Yoga, Bodyweight, Mixed

13. **Workout Frequency** (1-7 days/week, slider)

14. **Session Duration** (15/30/45/60/90+ minutes)

15. **Available Equipment** (multi-select)
    - None, Dumbbells, Resistance Bands, Full Gym, etc.

16. **Fitness Experience** (Beginner/Intermediate/Advanced)

### Health & Nutrition (4 questions)

17. **Injuries/Limitations** (textarea, optional)
18. **Dietary Preferences** (Vegetarian/Vegan/Keto/etc.)
19. **Food Allergies** (common allergens checklist + text)
20. **Primary Goal** (Weight Loss/Muscle Gain/Maintenance/Health)

---

## 🤖 LLM INTEGRATION

### System Prompt Template

```
You are FitForge AI, a professional fitness coach and nutritionist.

CORE PRINCIPLES:
- Evidence-based recommendations only
- Safety first - never recommend potentially harmful exercises
- Respect user limitations and equipment constraints
- Provide clear, actionable guidance
- NEVER give medical advice - refer to healthcare professionals

OUTPUT FORMAT: Always return valid JSON matching the requested schema
SAFETY RULES: Include warm-up, cool-down, proper form cues, modifications for all fitness levels
NUTRITION: Focus on balanced, realistic meal plans within calorie targets
```

### Plan Generation Prompt

```
Generate a 7-day personalized fitness and nutrition plan for:

USER PROFILE:
{
  "age": {{age}}, "sex": "{{sex}}", "height_cm": {{height}},
  "weight_kg": {{weight}}, "goal_weight_kg": {{goal_weight}},
  "activity_level": "{{activity}}", "fitness_level": "{{fitness_level}}",
  "training_preferences": {{training_prefs}}, "days_per_week": {{days}},
  "session_minutes": {{duration}}, "equipment": {{equipment}},
  "injuries": "{{injuries}}", "diet_preferences": {{diet_prefs}},
  "primary_goal": "{{goal}}"
}

REQUIREMENTS:
1. Calculate TDEE using Mifflin-St Jeor + activity multiplier
2. Create appropriate calorie deficit/surplus (max 500 cal)
3. Design progressive workouts respecting equipment/time constraints
4. Plan balanced meals meeting macro targets
5. Include grocery list organized by category
6. Add form cues and exercise modifications

RESPONSE SCHEMA:
{
  "plan_id": "string",
  "user_summary": "brief profile summary",
  "calorie_calculation": {
    "bmr": number, "tdee": number, "daily_target": number
  },
  "weekly_workouts": [
    {
      "day": "Monday", "title": "string", "duration_min": number,
      "warmup": [{"name": "string", "duration": "string"}],
      "exercises": [{"name": "string", "sets": number, "reps": "string", "rest_sec": number, "instructions": "string"}],
      "cooldown": [{"name": "string", "duration": "string"}]
    }
  ],
  "meal_plan": [
    {
      "day": "Monday",
      "meals": [
        {"type": "breakfast", "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number, "ingredients": ["string"]}
      ]
    }
  ],
  "grocery_list": {
    "produce": ["string"], "proteins": ["string"], "grains": ["string"], "dairy": ["string"]
  },
  "weekly_tips": ["string"],
  "check_in_questions": ["string"]
}
```

---

## 💾 DATABASE SCHEMA

### Core Tables (MySQL)

```sql
-- Users table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Intake forms table
CREATE TABLE intake_forms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    form_data JSON NOT NULL, -- Complete intake responses
    calculated_bmr DECIMAL(8,2),
    calculated_tdee DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Plans table
CREATE TABLE plans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    intake_form_id BIGINT NOT NULL,
    plan_type ENUM('WEEKLY', 'MONTHLY') DEFAULT 'WEEKLY',
    status ENUM('GENERATING', 'ACTIVE', 'COMPLETED') DEFAULT 'GENERATING',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    plan_data JSON NOT NULL, -- Complete LLM response
    daily_calorie_target INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Workouts table
CREATE TABLE workouts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    plan_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    workout_date DATE NOT NULL,
    workout_data JSON NOT NULL,
    status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED') DEFAULT 'SCHEDULED',
    completed_at TIMESTAMP,
    duration_min INT,
    calories_burned INT,
    user_rating INT CHECK (user_rating >= 1 AND user_rating <= 5),
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

-- Progress tracking table
CREATE TABLE progress_entries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    entry_date DATE NOT NULL,
    weight_kg DECIMAL(5,2),
    body_measurements JSON, -- chest, waist, arms, etc.
    photo_urls JSON, -- progress photos
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, entry_date)
);

-- Chat history table
CREATE TABLE chat_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    message_type ENUM('USER', 'ASSISTANT') NOT NULL,
    message_content TEXT NOT NULL,
    context_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔌 API ENDPOINTS

### Authentication

```
POST /api/auth/register          - User registration
POST /api/auth/login             - User login
POST /api/auth/refresh           - Refresh access token
POST /api/auth/logout            - Logout user
POST /api/auth/verify-email      - Email verification
POST /api/auth/forgot-password   - Password reset request
```

### User Management

```
GET    /api/users/me             - Get current user profile
PUT    /api/users/me             - Update user profile
DELETE /api/users/me             - Delete user account
POST   /api/users/me/intake      - Submit intake form
GET    /api/users/me/stats       - Get user statistics
```

### Plan Management

```
POST /api/plans/generate         - Generate new plan
GET  /api/plans/{planId}         - Get specific plan
GET  /api/users/me/plans         - Get user's plans
PUT  /api/plans/{planId}/status  - Update plan status
```

### Workouts

```
GET  /api/workouts/today         - Get today's workout
POST /api/workouts/{id}/start    - Start workout session
POST /api/workouts/{id}/complete - Complete workout
GET  /api/users/me/workouts      - Get workout history
```

### Coach Chat

```
POST /api/chat/message           - Send message to AI coach
GET  /api/chat/history           - Get chat history
POST /api/chat/feedback          - Provide feedback on response
```

### Progress Tracking

```
POST /api/progress               - Add progress entry
GET  /api/progress               - Get progress history
PUT  /api/progress/{id}          - Update progress entry
GET  /api/progress/summary       - Get progress summary/charts
```

---

## 🔧 TECH STACK SPECIFICATION

### Mobile App (Flutter)

```yaml
dependencies:
  flutter: ^3.16.0
  flutter_bloc: ^8.1.3 # State management
  dio: ^5.3.2 # HTTP client
  hive: ^2.2.3 # Local storage
  hive_flutter: ^1.1.0
  shared_preferences: ^2.2.2 # User preferences
  firebase_messaging: ^14.7.4 # Push notifications
  firebase_core: ^2.24.2
  image_picker: ^1.0.4 # Progress photos
  permission_handler: ^11.0.1 # Permissions
  flutter_secure_storage: ^9.0.0 # Secure token storage
  charts_flutter: ^0.12.0 # Progress charts
  pdf: ^3.10.4 # PDF generation
  path_provider: ^2.1.1 # File system access
  cached_network_image: ^3.3.0 # Image caching
  timeago: ^3.4.0 # Time formatting
  intl: ^0.18.1 # Internationalization

dev_dependencies:
  flutter_test: ^3.16.0
  flutter_lints: ^3.0.0
  mockito: ^5.4.2 # Testing mocks
  bloc_test: ^9.1.4 # BLoC testing
```

### Backend (Spring Boot)

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>3.1.5</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-amqp</artifactId>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.2.0</version>
    </dependency>
</dependencies>
```

---

This blueprint provides the foundation. Would you like me to continue with specific implementation details for any particular component (Flutter UI code, Spring Boot controllers, deployment configs, etc.)?
