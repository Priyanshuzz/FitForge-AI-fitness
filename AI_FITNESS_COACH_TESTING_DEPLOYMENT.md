# AI Fitness Coach - Testing & Deployment Guide

## 🧪 TESTING STRATEGY

### Backend Testing Framework

#### Unit Tests (Spring Boot)

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @InjectMocks private UserService userService;

    @Test
    void shouldCreateUserSuccessfully() {
        // Given
        UserRegistrationDto dto = new UserRegistrationDto();
        dto.setEmail("test@example.com");
        dto.setPassword("password123");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");

        // When & Then
        assertDoesNotThrow(() -> userService.createUser(dto));
        verify(userRepository).save(any(User.class));
    }
}

@ExtendWith(MockitoExtension.class)
class PlanGenerationServiceTest {
    @Mock private LLMService llmService;
    @Mock private PlanRepository planRepository;
    @InjectMocks private PlanGenerationService service;

    @Test
    void shouldGeneratePlanSuccessfully() {
        // Test plan generation logic
        IntakeForm form = createSampleIntakeForm();
        PlanData mockData = createMockPlanData();

        when(llmService.generateWeeklyPlan(form)).thenReturn(mockData);

        // Verify plan creation
        assertNotNull(service.processPlanGeneration(createJob()));
    }
}
```

#### Integration Tests

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(locations = "classpath:application-test.properties")
class AuthControllerIntegrationTest {

    @Autowired private TestRestTemplate restTemplate;
    @Autowired private UserRepository userRepository;

    @Test
    void shouldRegisterAndLoginSuccessfully() {
        // Registration test
        UserRegistrationDto dto = new UserRegistrationDto();
        dto.setEmail("test@example.com");
        dto.setPassword("SecurePass123");

        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
            "/api/auth/register", dto, AuthResponse.class);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody().getAccessToken());
    }
}
```

### Frontend Testing (Flutter)

#### Widget Tests

```dart
// test/widgets/intake_form_test.dart
void main() {
  group('IntakeFormPage', () {
    testWidgets('displays personal info step initially', (tester) async {
      await tester.pumpWidget(MaterialApp(home: IntakeFormPage()));

      expect(find.text('Personal Information'), findsOneWidget);
      expect(find.text('Step 1 of 6'), findsOneWidget);
    });

    testWidgets('validates required fields', (tester) async {
      await tester.pumpWidget(MaterialApp(home: IntakeFormPage()));

      await tester.tap(find.text('Next'));
      await tester.pump();

      expect(find.text('This field is required'), findsWidgets);
    });
  });
}
```

#### BLoC Tests

```dart
// test/blocs/auth_bloc_test.dart
import 'package:bloc_test/bloc_test.dart';

void main() {
  group('AuthBloc', () {
    late MockAuthRepository mockRepository;

    setUp(() => mockRepository = MockAuthRepository());

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthAuthenticated] on successful login',
      build: () {
        when(mockRepository.login(any, any))
            .thenAnswer((_) async => AuthResult(user: testUser, token: 'token'));
        return AuthBloc(authRepository: mockRepository);
      },
      act: (bloc) => bloc.add(AuthLoginRequested('email', 'password')),
      expect: () => [AuthLoading(), AuthAuthenticated(testUser)],
    );
  });
}
```

### Testing Checklist

- [ ] Unit tests: 80%+ coverage for services
- [ ] Integration tests: All API endpoints
- [ ] Widget tests: Critical UI components
- [ ] End-to-end tests: Core user journeys
- [ ] Performance tests: API response times
- [ ] Security tests: Authentication & authorization
- [ ] LLM tests: Prompt validation & response parsing

---

## 🚀 DEPLOYMENT CONFIGURATION

### Docker Setup

#### Backend Dockerfile

```dockerfile
FROM openjdk:17-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN ./gradlew build -x test

FROM openjdk:17-jre-alpine
WORKDIR /app
RUN addgroup -g 1001 fitforge && adduser -S fitforge -u 1001
COPY --from=build /app/build/libs/*.jar app.jar
RUN chown fitforge:fitforge app.jar
USER fitforge
EXPOSE 8080
HEALTHCHECK --interval=30s CMD curl -f http://localhost:8080/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: fitforge
      MYSQL_USER: fitforge
      MYSQL_PASSWORD: password
    ports: ['3306:3306']
    volumes: [mysql_data:/var/lib/mysql]

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass password
    ports: ['6379:6379']

  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: fitforge
      RABBITMQ_DEFAULT_PASS: password
    ports: ['5672:5672', '15672:15672']

  backend:
    build: .
    environment:
      SPRING_PROFILES_ACTIVE: docker
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/fitforge
      SPRING_REDIS_HOST: redis
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    ports: ['8080:8080']
    depends_on: [mysql, redis, rabbitmq]

volumes:
  mysql_data:
```

### CI/CD Pipeline (GitHub Actions)

#### Backend Pipeline

```yaml
# .github/workflows/backend.yml
name: Backend CI/CD
on:
  push:
    branches: [main, develop]
    paths: ['backend/**']

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: test
        ports: [3306:3306]

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Run tests
        run: ./gradlew test

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Build and push Docker image
        run: |
          docker build -t fitforge-backend:${{ github.sha }} .
          docker push fitforge-backend:${{ github.sha }}
```

#### Frontend Pipeline

```yaml
# .github/workflows/frontend.yml
name: Frontend CI/CD
on:
  push:
    paths: ['mobile/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'

      - name: Get dependencies
        run: flutter pub get

      - name: Run tests
        run: flutter test --coverage

  build-android:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build APK
        run: flutter build apk --release

      - name: Upload to Play Store
        # Add Play Store deployment
```

### Production Deployment

#### Kubernetes Manifests

```yaml
# k8s/backend-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fitforge-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fitforge-backend
  template:
    metadata:
      labels:
        app: fitforge-backend
    spec:
      containers:
        - name: backend
          image: fitforge-backend:latest
          ports:
            - containerPort: 8080
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: 'production'
            - name: SPRING_DATASOURCE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: url
          resources:
            requests:
              memory: '512Mi'
              cpu: '250m'
            limits:
              memory: '1Gi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 60
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10

---
apiVersion: v1
kind: Service
metadata:
  name: fitforge-backend-service
spec:
  selector:
    app: fitforge-backend
  ports:
    - port: 80
      targetPort: 8080
  type: LoadBalancer
```

### Infrastructure as Code (Terraform)

#### AWS Infrastructure

```hcl
# infrastructure/main.tf
provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "fitforge-vpc"
  }
}

# EKS Cluster
resource "aws_eks_cluster" "fitforge" {
  name     = "fitforge-cluster"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = "1.28"

  vpc_config {
    subnet_ids = [
      aws_subnet.private_1.id,
      aws_subnet.private_2.id,
      aws_subnet.public_1.id,
      aws_subnet.public_2.id,
    ]
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
  ]
}

# RDS MySQL
resource "aws_db_instance" "fitforge" {
  identifier = "fitforge-db"

  engine         = "mysql"
  engine_version = "8.0"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = "fitforge"
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.fitforge.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = false
  final_snapshot_identifier = "fitforge-final-snapshot"

  tags = {
    Name = "fitforge-database"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "fitforge" {
  name       = "fitforge-cache-subnet"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

resource "aws_elasticache_replication_group" "fitforge" {
  replication_group_id       = "fitforge-redis"
  description               = "Redis for FitForge"

  node_type                 = "cache.t3.micro"
  port                      = 6379
  parameter_group_name      = "default.redis7"

  num_cache_clusters        = 2
  automatic_failover_enabled = true
  multi_az_enabled          = true

  subnet_group_name = aws_elasticache_subnet_group.fitforge.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                = var.redis_auth_token
}
```

### Environment Configuration

#### Production Application Properties

```yaml
# application-production.yml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000

  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: false
        show_sql: false

  redis:
    host: ${SPRING_REDIS_HOST}
    port: ${SPRING_REDIS_PORT:6379}
    password: ${SPRING_REDIS_PASSWORD}
    timeout: 2000ms
    jedis:
      pool:
        max-active: 20
        max-idle: 10
        min-idle: 5

  rabbitmq:
    host: ${SPRING_RABBITMQ_HOST}
    port: ${SPRING_RABBITMQ_PORT:5672}
    username: ${SPRING_RABBITMQ_USERNAME}
    password: ${SPRING_RABBITMQ_PASSWORD}

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
  metrics:
    export:
      prometheus:
        enabled: true

logging:
  level:
    com.fitforge: INFO
    org.springframework.security: WARN
  pattern:
    file: '%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n'
  file:
    name: /app/logs/fitforge.log
    max-size: 100MB
    max-history: 30

app:
  jwt:
    secret: ${JWT_SECRET}
    expiration: 86400000 # 24 hours
    refresh-expiration: 2592000000 # 30 days

  openai:
    api-key: ${OPENAI_API_KEY}
    api-url: https://api.openai.com/v1
    model: gpt-4
    max-tokens: 4000

  cors:
    allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:3000}
```

### Monitoring & Observability

#### Prometheus Configuration

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'fitforge-backend'
    static_configs:
      - targets: ['fitforge-backend-service:8080']
    metrics_path: '/actuator/prometheus'
    scrape_interval: 30s

  - job_name: 'mysql'
    static_configs:
      - targets: ['mysql-exporter:9104']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

#### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "FitForge Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{uri}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      }
    ]
  }
}
```

### Security Configuration

#### SSL/TLS Setup (Let's Encrypt)

```nginx
# nginx/nginx.conf
server {
    listen 80;
    server_name api.fitforge.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.fitforge.com;

    ssl_certificate /etc/letsencrypt/live/api.fitforge.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.fitforge.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://fitforge-backend-service:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Deployment Checklist

#### Pre-deployment

- [ ] Run all tests (unit, integration, e2e)
- [ ] Security scan (OWASP ZAP, SonarQube)
- [ ] Performance testing (load testing)
- [ ] Database migration scripts tested
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Monitoring alerts configured

#### Post-deployment

- [ ] Health checks passing
- [ ] Logs flowing correctly
- [ ] Metrics being collected
- [ ] Database connections healthy
- [ ] Redis cache functional
- [ ] LLM API calls working
- [ ] Push notifications sending
- [ ] Mobile app can connect to API

#### Rollback Plan

1. Keep previous Docker images tagged
2. Database rollback scripts ready
3. DNS failover configured
4. Blue-green deployment setup
5. Feature flags for new functionality

This comprehensive testing and deployment guide ensures a robust, scalable, and maintainable production deployment of the AI Fitness Coach application.
