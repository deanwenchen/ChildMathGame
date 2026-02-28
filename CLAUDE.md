# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

儿童算术学习工具 - A full-stack children's arithmetic learning application with React frontend and Express backend.

## Common Commands

### Development

```bash
# Install all dependencies (root, frontend, and backend)
npm run install:all

# Start both frontend and backend concurrently
npm run dev

# Start only frontend (Vite dev server on http://localhost:5173)
npm run dev:frontend

# Start only backend (Express on http://localhost:3000 with hot reload via tsx)
npm run dev:backend
```

### Build

```bash
# Build frontend (outputs to frontend/dist)
npm run build

# Build backend (compiles TypeScript to backend/dist)
npm run build:backend
```

### Testing & Linting

```bash
# Backend tests (Jest)
cd backend && npm test

# Backend tests with watch mode
cd backend && npm run test:watch

# Frontend linting (ESLint)
cd frontend && npm run lint
```

## Architecture Overview

### Monorepo Structure
- **Root**: npm workspaces configuration, concurrent dev scripts
- **frontend/**: React 18 + TypeScript + Vite + Material-UI
- **backend/**: Express + TypeScript + SQLite3

### Frontend Architecture (`frontend/src/`)

**State Management:**
- `contexts/GameContext.tsx` - Global state for current user, authentication, and score operations
- User session persisted to localStorage
- API calls via axios with base URL from `VITE_API_URL` env var (defaults to localhost:3000/api)

**Routing:**
- React Router with route guards (`ProtectedRoute`, `HomeRoute`)
- `/` - Welcome/Login page
- `/home` - Main dashboard
- `/practice` - Difficulty/operation selection
- `/practice-game` - Active game (10 questions per round)
- `/game-result` - Score display
- `/scores` - History and statistics
- `/profile` - User profile management

**Theme:**
- Custom Material-UI theme in `App.tsx` with child-friendly colors (green primary, orange secondary)
- Large rounded buttons with increased font sizes for accessibility

### Backend Architecture (`backend/src/`)

**Services (Singleton Pattern):**
- `services/QuestionGenerator.service.ts` - Generates arithmetic questions with difficulty-based ranges. Key logic: subtraction ensures non-negative results, division ensures clean division
- `services/ScoreCalculator.service.ts` - Calculates scores: base (accuracy) + difficulty bonus (easy: 0, medium: 5, hard: 10) + time bonus (up to 20 points for fast completion)
- `services/AnswerValidator.service.ts` - Validates answers and provides Chinese feedback messages

**Data Layer:**
- `database/database.ts` - SQLite3 database initialization
- `models/User.model.ts` & `models/Score.model.ts` - Data access objects
- Database file auto-created at `backend/data/arithmetic.db`

**Routes (`routes/`):**
- `/api/users` - User CRUD
- `/api/scores` - Score submission and retrieval
- `/api/questions` - Question generation and answer validation
- `/api/health` - Health check

**Security:**
- Helmet for security headers
- Rate limiting (100 requests per 15 minutes)
- CORS enabled
- Parameterized SQL queries

### Type Sharing

TypeScript types are defined in `frontend/src/types/index.ts`:
- `User`, `Score`, `Difficulty` ('easy' | 'medium' | 'hard'), `OperationType` ('addition' | 'subtraction' | 'multiplication' | 'division')

Backend services export their own type definitions. Keep types in sync between frontend and backend manually.

## Development Notes

- Backend uses `tsx watch` for hot reload during development
- Frontend Vite proxy configuration handles CORS in development
- SQLite database is local and not committed to git
- Backend tests use Jest with ts-jest (no jest config file found - uses package.json defaults)
