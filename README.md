# Employee Attendance System

A full-stack application for managing employee attendance with features like check-in/out, photo capture, and attendance reporting.

## Prerequisites

For local development:
- Node.js (v18 or higher)
- npm
- MySQL

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
- Database: localhost:3307 (MySQL)

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

## Testing

The project uses Playwright for end-to-end testing. Tests are located in the `frontend/tests` directory.

### Running Tests

```bash
# Run all tests
cd frontend && npm run test

# Run tests with UI mode (good for debugging)
cd frontend && npm run test:ui

# Run tests in debug mode
cd frontend && npm run test:debug

# View test reports
cd frontend && npm run test:report
```

### Test Coverage

The tests cover:
- Authentication flows
  - Login form validation
  - Error handling
  - Invalid credentials

- Attendance features
  - Check-in/out functionality
  - Attendance report display
  - Profile section

### Supported Browsers

Tests run on multiple browsers and devices:
- Desktop: Chrome, Firefox, Safari
- Mobile: Chrome (Pixel 5), Safari (iPhone 12)

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