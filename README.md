# Employee Attendance System

A full-stack application for managing employee attendance with features like check-in/out, photo capture, and attendance reporting.

## Prerequisites

For local development:
- Node.js (v18 or higher)
- npm
- PostgreSQL

For Docker deployment:
- Docker
- Docker Compose

## Running with Docker

The easiest way to run the application is using Docker Compose:

```bash
# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down

# Stop all services and remove volumes
docker-compose down -v
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5051
- API Documentation: http://localhost:5051/documentation

## Local Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd attendance-task
   ```

2. Install dependencies for all packages:
   ```bash
   npm run install:all
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in the backend directory
   - Update the database connection string and other required variables

4. Set up the database:
   ```bash
   cd backend
   npx prisma migrate dev
   cd ..
   ```

## Development

Run both frontend and backend in development mode:
```bash
npm run dev
```

This will start:
- Frontend at http://localhost:3000
- Backend at http://localhost:5051
- API Documentation at http://localhost:5051/documentation

## Production

Build and start the application in production mode:
```bash
npm run build
npm run start
```

## Available Scripts

- `npm run install:all` - Install all dependencies
- `npm run dev` - Run frontend and backend in development mode
- `npm run build` - Build frontend and backend
- `npm run start` - Run the application in production mode
- `npm run frontend` - Run only the frontend
- `npm run backend` - Run only the backend 