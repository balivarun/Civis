# Civis

Civis is a full-stack civic issue reporting platform where citizens can register, file local complaints, and track resolution status in real time. The backend is built with Spring Boot, PostgreSQL, JWT access tokens, and secure HTTP-only refresh-token cookies; the frontend is built with React + TypeScript.
## Tech Stack

### Backend
- **Java 25**
- **Spring Boot 4.0.3**
- **Spring Data JPA**
- **PostgreSQL**
- **Gradle** (build tool)

### Frontend
- **React 19**
- **TypeScript**
- **Vite**

## Project Structure

```text
Civis/
├── .gitignore
├── README.md
├── backend/
│   └── civis/
│       ├── .dockerignore
│       ├── .env.example
│       ├── .gitattributes
│       ├── .gitignore
│       ├── Dockerfile
│       ├── build.gradle
│       ├── gradle/
│       │   └── wrapper/
│       │       ├── gradle-wrapper.jar
│       │       └── gradle-wrapper.properties
│       ├── gradlew
│       ├── gradlew.bat
│       ├── run-postgres.sh
│       ├── settings.gradle
│       └── src/
│           ├── main/
│           │   ├── java/com/example/demo/
│           │   │   ├── CivisApplication.java
│           │   │   ├── config/
│           │   │   │   ├── CorsConfig.java
│           │   │   │   └── SecurityConfig.java
│           │   │   ├── controller/
│           │   │   │   ├── AuthController.java
│           │   │   │   ├── ComplaintController.java
│           │   │   │   └── GlobalExceptionHandler.java
│           │   │   ├── dto/
│           │   │   │   ├── AuthDtos.java
│           │   │   │   └── ComplaintDtos.java
│           │   │   ├── model/
│           │   │   │   ├── AuthType.java
│           │   │   │   ├── Complaint.java
│           │   │   │   ├── OtpToken.java
│           │   │   │   ├── Priority.java
│           │   │   │   ├── RefreshToken.java
│           │   │   │   ├── Status.java
│           │   │   │   ├── TimelineEntry.java
│           │   │   │   └── User.java
│           │   │   ├── repository/
│           │   │   │   ├── ComplaintRepository.java
│           │   │   │   ├── OtpRepository.java
│           │   │   │   ├── OtpTokenRepository.java
│           │   │   │   ├── RefreshTokenRepository.java
│           │   │   │   └── UserRepository.java
│           │   │   ├── security/
│           │   │   │   ├── JwtAuthenticationFilter.java
│           │   │   │   └── JwtService.java
│           │   │   └── service/
│           │   │       ├── AuthService.java
│           │   │       ├── ComplaintService.java
│           │   │       └── RefreshTokenService.java
│           │   └── resources/
│           │       ├── application-postgres.properties
│           │       └── application.properties
│           └── test/java/com/example/demo/
│               └── CivisApplicationTests.java
└── frontend/
    └── civis/
        ├── .gitignore
        ├── README.md
        ├── eslint.config.js
        ├── index.html
        ├── package-lock.json
        ├── package.json
        ├── public/
        │   └── vite.svg
        ├── src/
        │   ├── App.css
        │   ├── App.tsx
        │   ├── api/
        │   │   └── client.ts
        │   ├── assets/
        │   │   └── react.svg
        │   ├── components/
        │   │   ├── LandingPage.css
        │   │   ├── LandingPage.tsx
        │   │   ├── LanguageToggle.css
        │   │   ├── LanguageToggle.tsx
        │   │   ├── Navbar.css
        │   │   ├── Navbar.tsx
        │   │   └── ProtectedRoute.tsx
        │   ├── context/
        │   │   ├── AuthContext.tsx
        │   │   ├── LanguageContext.tsx
        │   │   ├── ThemeContext.tsx
        │   │   └── TranslationContext.tsx
        │   ├── index.css
        │   ├── main.tsx
        │   ├── pages/
        │   │   ├── Auth.css
        │   │   ├── ComplaintDetail.css
        │   │   ├── ComplaintDetail.tsx
        │   │   ├── Dashboard.css
        │   │   ├── Dashboard.tsx
        │   │   ├── HowItWorks.css
        │   │   ├── HowItWorks.tsx
        │   │   ├── Login.tsx
        │   │   ├── Register.tsx
        │   │   ├── ReportComplaint.css
        │   │   └── ReportComplaint.tsx
        │   └── utils/
        │       └── translations.ts
        ├── tsconfig.app.json
        ├── tsconfig.json
        ├── tsconfig.node.json
        └── vite.config.ts
```

## Getting Started

### Prerequisites
- Java 25+
- Node.js 18+
- npm
- PostgreSQL 16+

### Database

Create a PostgreSQL database named `civis` and make sure your server is reachable.

This project currently uses PostgreSQL on `localhost:5433` by default.

### Backend Setup

Create a local env file:

```bash
cd backend/civis
cp .env.example .env
```

Edit `.env`:

```env
DB_URL=jdbc:postgresql://localhost:5433/civis
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=replace_with_base64_secret
JWT_TTL_HOURS=24
REFRESH_TOKEN_TTL_DAYS=30
REFRESH_COOKIE_SECURE=false
REFRESH_COOKIE_SAME_SITE=Lax
REFRESH_COOKIE_DOMAIN=
APP_AUTH_EXPOSE_OTP=true
```

### Run Backend

```bash
cd backend/civis
./run-postgres.sh
```

The backend starts at `http://localhost:8080/api`.

### Run Frontend

```bash
cd frontend/civis
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

## Notes

- Auth uses short-lived JWT access tokens plus HTTP-only refresh-token cookies.
- Complaint APIs are protected; user identity is derived from JWT, not from client `userId` input.
- Session is restored on page refresh via `POST /api/auth/refresh` (cookie-based).
- Passwords are stored as BCrypt hashes.
- Email registration enforces strong passwords: at least 8 chars with uppercase, lowercase, number, and special character.
- OTP is hidden by default (`APP_AUTH_EXPOSE_OTP=false`) and should be integrated with SMS in production.

## Production Env Checklist

Set these on your backend host (Render/other):

```env
SPRING_PROFILES_ACTIVE=postgres
DB_URL=jdbc:postgresql://<host>:<port>/<db>
DB_USERNAME=<user>
DB_PASSWORD=<password>
JWT_SECRET=<base64_secret>
JWT_TTL_HOURS=24
REFRESH_TOKEN_TTL_DAYS=30
REFRESH_COOKIE_SECURE=true
REFRESH_COOKIE_SAME_SITE=None
REFRESH_COOKIE_DOMAIN=
APP_AUTH_EXPOSE_OTP=false
APP_CORS_ALLOWED_ORIGIN_PATTERNS=https://<your-vercel-domain>,http://localhost:*,http://127.0.0.1:*
```

For frontend (Vercel):

```env
VITE_API_BASE_URL=https://<your-render-backend>
```

## Available Frontend Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
