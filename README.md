# Civis

A Smart Civic Issue Reporting Platform that allows citizens to report and track local civic issues.

## Tech Stack

### Backend
- **Java 25**
- **Spring Boot 4.0.3**
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

### Backend

```bash
cd backend/civis
./gradlew bootRun
```

The server starts at `http://localhost:8080`.

### Frontend

```bash
cd frontend/civis
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

## Available Frontend Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
