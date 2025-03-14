import { FastifyInstance } from 'fastify';
import { AttendanceController } from '../controllers/attendance.controller';

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
  const attendanceController = new AttendanceController();

  // Authenticate all routes in this plugin
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  fastify.post('/check-in', { schema: checkInSchema }, attendanceController.checkIn.bind(attendanceController));
  fastify.post('/check-out', { schema: checkOutSchema }, attendanceController.checkOut.bind(attendanceController));
  fastify.get('/report', { schema: reportSchema }, attendanceController.getReport.bind(attendanceController));
}

export default routes; 