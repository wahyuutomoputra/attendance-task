import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface UpdateProfileBody {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

export class UserController {
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
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
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as { id: number }).id;
    const { name, currentPassword, newPassword } = request.body as UpdateProfileBody;

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
  }
} 