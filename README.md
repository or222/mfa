# MFA Application

A complete Multi-Factor Authentication (MFA) system with email-based registration and password reset functionality.

## Tech Stack

### Backend
- **Spring Boot 2.7.x** - Java backend framework
- **Spring Security** - Security framework
- **Spring Data JPA** - Database ORM
- **Spring Data Redis** - Redis integration for temporary token storage
- **Spring Mail** - Email sending
- **JWT (JJWT)** - JSON Web Token authentication
- **H2 Database** - In-memory database (can be switched to MySQL/PostgreSQL)
- **Lombok** - Reduce boilerplate code

### Frontend
- **React 17.x** - UI library
- **Ant Design 3.x** - UI component library
- **TypeScript** - Type-safe JavaScript (no js/jsx files)
- **Axios** - HTTP client
- **React Router 5.x** - Client-side routing

## Features

### Security Features
1. **Password Policy**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one digit
   - At least one special character

2. **Brute-Force Protection**
   - Account lockout after 5 failed login attempts
   - 30-minute lock duration
   - Automatic reset on successful login

3. **Token Management**
   - JWT access tokens (1 hour expiration)
   - JWT refresh tokens (24 hour expiration)
   - Redis-stored OTP tokens (5 minute expiration)
   - Redis-stored password reset tokens (5 minute expiration)

4. **Email Verification**
   - OTP-based email verification during registration
   - Secure password reset via email tokens

## Project Structure

```
/workspace
├── backend/
│   ├── src/main/java/com/example/mfa/
│   │   ├── config/          # Security and CORS configuration
│   │   ├── controller/      # REST API endpoints
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entity/          # JPA entities
│   │   ├── repository/      # Data access layer
│   │   ├── service/         # Business logic
│   │   └── util/            # Utilities (JWT, OTP, Password validation)
│   └── src/main/resources/
│       └── application.properties
│
└── frontend/
    ├── public/
    └── src/
        ├── components/      # React components (.tsx only)
        ├── pages/           # Page components (.tsx only)
        ├── services/        # API services (.ts only)
        ├── types/           # TypeScript interfaces
        └── utils/           # Utility functions
```

## Setup Instructions

### Prerequisites
- Java 11+
- Node.js 14+
- Redis server running on localhost:6379
- SMTP server credentials (Gmail, SendGrid, etc.)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd /workspace/backend
   ```

2. Update `application.properties` with your SMTP credentials:
   ```properties
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-app-password
   ```

3. Build and run:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

4. The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd /workspace/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. The frontend will start on `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/verify` | Verify email with OTP |
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/forgot-password` | Request password reset token |
| POST | `/api/auth/reset-password` | Reset password with token |

## Usage Flow

### Registration
1. User enters email and password
2. System validates password policy
3. OTP is generated and sent via email
4. User enters OTP to verify email
5. Account is activated and JWT tokens are issued

### Login
1. User enters email and password
2. System checks account lock status
3. Password is verified
4. Failed attempts are tracked
5. On success, JWT tokens are issued

### Password Reset
1. User requests password reset
2. Reset token is sent via email
3. User enters token and new password
4. Password is validated against policy
5. Password is updated

## Configuration

Key configuration options in `application.properties`:

```properties
# Password Policy
password.min-length=8
password.require-uppercase=true
password.require-lowercase=true
password.require-digit=true
password.require-special-char=true

# Security
security.login.max-attempts=5
security.login.lock-duration-minutes=30
security.otp.length=6
security.otp.expiration-seconds=300

# JWT
jwt.expiration-ms=3600000
jwt.refresh-expiration-ms=86400000
```

## Notes

- This is a development setup using H2 in-memory database
- For production, use a persistent database (MySQL, PostgreSQL)
- Ensure Redis is running before starting the backend
- Update SMTP settings with valid credentials for email functionality
- Change the JWT secret key for production use
- Frontend uses only TypeScript (.ts/.tsx) - no JavaScript (.js/.jsx) files