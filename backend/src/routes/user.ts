import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/user.controller';

// Swagger schema definitions
const profileSchema = {
  tags: ['users'],
  summary: 'Get user profile',
  description: 'Get current user profile information',
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    },
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    }
  }
};

const updateProfileSchema = {
  tags: ['users'],
  summary: 'Update user profile',
  description: 'Update current user profile information',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'New user name' },
      currentPassword: { type: 'string', description: 'Current password (required for password change)' },
      newPassword: { type: 'string', description: 'New password' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    },
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    }
  }
};

async function routes(fastify: FastifyInstance) {
  const userController = new UserController();

  // Authenticate all routes in this plugin
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  fastify.get('/profile', { schema: profileSchema }, userController.getProfile.bind(userController));
  fastify.put('/profile', { schema: updateProfileSchema }, userController.updateProfile.bind(userController));
}

export default routes; 