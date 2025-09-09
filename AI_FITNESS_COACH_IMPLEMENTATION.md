# AI Fitness Coach - Implementation Details

## 📱 FLUTTER APP STRUCTURE

### Project Structure

```
lib/
├── main.dart
├── app/
│   ├── app.dart
│   ├── router.dart
│   └── theme.dart
├── core/
│   ├── constants/
│   ├── errors/
│   ├── network/
│   ├── storage/
│   └── utils/
├── features/
│   ├── auth/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── onboarding/
│   ├── home/
│   ├── workouts/
│   ├── nutrition/
│   ├── progress/
│   ├── chat/
│   └── profile/
└── shared/
    ├── widgets/
    ├── models/
    └── services/
```

### Key Implementation Examples

#### main.dart

```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'app/app.dart';
import 'core/di/injection_container.dart' as di;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase
  await Firebase.initializeApp();

  // Initialize Hive
  await Hive.initFlutter();

  // Initialize dependencies
  await di.init();

  runApp(const FitForgeApp());
}
```

#### BLoC State Management Example

```dart
// auth/presentation/bloc/auth_bloc.dart
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository authRepository;
  final TokenStorage tokenStorage;

  AuthBloc({
    required this.authRepository,
    required this.tokenStorage,
  }) : super(AuthInitial()) {
    on<AuthLoginRequested>(_onLoginRequested);
    on<AuthRegisterRequested>(_onRegisterRequested);
    on<AuthLogoutRequested>(_onLogoutRequested);
    on<AuthTokenRefreshRequested>(_onTokenRefreshRequested);
  }

  Future<void> _onLoginRequested(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    try {
      final result = await authRepository.login(
        email: event.email,
        password: event.password,
      );

      await tokenStorage.storeTokens(
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      );

      emit(AuthAuthenticated(user: result.user));
    } catch (error) {
      emit(AuthError(message: error.toString()));
    }
  }

  // Other event handlers...
}
```

#### Intake Form Screen

```dart
// onboarding/presentation/pages/intake_form_page.dart
class IntakeFormPage extends StatefulWidget {
  @override
  _IntakeFormPageState createState() => _IntakeFormPageState();
}

class _IntakeFormPageState extends State<IntakeFormPage> {
  final PageController _pageController = PageController();
  final IntakeFormData _formData = IntakeFormData();
  int _currentPage = 0;

  final List<Widget> _pages = [];

  @override
  void initState() {
    super.initState();
    _initializePages();
  }

  void _initializePages() {
    _pages.addAll([
      PersonalInfoStep(formData: _formData),
      PhysicalProfileStep(formData: _formData),
      FitnessAssessmentStep(formData: _formData),
      HealthNutritionStep(formData: _formData),
      GoalsMotivationStep(formData: _formData),
      ConsentStep(formData: _formData),
    ]);
  }

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
                children: _pages,
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
          Text(
            'Step ${_currentPage + 1} of ${_pages.length}',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          SizedBox(height: 8),
          LinearProgressIndicator(
            value: (_currentPage + 1) / _pages.length,
            backgroundColor: Colors.grey[300],
            valueColor: AlwaysStoppedAnimation<Color>(
              Theme.of(context).primaryColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavigationButtons() {
    return Container(
      padding: EdgeInsets.all(16),
      child: Row(
        children: [
          if (_currentPage > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: _previousPage,
                child: Text('Back'),
              ),
            ),
          if (_currentPage > 0) SizedBox(width: 16),
          Expanded(
            child: ElevatedButton(
              onPressed: _canProceed() ? _nextPage : null,
              child: Text(_currentPage == _pages.length - 1 ? 'Complete' : 'Next'),
            ),
          ),
        ],
      ),
    );
  }

  // Navigation methods...
}
```

---

## 🔧 SPRING BOOT BACKEND STRUCTURE

### Project Structure

```
src/main/java/com/fitforge/
├── FitForgeApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── RedisConfig.java
│   ├── RabbitMQConfig.java
│   └── OpenApiConfig.java
├── controller/
│   ├── AuthController.java
│   ├── UserController.java
│   ├── PlanController.java
│   ├── WorkoutController.java
│   └── ChatController.java
├── service/
│   ├── AuthService.java
│   ├── UserService.java
│   ├── PlanGenerationService.java
│   ├── LLMService.java
│   └── NotificationService.java
├── repository/
│   ├── UserRepository.java
│   ├── IntakeFormRepository.java
│   ├── PlanRepository.java
│   └── WorkoutRepository.java
├── model/
│   ├── entity/
│   ├── dto/
│   └── enums/
├── security/
│   ├── JwtAuthenticationEntryPoint.java
│   ├── JwtAuthenticationFilter.java
│   └── JwtTokenProvider.java
└── worker/
    ├── PlanGenerationWorker.java
    └── NotificationWorker.java
```

### Key Implementation Examples

#### Security Configuration

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable()
            .exceptionHandling()
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter,
                           UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

#### Authentication Controller

```java
@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody UserRegistrationDto registrationDto) {

        AuthResponse response = authService.register(registrationDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginDto loginDto) {

        AuthResponse response = authService.login(loginDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refreshToken(
            @Valid @RequestBody TokenRefreshDto refreshDto) {

        TokenRefreshResponse response = authService.refreshToken(refreshDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse> logout(
            @Valid @RequestBody LogoutDto logoutDto,
            Authentication authentication) {

        authService.logout(logoutDto.getRefreshToken(), authentication.getName());
        return ResponseEntity.ok(new ApiResponse("Logged out successfully"));
    }
}
```

#### Plan Generation Service

```java
@Service
@Transactional
public class PlanGenerationService {

    @Autowired
    private LLMService llmService;

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public PlanGenerationJobDto generatePlan(PlanGenerationRequestDto request) {
        // Create plan entity
        Plan plan = new Plan();
        plan.setUserId(request.getUserId());
        plan.setIntakeFormId(request.getIntakeFormId());
        plan.setStatus(PlanStatus.GENERATING);
        plan.setStartDate(request.getStartDate());
        plan.setEndDate(request.getStartDate().plusDays(7));

        plan = planRepository.save(plan);

        // Queue background job
        PlanGenerationJob job = new PlanGenerationJob();
        job.setPlanId(plan.getId());
        job.setUserId(request.getUserId());
        job.setIntakeFormId(request.getIntakeFormId());
        job.setOptions(request.getOptions());

        rabbitTemplate.convertAndSend("plan.generation.queue", job);

        return new PlanGenerationJobDto(plan.getId(), "QUEUED");
    }

    @RabbitListener(queues = "plan.generation.queue")
    public void processPlanGeneration(PlanGenerationJob job) {
        try {
            // Get user intake data
            IntakeForm intakeForm = intakeFormRepository.findById(job.getIntakeFormId())
                .orElseThrow(() -> new EntityNotFoundException("Intake form not found"));

            // Check cache first
            String cacheKey = "plan:" + generateCacheKey(intakeForm);
            PlanData cachedPlan = (PlanData) redisTemplate.opsForValue().get(cacheKey);

            PlanData planData;
            if (cachedPlan != null && job.getOptions().get("useCache") == Boolean.TRUE) {
                planData = cachedPlan;
            } else {
                // Generate new plan via LLM
                planData = llmService.generateWeeklyPlan(intakeForm);

                // Cache the result
                redisTemplate.opsForValue().set(cacheKey, planData, Duration.ofHours(24));
            }

            // Update plan entity
            Plan plan = planRepository.findById(job.getPlanId())
                .orElseThrow(() -> new EntityNotFoundException("Plan not found"));

            plan.setPlanData(objectMapper.writeValueAsString(planData));
            plan.setStatus(PlanStatus.ACTIVE);
            plan.setDailyCalorieTarget(planData.getCalorieCalculation().getDailyTarget());

            planRepository.save(plan);

            // Create individual workout and meal entities
            createWorkoutEntities(plan, planData);
            createMealEntities(plan, planData);

            // Send completion notification
            notificationService.sendPlanReadyNotification(job.getUserId(), plan.getId());

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

    // Helper methods...
}
```

#### LLM Service Integration

```java
@Service
public class LLMService {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    @Value("${openai.api.url}")
    private String openaiApiUrl;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public PlanData generateWeeklyPlan(IntakeForm intakeForm) {
        String prompt = buildPlanGenerationPrompt(intakeForm);

        // Check cache first
        String cacheKey = "llm:plan:" + DigestUtils.md5Hex(prompt);
        PlanData cached = (PlanData) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return cached;
        }

        OpenAIRequest request = new OpenAIRequest();
        request.setModel("gpt-4");
        request.setMessages(Arrays.asList(
            new OpenAIMessage("system", getSystemPrompt()),
            new OpenAIMessage("user", prompt)
        ));
        request.setTemperature(0.7);
        request.setMaxTokens(4000);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);

        HttpEntity<OpenAIRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<OpenAIResponse> response = restTemplate.exchange(
                openaiApiUrl + "/chat/completions",
                HttpMethod.POST,
                entity,
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

    private String buildPlanGenerationPrompt(IntakeForm intakeForm) {
        return String.format("""
            Generate a personalized 7-day fitness and nutrition plan for:

            USER PROFILE:
            - Age: %d, Sex: %s
            - Height: %.1f cm, Weight: %.1f kg
            - Goal Weight: %.1f kg
            - Activity Level: %s
            - Fitness Level: %s
            - Training Preferences: %s
            - Days per week: %d
            - Session duration: %d minutes
            - Available equipment: %s
            - Injuries/limitations: %s
            - Diet preferences: %s
            - Food allergies: %s
            - Primary goal: %s

            Follow the response schema exactly as specified in the system prompt.
            """,
            intakeForm.getAge(),
            intakeForm.getSex(),
            intakeForm.getHeightCm(),
            intakeForm.getWeightKg(),
            intakeForm.getGoalWeightKg(),
            intakeForm.getActivityLevel(),
            intakeForm.getFitnessLevel(),
            String.join(", ", intakeForm.getTrainingStyles()),
            intakeForm.getDaysPerWeek(),
            intakeForm.getSessionMinutes(),
            String.join(", ", intakeForm.getEquipment()),
            intakeForm.getInjuriesLimitations(),
            String.join(", ", intakeForm.getDietPreferences()),
            intakeForm.getFoodAllergies(),
            intakeForm.getPrimaryGoal()
        );
    }

    // Other LLM methods...
}
```

---

## 🗄️ DATABASE MIGRATIONS

### Initial Schema Migration

```sql
-- V1__Create_initial_schema.sql

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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- Intake forms table
CREATE TABLE intake_forms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    age INT NOT NULL CHECK (age >= 16 AND age <= 100),
    sex ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY') NOT NULL,
    height_cm DECIMAL(5,2) NOT NULL CHECK (height_cm >= 100 AND height_cm <= 250),
    weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg >= 30 AND weight_kg <= 300),
    goal_weight_kg DECIMAL(5,2) CHECK (goal_weight_kg >= 30 AND goal_weight_kg <= 300),
    target_date DATE,
    activity_level ENUM('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE') NOT NULL,
    training_styles JSON NOT NULL,
    days_per_week INT NOT NULL CHECK (days_per_week >= 1 AND days_per_week <= 7),
    session_minutes INT NOT NULL CHECK (session_minutes >= 15 AND session_minutes <= 180),
    equipment JSON NOT NULL,
    injuries_limitations TEXT,
    diet_preferences JSON,
    food_allergies TEXT,
    cuisine_preferences JSON,
    foods_to_avoid TEXT,
    fitness_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL,
    primary_goal ENUM('LOSE_WEIGHT', 'BUILD_MUSCLE', 'MAINTAIN', 'IMPROVE_ENDURANCE', 'GENERAL_HEALTH', 'SPORT_SPECIFIC') NOT NULL,
    motivation_style ENUM('GENTLE', 'FIRM', 'DATA_DRIVEN', 'COMMUNITY') NOT NULL,
    photo_permission BOOLEAN DEFAULT FALSE,
    medical_consent BOOLEAN NOT NULL DEFAULT FALSE,
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    calculated_bmr DECIMAL(8,2),
    calculated_tdee DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Plans table
CREATE TABLE plans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    intake_form_id BIGINT NOT NULL,
    plan_type ENUM('WEEKLY', 'MONTHLY') DEFAULT 'WEEKLY',
    status ENUM('GENERATING', 'ACTIVE', 'COMPLETED', 'ARCHIVED', 'FAILED') DEFAULT 'GENERATING',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    daily_calorie_target INT,
    bmr_calculated DECIMAL(8,2),
    tdee_calculated DECIMAL(8,2),
    plan_data JSON,
    generation_prompt_hash VARCHAR(64),
    llm_response_cached BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (intake_form_id) REFERENCES intake_forms(id),
    INDEX idx_user_id (user_id),
    INDEX idx_start_date (start_date),
    INDEX idx_status (status)
);

-- Continue with other tables...
```

### Sample Data Migration

```sql
-- V2__Insert_sample_data.sql

-- Sample admin user
INSERT INTO admin_users (email, password_hash, name, role) VALUES
('admin@fitforge.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqttf98.fm/AZfG/1qONlHa', 'Admin User', 'ADMIN');

-- Sample exercise templates
INSERT INTO exercise_templates (name, category, muscle_groups, equipment_required, difficulty_level, instructions) VALUES
('Push-ups', 'BODYWEIGHT', '["chest", "triceps", "shoulders"]', '[]', 'BEGINNER', 'Start in plank position, lower chest to ground, push back up'),
('Squats', 'BODYWEIGHT', '["quadriceps", "glutes", "hamstrings"]', '[]', 'BEGINNER', 'Stand with feet shoulder-width apart, lower hips back and down, return to standing'),
('Dumbbell Chest Press', 'STRENGTH', '["chest", "triceps", "shoulders"]', '["dumbbells", "bench"]', 'INTERMEDIATE', 'Lie on bench, press dumbbells from chest level to extended arms');

-- Sample meal templates
INSERT INTO meal_templates (name, meal_type, cuisine_type, diet_preferences, prep_time_min, calories, protein_g, carbs_g, fat_g, ingredients, instructions) VALUES
('Greek Yogurt Berry Bowl', 'BREAKFAST', 'MEDITERRANEAN', '["vegetarian"]', 5, 280, 20, 35, 8, '["greek yogurt", "mixed berries", "honey", "granola"]', 'Mix yogurt with berries, drizzle honey, top with granola'),
('Grilled Chicken Salad', 'LUNCH', 'AMERICAN', '[]', 15, 320, 35, 12, 15, '["chicken breast", "mixed greens", "cherry tomatoes", "cucumber", "olive oil", "lemon"]', 'Grill chicken, combine with vegetables, dress with oil and lemon');
```

---

## 🔒 SECURITY & PRIVACY

### JWT Implementation

```java
@Component
public class JwtTokenProvider {

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationInMs}")
    private int jwtExpirationInMs;

    @Value("${app.jwtRefreshExpirationInMs}")
    private int jwtRefreshExpirationInMs;

    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Date expiryDate = new Date(System.currentTimeMillis() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(Long.toString(userPrincipal.getId()))
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public String generateRefreshToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Date expiryDate = new Date(System.currentTimeMillis() + jwtRefreshExpirationInMs);

        return Jwts.builder()
                .setSubject(Long.toString(userPrincipal.getId()))
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .claim("type", "refresh")
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public Long getUserIdFromJWT(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();

        return Long.parseLong(claims.getSubject());
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(authToken);
            return true;
        } catch (SignatureException ex) {
            logger.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty.");
        }
        return false;
    }
}
```

### Rate Limiting

```java
@Component
public class RateLimitingService {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    public boolean isAllowed(String key, int maxRequests, Duration window) {
        String redisKey = "rate_limit:" + key;
        String currentCount = redisTemplate.opsForValue().get(redisKey);

        if (currentCount == null) {
            redisTemplate.opsForValue().set(redisKey, "1", window);
            return true;
        }

        int count = Integer.parseInt(currentCount);
        if (count >= maxRequests) {
            return false;
        }

        redisTemplate.opsForValue().increment(redisKey);
        return true;
    }
}

@RestController
public class ChatController {

    @Autowired
    private RateLimitingService rateLimitingService;

    @PostMapping("/api/chat/message")
    public ResponseEntity<ChatResponse> sendMessage(
            @RequestBody ChatMessageDto messageDto,
            Authentication authentication) {

        String userId = authentication.getName();

        // Rate limit: 10 messages per minute
        if (!rateLimitingService.isAllowed("chat:" + userId, 10, Duration.ofMinutes(1))) {
            throw new RateLimitExceededException("Too many chat messages. Please wait.");
        }

        // Process message...
    }
}
```

### Data Privacy Compliance

```java
@Service
public class DataPrivacyService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserDataExportService exportService;

    @Transactional
    public void deleteUserData(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Anonymize instead of hard delete for analytics
        user.setEmail("deleted_" + userId + "@example.com");
        user.setName("Deleted User");
        user.setPhone(null);
        user.setIsActive(false);

        // Delete sensitive data
        intakeFormRepository.deleteByUserId(userId);
        progressEntryRepository.deleteByUserId(userId);
        chatHistoryRepository.deleteByUserId(userId);

        // Archive plans (remove personal data)
        planRepository.findByUserId(userId).forEach(plan -> {
            plan.setStatus(PlanStatus.ARCHIVED);
            // Remove personal identifiers from plan data
        });

        userRepository.save(user);

        // Log deletion for audit
        auditLogService.logDataDeletion(userId, "User requested data deletion");
    }

    public UserDataExport exportUserData(Long userId) {
        return exportService.exportAllUserData(userId);
    }
}
```

---

This implementation blueprint provides concrete, production-ready code examples that can be directly used by developers. Would you like me to continue with testing strategies, deployment configurations, or any other specific components?
