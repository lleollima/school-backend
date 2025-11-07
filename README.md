# School Backend

Backend API for School Management System built with NestJS.

## Description

This is a NestJS-based backend application using TypeScript, configured with ESLint and Prettier for code quality and formatting.

## Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (package manager)

### Installing pnpm

If you don't have pnpm installed:

```bash
# Via npm
npm install -g pnpm

# Via curl (Linux/Mac)
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Via Homebrew (Mac)
brew install pnpm

# Verify installation
pnpm --version
```

> ℹ️ This project is configured to use pnpm. See [PNPM_SETUP.md](./PNPM_SETUP.md) for details.

## Installation

```bash
# Install dependencies using pnpm
pnpm install
```

## Running the app

```bash
# development mode
pnpm start:dev

# production mode
pnpm build
pnpm start:prod

# debug mode
pnpm start:debug
```

## Database Seeding

```bash
# Run all seeders (populate database)
pnpm seed

# Drop all seeded data
pnpm seed:drop

# Reset database (drop and reseed)
pnpm seed:reset
```

**Default users created:**
- Admin: `admin@school.com` / `admin123`
- Teacher: `teacher@school.com` / `teacher123`
- Student: `student@school.com` / `student123`

## Code Quality

```bash
# Format code with Prettier
pnpm format

# Lint code with ESLint
pnpm lint
```

## Environment Variables

Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

## Project Structure

```
src/
├── configs/
│   └── env.config.ts           # Environment configuration
├── health/
│   ├── health.controller.ts    # Health check controller
│   └── health.module.ts        # Health module
├── modules/
│   └── auth/
│       ├── decorators/
│       │   ├── current-user.decorator.ts
│       │   └── roles.decorator.ts
│       ├── dto/
│       │   ├── login.dto.ts
│       │   ├── register.dto.ts
│       │   └── refresh-token.dto.ts
│       ├── guards/
│       │   ├── jwt-auth.guard.ts
│       │   └── roles.guard.ts
│       ├── schemas/
│       │   └── user.schema.ts
│       ├── auth.controller.ts
│       ├── auth.service.ts
│       ├── auth.module.ts
│       └── jwt.strategy.ts
├── app.module.ts               # Root module
└── main.ts                     # Application entry point
```

## Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: class-validator & class-transformer
- **Package Manager**: pnpm
- **Code Formatter**: Prettier 3.6.2
- **Linter**: ESLint 8.57.1
- **Health Checks**: @nestjs/terminus

## API Documentation

The application runs on `http://localhost:3000` by default.

### Endpoints

#### Health Check
- `GET /health` - Verifica a saúde da aplicação e a conexão com o MongoDB

**Response Example (Online):**
```json
{
  "status": "online",
  "database": {
    "mongodb": "online"
  }
}
```

#### Authentication

**POST /auth/register** - Registrar novo usuário
```json
// Request Body
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student" // optional: admin, teacher, student
}

// Response
{
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

**POST /auth/login** - Fazer login
```json
// Request Body
{
  "email": "john@example.com",
  "password": "password123"
}

// Response
{
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

**POST /auth/refresh** - Renovar token
```json
// Request Body
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}

// Response
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

**POST /auth/logout** - Fazer logout (requer autenticação)
```json
// Headers
Authorization: Bearer <accessToken>

// Response
{
  "message": "Logout successful"
}
```

**GET /auth/me** - Obter perfil do usuário (requer autenticação)
```json
// Headers
Authorization: Bearer <accessToken>

// Response
{
  "userId": "...",
  "email": "john@example.com",
  "role": "student"
}
```

> 💡 Este formato permite adicionar facilmente outros serviços no futuro (cache, queue, storage, etc.)

## Database Configuration

Configure a URL do MongoDB no arquivo `.env`:

```env
DATABASE_URL=mongodb://localhost:27017/school-db
```

Para usar MongoDB Atlas:
```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/school-db?retryWrites=true&w=majority
```

## License

UNLICENSED

