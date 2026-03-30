# Civis

A civic issue reporting platform for filing and tracking local complaints.

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

```
Civis/
├── backend/
│   └── civis/          # Spring Boot application
│       ├── src/
│       │   └── main/
│       │       └── java/com/example/demo/
│       │           └── CivisApplication.java
│       └── build.gradle
└── frontend/
    └── civis/          # React + TypeScript application
        ├── src/
        │   ├── App.tsx
        │   └── main.tsx
        ├── index.html
        └── package.json
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

- The frontend uses backend APIs for auth and complaint data.
- There is no frontend `localStorage` persistence for users or complaints.
- Current auth state is held in memory, so refreshing the browser logs the user out.

## Current Limitations

- This repo is currently an MVP backend, so compared to mature civic portals it still lacks features like admin workflows, department routing, attachments, notifications, JWT/session security, analytics, and escalation logic.
- OTP is returned directly in API responses and passwords are plain text in the current code. This is acceptable for demo/dev use, but not production-safe.

## Available Frontend Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
