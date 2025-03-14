import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';

// Swagger schema definitions
const loginSchema = {
  tags: ['auth'],
  summary: 'User login',
  description: 'Authenticate user and get JWT token',
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', description: 'User email' },
      password: { type: 'string', description: 'User password' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'JWT token' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' }
          }
        }
      }
    },
    401: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    }
  }
};

const registerSchema = {
  tags: ['auth'],
  summary: 'User registration',
  description: 'Register a new user',
  body: {
    type: 'object',
    required: ['email', 'password', 'name'],
    properties: {
      email: { type: 'string', format: 'email', description: 'User email' },
      password: { type: 'string', description: 'User password' },
      name: { type: 'string', description: 'User full name' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'JWT token' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' }
          }
        }
      }
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    }
  }
};

async function routes(fastify: FastifyInstance) {
  const authController = new AuthController();

  fastify.post('/login', { schema: loginSchema }, authController.login.bind(authController));
  fastify.post('/register', { schema: registerSchema }, authController.register.bind(authController));
}

export default routes;