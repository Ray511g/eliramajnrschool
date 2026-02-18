# Elirama School Management System — Backend

Next.js API routes backend with Prisma ORM and PostgreSQL.

## Prerequisites

- Node.js 18+
- PostgreSQL (local or remote)

## Setup

### 1. Configure Database

Edit `backend/.env` and set your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/elirama_school?schema=public"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Create Database & Apply Schema

```bash
npm run db:push
```

### 4. Generate Prisma Client

```bash
npm run db:generate
```

### 5. Seed Initial Data

```bash
npm run db:seed
```

This creates:
- Admin user: `admin@elirama.ac.ke` / `admin123`
- Teacher user: `teacher@elirama.ac.ke` / `teacher123`
- Sample students, teachers, exams, timetable, payments

### 6. Start Backend

```bash
npm run dev
```

Backend runs on **http://localhost:3001**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT |
| GET/POST | `/api/students` | List/create students |
| GET/PUT/DELETE | `/api/students/:id` | Get/update/delete student |
| GET/POST | `/api/teachers` | List/create teachers |
| PUT/DELETE | `/api/teachers/:id` | Update/delete teacher |
| GET/POST | `/api/attendance` | Get/save attendance |
| GET/POST | `/api/exams` | List/create exams |
| PUT/DELETE | `/api/exams/:id` | Update/delete exam |
| GET/POST | `/api/fees` | List payments / record payment |
| GET/POST | `/api/timetable` | Get/add timetable entries |
| DELETE | `/api/timetable/:id` | Delete timetable entry |
| GET/PUT | `/api/settings` | Get/update school settings |

## Running Both Frontend & Backend

**Terminal 1 (Frontend):**
```bash
cd elirama-web
npm run dev
```

**Terminal 2 (Backend):**
```bash
cd elirama-web/backend
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3001
