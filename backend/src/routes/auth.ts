import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
  fastify.post('/login', { schema: loginSchema }, async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role });

      return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.post('/register', { schema: registerSchema }, async (request, reply) => {
    const { email, password, name } = request.body as {
      email: string;
      password: string;
      name: string;
    };

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.code(400).send({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role });

      return {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}

export default routes;