# Employee Attendance System Backend

Backend service for Employee Attendance System built with Fastify, TypeScript, and Prisma.

## Prerequisites

- Node.js (v16 or higher)
- MySQL
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
- Copy `.env.example` to `.env` (if not exists)
- Update the database connection string in `.env`:
```
DATABASE_URL="mysql://root:@localhost:3306/attendance_db"
JWT_SECRET="your-super-secret-key-change-this-in-production"
PORT=3000
```

3. Setup database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## API Documentation

The API documentation is available through Swagger UI at:
```
http://localhost:3000/documentation
```

This provides an interactive interface to:
- View all available endpoints
- Test API endpoints directly
- View request/response schemas
- Download OpenAPI specification

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Attendance
- `POST /api/attendance/check-in` - Record attendance check-in
- `POST /api/attendance/check-out` - Record attendance check-out
- `GET /api/attendance/report` - Get attendance report with timezone support

## Database Schema

### User
- id (Int, auto-increment)
- email (String, unique)
- password (String, hashed)
- name (String)
- role (Enum: ADMIN, EMPLOYEE)
- createdAt (DateTime)
- updatedAt (DateTime)

### Attendance
- id (Int, auto-increment)
- userId (Int, foreign key)
- checkIn (DateTime)
- checkOut (DateTime, optional)
- location (String)
- ipAddress (String)
- photoUrl (String)
- createdAt (DateTime)
- updatedAt (DateTime)

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run db:setup` - Full database setup (generate client + run migrations)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation
- Error handling

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Development

The project uses:
- TypeScript for type safety
- Prisma for database ORM
- Fastify for high-performance server
- JWT for authentication 