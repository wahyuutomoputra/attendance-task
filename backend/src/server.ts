import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from 'dotenv';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import attendanceRoutes from './routes/attendance';

config();

const server: FastifyInstance = fastify({
  logger: true,
});

// Register plugins
server.register(cors, {
  origin: true,
  credentials: true,
});

server.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production',
});

server.register(multipart);

// Register Swagger
server.register(swagger, {
  swagger: {
    info: {
      title: 'Employee Attendance System API',
      description: 'API documentation for Employee Attendance System',
      version: '1.0.0',
    },
    host: 'localhost:5051',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'auth', description: 'Authentication endpoints' },
      { name: 'users', description: 'User management endpoints' },
      { name: 'attendance', description: 'Attendance management endpoints' },
    ],
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
  },
});

server.register(swaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
  transformSpecification: (swaggerObject) => {
    return swaggerObject;
  },
  transformSpecificationClone: true
});

// Register routes
server.register(authRoutes, { prefix: '/api/auth' });
server.register(userRoutes, { prefix: '/api/users' });
server.register(attendanceRoutes, { prefix: '/api/attendance' });

// Health check route
server.get('/health', async () => {
  return { status: 'OK' };
});

const start = async () => {
  try {
    await server.listen({
      port: parseInt(process.env.PORT || '3000'),
      host: '0.0.0.0',
    });
    console.log(`Server is running on ${server.server.address()}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 