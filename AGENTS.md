# AGENTS.md - Codebase Guide for AI Agents

## Project Overview
Monorepo with React frontend (Vite + TypeScript) and Express backend (TypeScript + SQLite) - a children's arithmetic learning tool with four operations, difficulty levels, and scoring system.

## Build Commands

### Root Level
```bash
npm run dev          # Start both frontend (5173) and backend (3000)
npm run install:all  # Install all dependencies across workspaces
npm run build        # Build frontend only
```

### Frontend (React + Vite)
```bash
cd frontend
npm run dev          # Start dev server on http://localhost:5173
npm run build        # Compile TypeScript: tsc && vite build
npm run lint         # ESLint: src --ext ts,tsx --max-warnings 0
```

### Backend (Express + TypeScript)
```bash
cd backend
npm run dev          # Start dev server with tsx watch
npm run build        # Compile TypeScript: tsc
npm run start        # Run production: node dist/app.js
```

## Test Commands (Backend Only)

```bash
cd backend
npm run test             # Run all Jest tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report

# Run single test file
npm run test -- QuestionGenerator.service.test.ts
# or
jest QuestionGenerator.service.test.ts
```

## Code Style Guidelines

### Imports
- **Frontend**: Named imports preferred; use `@/*` alias for src directory
  ```tsx
  import { Container, Box } from '@mui/material';
  import { useGame } from '../contexts/GameContext';
  ```
- **Backend**: Default imports for services, named for libraries
  ```ts
  import express from 'express';
  import questionGenerator from '../services/QuestionGenerator.service';
  ```
- React components explicitly import React
  ```tsx
  import React from 'react';
  ```

### TypeScript Configuration
- **Strict mode enabled** in both frontend and backend
- Frontend: `target: ES2020`, `module: ESNext`, path alias `@/*`
- Backend: `target: ES2020`, `module: ESNext` (compiled to CommonJS)
- No type suppression with `as any` - use proper types

### Naming Conventions
- **Components**: PascalCase (HomePage, GameContext)
- **Functions/Variables**: camelCase (handlePractice, currentUser)
- **Types/Interfaces**: PascalCase (User, Difficulty, OperationType)
- **Constants**: UPPER_SNAKE_CASE (DIFFICULTY_CONFIG)
- **Classes**: PascalCase (ArithmeticQuestionGenerator, UserModel)
- **Files**: kebab-case for services/routes (QuestionGenerator.service.ts)

### Error Handling
- **Try-catch blocks** in async functions with console.error logging
- **API responses**: 400 for invalid input, 500 for server errors
  ```ts
  try {
    // operation
  } catch (error) {
    console.error('Description:', error);
    res.status(500).json({ error: 'Server error message' });
  }
  ```
- Input validation before processing

### React Patterns
- Functional components with TypeScript: `React.FC<Props>`
- Custom hooks: `useGame()` context pattern
- State management: Context API (GameContext)
- Material-UI components via named imports

### Backend Patterns
- Express Router pattern for route files
- Service layer for business logic (QuestionGenerator, AnswerValidator, ScoreCalculator)
- Model layer for database operations (UserModel, ScoreModel)
- Singleton pattern for shared instances (Database, QuestionGenerator)
- SQLite with `sqlite` package - parameterized queries to prevent SQL injection

### Project Structure
```
/frontend/src
  ├── pages/        # Page components (HomePage, WelcomePage, etc.)
  ├── contexts/     # React Context providers
  ├── types/        # TypeScript type definitions
  └── App.tsx       # Main app component

/backend/src
  ├── routes/       # Express routers (question.routes, user.routes, etc.)
  ├── services/     # Business logic
  ├── models/       # Database models
  ├── database/     # Database setup
  └── app.ts        # Express app entry
```

### Testing (Jest + ts-jest)
- Test files: `*.test.ts` in `__tests__` directories
- Structure: `describe('feature', () => { test('scenario', () => {...}); })`
- Use `@ts-ignore` only for intentional invalid input testing
- Test file: `backend/src/services/__tests__/QuestionGenerator.service.test.ts`

### Security
- Helmet middleware for security headers
- CORS enabled for cross-origin requests
- Rate limiting: 100 requests per 15 minutes
- Parameterized SQL queries
- Input validation on all endpoints

### Additional Notes
- No Prettier config - follow existing formatting patterns
- Linting only configured for frontend with `--max-warnings 0`
- Chinese language used in comments and UI strings
- SQLite database: `backend/data/arithmetic.db`
- Frontend proxy: `/api` routes to `http://localhost:3000`
