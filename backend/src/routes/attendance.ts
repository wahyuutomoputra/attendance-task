import { FastifyInstance } from 'fastify';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

type AttendanceWithUser = Awaited<ReturnType<typeof prisma.attendance.findFirst>> & {
  user: {
    name: string;
    email: string;
  };
};

// Swagger schema definitions
const checkInSchema = {
  tags: ['attendance'],
  summary: 'Check-in attendance',
  description: 'Record employee check-in attendance',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['location', 'ipAddress', 'photoUrl'],
    properties: {
      location: { type: 'string', description: 'Location of check-in' },
      ipAddress: { type: 'string', description: 'IP address of the device' },
      photoUrl: { type: 'string', description: 'URL of the check-in photo' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        userId: { type: 'number' },
        checkIn: { type: 'string', format: 'date-time' },
        checkOut: { type: 'string', format: 'date-time', nullable: true },
        location: { type: 'string' },
        ipAddress: { type: 'string' },
        photoUrl: { type: 'string' }
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

const checkOutSchema = {
  tags: ['attendance'],
  summary: 'Check-out attendance',
  description: 'Record employee check-out attendance',
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        userId: { type: 'number' },
        checkIn: { type: 'string', format: 'date-time' },
        checkOut: { type: 'string', format: 'date-time' },
        location: { type: 'string' },
        ipAddress: { type: 'string' },
        photoUrl: { type: 'string' }
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

const reportSchema = {
  tags: ['attendance'],
  summary: 'Get attendance report',
  description: 'Get attendance report for a specific date range',
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      startDate: { type: 'string', format: 'date', description: 'Start date for the report (YYYY-MM-DD)' },
      endDate: { type: 'string', format: 'date', description: 'End date for the report (YYYY-MM-DD)' },
      timezone: { type: 'string', default: 'UTC', description: 'Timezone for the report' }
    }
  },
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          userId: { type: 'number' },
          checkIn: { type: 'string' },
          checkOut: { type: 'string', nullable: true },
          location: { type: 'string' },
          ipAddress: { type: 'string' },
          photoUrl: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' }
            }
          }
        }
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

  // Check-in
  fastify.post('/check-in', { schema: checkInSchema }, async (request, reply) => {
    const userId = (request.user as { id: number }).id;
    const { location, ipAddress, photoUrl } = request.body as {
      location: string;
      ipAddress: string;
      photoUrl: string;
    };

    try {
      // Check if user already checked in today
      const existingAttendance = await prisma.attendance.findFirst({
        where: {
          userId,
          checkIn: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      if (existingAttendance) {
        return reply.code(400).send({ error: 'Already checked in today' });
      }

      const attendance = await prisma.attendance.create({
        data: {
          userId,
          location,
          ipAddress,
          photoUrl,
        },
      });

      return attendance;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Check-out
  fastify.post('/check-out', { schema: checkOutSchema }, async (request, reply) => {
    const userId = (request.user as { id: number }).id;

    try {
      const attendance = await prisma.attendance.findFirst({
        where: {
          userId,
          checkIn: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
          checkOut: null,
        },
      });

      if (!attendance) {
        return reply.code(400).send({ error: 'No active check-in found' });
      }

      const updatedAttendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: { checkOut: new Date() },
      });

      return updatedAttendance;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get attendance report
  fastify.get('/report', { schema: reportSchema }, async (request, reply) => {
    const userId = (request.user as { id: number }).id;
    const { startDate, endDate, timezone = 'UTC' } = request.query as {
      startDate?: string;
      endDate?: string;
      timezone?: string;
    };

    try {
      const whereClause: any = {
        userId,
      };

      if (startDate) {
        whereClause.checkIn = {
          gte: new Date(startDate),
        };
      }

      if (endDate) {
        whereClause.checkIn = {
          ...whereClause.checkIn,
          lte: new Date(endDate),
        };
      }

      const attendances = await prisma.attendance.findMany({
        where: whereClause,
        orderBy: {
          checkIn: 'desc',
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      // Convert times to requested timezone
      const formattedAttendances = attendances.map((attendance: AttendanceWithUser) => ({
        ...attendance,
        checkIn: attendance.checkIn.toLocaleString('en-US', { timeZone: timezone }),
        checkOut: attendance.checkOut
          ? attendance.checkOut.toLocaleString('en-US', { timeZone: timezone })
          : null,
      }));

      return formattedAttendances;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}

export default routes; 