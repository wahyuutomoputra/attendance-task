import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
  // Authenticate all routes in this plugin
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // Get user profile
  fastify.get('/profile', { schema: profileSchema }, async (request, reply) => {
    const userId = (request.user as { id: number }).id;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return user;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Update user profile
  fastify.put('/profile', { schema: updateProfileSchema }, async (request, reply) => {
    const userId = (request.user as { id: number }).id;
    const { name, currentPassword, newPassword } = request.body as {
      name?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      const updateData: any = {};
      
      if (name) {
        updateData.name = name;
      }

      if (currentPassword && newPassword) {
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
          return reply.code(400).send({ error: 'Current password is incorrect' });
        }
        updateData.password = await bcrypt.hash(newPassword, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return updatedUser;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}

export default routes; 