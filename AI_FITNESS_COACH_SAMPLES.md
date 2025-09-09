# AI Fitness Coach - Code Samples & API Examples

## 🔌 API EXAMPLES

### Authentication Endpoints

#### POST /api/auth/register
```json
// Request
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "SecurePass123",
  "timezone": "America/New_York"
}

// Response (201)
{
  "userId": 12345,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 12345,
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": false
  }
}
```

#### POST /api/auth/login
```json
// Request
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

// Response (200)
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 12345,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Plan Generation

#### POST /api/plans/generate
```json
// Request
{
  "userId": 12345,
  "intakeFormId": 67890,
  "startDate": "2024-01-15",
  "planType": "WEEKLY",
  "options": {
    "useCache": true,
    "difficulty": "INTERMEDIATE"
  }
}

// Response (202)
{
  "jobId": "job_abc123",
  "planId": 98765,
  "status": "GENERATING",
  "estimatedCompletionTime": "2024-01-15T10:32:00Z"
}
```

#### GET /api/plans/{planId}
```json
// Response (200)
{
  "planId": 98765,
  "status": "ACTIVE",
  "startDate": "2024-01-15",
  "endDate": "2024-01-21",
  "dailyCalorieTarget": 2200,
  "calorie_calculation": {
    "bmr": 1800,
    "tdee": 2400,
    "daily_target": 2200,
    "deficit": 200
  },
  "weekly_workouts": [
    {
      "day": "Monday",
      "title": "Upper Body Strength",
      "duration_min": 45,
      "difficulty": "INTERMEDIATE",
      "warmup": [
        {"name": "Arm Circles", "duration": "30 seconds"},
        {"name": "Light Jogging", "duration": "5 minutes"}
      ],
      "exercises": [
        {
          "name": "Dumbbell Bench Press",
          "sets": 4,
          "reps": "8-10",
          "rest_sec": 90,
          "instructions": "Lower weights to chest level, press up explosively",
          "target_muscles": ["chest", "triceps", "shoulders"]
        },
        {
          "name": "Bent-over Rows",
          "sets": 4,
          "reps": "8-10", 
          "rest_sec": 90,
          "instructions": "Pull dumbbells to ribcage, squeeze shoulder blades",
          "target_muscles": ["back", "biceps"]
        }
      ],
      "cooldown": [
        {"name": "Chest Stretch", "duration": "30 seconds"},
        {"name": "Shoulder Stretch", "duration": "30 seconds"}
      ]
    }
  ],
  "meal_plan": [
    {
      "day": "Monday",
      "meals": [
        {
          "type": "breakfast",
          "name": "Greek Yogurt Berry Bowl",
          "calories": 320,
          "protein": 25,
          "carbs": 35,
          "fat": 8,
          "prep_time_min": 5,
          "ingredients": ["greek yogurt", "mixed berries", "granola", "honey"],
          "instructions": "Mix yogurt with berries, top with granola and drizzle honey"
        },
        {
          "type": "lunch", 
          "name": "Grilled Chicken Salad",
          "calories": 420,
          "protein": 35,
          "carbs": 15,
          "fat": 18,
          "ingredients": ["chicken breast", "mixed greens", "tomatoes", "olive oil"]
        }
      ]
    }
  ],
  "grocery_list": {
    "produce": ["mixed berries", "tomatoes", "mixed greens"],
    "proteins": ["chicken breast", "greek yogurt"],
    "pantry": ["olive oil", "honey", "granola"]
  }
}
```

### Chat Endpoints

#### POST /api/chat/message
```json
// Request
{
  "userId": 12345,
  "message": "Can I substitute dumbbells with resistance bands?",
  "context": {
    "currentWorkout": "upper_body_strength",
    "availableEquipment": ["resistance_bands", "yoga_mat"]
  }
}

// Response (200)
{
  "messageId": "msg_xyz789",
  "response": "Absolutely! Here are great resistance band alternatives:\n\n• Dumbbell Bench Press → Chest Press with bands\n• Bent-over Rows → Seated Rows with bands\n\nAdjust resistance by stepping further from anchor point. Aim for same rep ranges!",
  "suggestions": [
    "Show me the band exercises",
    "How do I set up resistance bands?",
    "What's the next workout?"
  ],
  "modifiedWorkout": {
    "exercises": [
      {
        "name": "Resistance Band Chest Press",
        "sets": 4,
        "reps": "8-10",
        "instructions": "Anchor band behind you, press forward with control"
      }
    ]
  }
}
```

## 📱 FLUTTER CODE SAMPLES

### Authentication BLoC
```dart
// auth_bloc.dart
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepository;
  final TokenStorage _tokenStorage;

  AuthBloc({
    required AuthRepository authRepository,
    required TokenStorage tokenStorage,
  }) : _authRepository = authRepository,
       _tokenStorage = tokenStorage,
       super(AuthInitial()) {
    
    on<AuthLoginRequested>(_onLoginRequested);
    on<AuthRegisterRequested>(_onRegisterRequested);
    on<AuthLogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onLoginRequested(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    
    try {
      final result = await _authRepository.login(
        email: event.email,
        password: event.password,
      );
      
      await _tokenStorage.storeTokens(
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      );
      
      emit(AuthAuthenticated(user: result.user));
    } catch (error) {
      emit(AuthError(message: error.toString()));
    }
  }
}
```

### Intake Form Widget
```dart
// intake_form_page.dart
class IntakeFormPage extends StatefulWidget {
  @override
  _IntakeFormPageState createState() => _IntakeFormPageState();
}

class _IntakeFormPageState extends State<IntakeFormPage> {
  final PageController _pageController = PageController();
  final IntakeFormData _formData = IntakeFormData();
  int _currentPage = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            _buildProgressIndicator(),
            Expanded(
              child: PageView(
                controller: _pageController,
                onPageChanged: (page) => setState(() => _currentPage = page),
                children: [
                  PersonalInfoStep(formData: _formData),
                  PhysicalProfileStep(formData: _formData),
                  FitnessAssessmentStep(formData: _formData),
                  HealthNutritionStep(formData: _formData),
                ],
              ),
            ),
            _buildNavigationButtons(),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressIndicator() {
    return Container(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Step ${_currentPage + 1} of 4'),
          SizedBox(height: 8),
          LinearProgressIndicator(
            value: (_currentPage + 1) / 4,
            backgroundColor: Colors.grey[300],
          ),
        ],
      ),
    );
  }
}
```

### Workout Card Component
```dart
// workout_card.dart
class WorkoutCard extends StatelessWidget {
  final WorkoutDto workout;
  final VoidCallback? onStart;

  const WorkoutCard({
    Key? key,
    required this.workout,
    this.onStart,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.all(16),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    workout.title,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                ),
                _buildStatusChip(),
              ],
            ),
            SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.schedule, size: 16),
                SizedBox(width: 4),
                Text('${workout.durationMin} min'),
                SizedBox(width: 16),
                Icon(Icons.fitness_center, size: 16),
                SizedBox(width: 4),
                Text(workout.difficultyLevel.displayName),
              ],
            ),
            SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: workout.status == WorkoutStatus.scheduled ? onStart : null,
                    icon: Icon(Icons.play_arrow),
                    label: Text(_getButtonText()),
                  ),
                ),
                SizedBox(width: 8),
                IconButton(
                  onPressed: () => _showWorkoutDetails(context),
                  icon: Icon(Icons.info_outline),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip() {
    Color color;
    String text;
    
    switch (workout.status) {
      case WorkoutStatus.scheduled:
        color = Colors.blue;
        text = 'Scheduled';
        break;
      case WorkoutStatus.completed:
        color = Colors.green;
        text = 'Completed';
        break;
      case WorkoutStatus.inProgress:
        color = Colors.orange;
        text = 'In Progress';
        break;
      case WorkoutStatus.skipped:
        color = Colors.grey;
        text = 'Skipped';
        break;
    }

    return Chip(
      label: Text(text, style: TextStyle(color: Colors.white)),
      backgroundColor: color,
    );
  }
}
```

## ☕ SPRING BOOT CODE SAMPLES

### User Controller
```java
@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserProfileDto> getCurrentUser(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        UserProfileDto user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserProfileDto> updateProfile(
            @Valid @RequestBody UserUpdateDto updateDto,
            Authentication authentication) {
        
        Long userId = Long.parseLong(authentication.getName());
        UserProfileDto updatedUser = userService.updateUser(userId, updateDto);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/me/intake")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PlanGenerationJobDto> submitIntakeForm(
            @Valid @RequestBody IntakeFormDto intakeDto,
            Authentication authentication) {
        
        Long userId = Long.parseLong(authentication.getName());
        intakeDto.setUserId(userId);
        
        IntakeForm savedForm = userService.saveIntakeForm(intakeDto);
        PlanGenerationJobDto job = planGenerationService.generatePlan(
            new PlanGenerationRequestDto(userId, savedForm.getId())
        );
        
        return ResponseEntity.accepted().body(job);
    }
}
```

### LLM Service Implementation  
```java
@Service
public class LLMService {

    @Value("${app.openai.api-key}")
    private String apiKey;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public PlanData generateWeeklyPlan(IntakeForm intakeForm) {
        String prompt = buildPrompt(intakeForm);
        String cacheKey = "llm:plan:" + DigestUtils.md5Hex(prompt);
        
        // Check cache first
        PlanData cached = (PlanData) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return cached;
        }

        OpenAIRequest request = OpenAIRequest.builder()
            .model("gpt-4")
            .messages(Arrays.asList(
                new OpenAIMessage("system", getSystemPrompt()),
                new OpenAIMessage("user", prompt)
            ))
            .temperature(0.7)
            .maxTokens(4000)
            .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        try {
            ResponseEntity<OpenAIResponse> response = restTemplate.exchange(
                "https://api.openai.com/v1/chat/completions",
                HttpMethod.POST,
                new HttpEntity<>(request, headers),
                OpenAIResponse.class
            );

            String content = response.getBody().getChoices().get(0).getMessage().getContent();
            PlanData planData = objectMapper.readValue(content, PlanData.class);

            // Cache for 24 hours
            redisTemplate.opsForValue().set(cacheKey, planData, Duration.ofHours(24));

            return planData;

        } catch (Exception e) {
            log.error("Error calling OpenAI API", e);
            throw new LLMServiceException("Failed to generate plan", e);
        }
    }

    private String buildPrompt(IntakeForm form) {
        return String.format("""
            Generate a 7-day fitness and nutrition plan for:
            Age: %d, Sex: %s, Height: %.1fcm, Weight: %.1fkg
            Goal: %s, Activity: %s, Equipment: %s
            Restrictions: %s
            
            Return valid JSON with workout and meal plan data.
            """,
            form.getAge(), form.getSex(), form.getHeightCm(), 
            form.getWeightKg(), form.getPrimaryGoal(), 
            form.getActivityLevel(), form.getEquipment(),
            form.getInjuriesLimitations()
        );
    }
}
```

### Plan Generation Worker
```java
@Component
public class PlanGenerationWorker {

    @Autowired
    private LLMService llmService;

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private NotificationService notificationService;

    @RabbitListener(queues = "plan.generation.queue")
    @Transactional
    public void processPlanGeneration(PlanGenerationJob job) {
        try {
            log.info("Processing plan generation for user: {}", job.getUserId());

            // Get intake form
            IntakeForm intakeForm = intakeFormRepository.findById(job.getIntakeFormId())
                .orElseThrow(() -> new EntityNotFoundException("Intake form not found"));

            // Generate plan via LLM
            PlanData planData = llmService.generateWeeklyPlan(intakeForm);

            // Save plan
            Plan plan = planRepository.findById(job.getPlanId())
                .orElseThrow(() -> new EntityNotFoundException("Plan not found"));
            
            plan.setPlanData(objectMapper.writeValueAsString(planData));
            plan.setStatus(PlanStatus.ACTIVE);
            plan.setDailyCalorieTarget(planData.getCalorieCalculation().getDailyTarget());
            planRepository.save(plan);

            // Create workout and meal entities
            createWorkoutEntities(plan, planData);
            createMealEntities(plan, planData);

            // Send success notification
            notificationService.sendPlanReadyNotification(job.getUserId(), plan.getId());

            log.info("Successfully generated plan for user: {}", job.getUserId());

        } catch (Exception e) {
            log.error("Error generating plan for job: {}", job, e);
            
            // Update plan status to failed
            planRepository.findById(job.getPlanId()).ifPresent(plan -> {
                plan.setStatus(PlanStatus.FAILED);
                planRepository.save(plan);
            });
            
            // Send error notification
            notificationService.sendPlanErrorNotification(job.getUserId());
        }
    }

    private void createWorkoutEntities(Plan plan, PlanData planData) {
        for (WorkoutData workoutData : planData.getWeeklyWorkouts()) {
            Workout workout = new Workout();
            workout.setPlan(plan);
            workout.setUserId(plan.getUserId());
            workout.setWorkoutDate(plan.getStartDate().plusDays(workoutData.getDayOffset()));
            workout.setTitle(workoutData.getTitle());
            workout.setDurationMin(workoutData.getDurationMin());
            workout.setWorkoutData(objectMapper.writeValueAsString(workoutData));
            workout.setStatus(WorkoutStatus.SCHEDULED);
            
            workoutRepository.save(workout);
        }
    }
}
```

## 🗄️ DATABASE SEED DATA

### Sample Users
```sql
INSERT INTO users (email, password_hash, name, timezone) VALUES
('demo@fitforge.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqttf98.fm/AZfG/1qONlHa', 'Demo User', 'America/New_York'),
('jane.doe@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqttf98.fm/AZfG/1qONlHa', 'Jane Doe', 'Europe/London');

INSERT INTO intake_forms (user_id, age, sex, height_cm, weight_kg, goal_weight_kg, activity_level, training_styles, days_per_week, session_minutes, equipment, fitness_level, primary_goal, motivation_style) VALUES
(1, 28, 'MALE', 175.0, 78.0, 70.0, 'MODERATE', '["STRENGTH", "HIIT"]', 4, 45, '["DUMBBELLS", "BENCH"]', 'INTERMEDIATE', 'LOSE_WEIGHT', 'DATA_DRIVEN'),
(2, 32, 'FEMALE', 165.0, 65.0, 60.0, 'LIGHT', '["YOGA", "BODYWEIGHT"]', 3, 30, '["NONE"]', 'BEGINNER', 'GENERAL_HEALTH', 'GENTLE');
```

This comprehensive code sample collection provides concrete, working examples that developers can directly implement and modify for the AI Fitness Coach application.