import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CheckInBody {
  location: string;
  ipAddress: string;
  photoUrl: string;
}

interface ReportQuery {
  startDate?: string;
  endDate?: string;
  timezone?: string;
}

type AttendanceWithUser = Awaited<ReturnType<typeof prisma.attendance.findFirst>> & {
  user: {
    name: string;
    email: string;
  };
};

export class AttendanceController {
  async checkIn(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as { id: number }).id;
    const { location, ipAddress, photoUrl } = request.body as CheckInBody;

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
  }

  async checkOut(request: FastifyRequest, reply: FastifyReply) {
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
  }

  async getReport(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as { id: number }).id;
    const { startDate, endDate, timezone = 'UTC' } = request.query as ReportQuery;

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
  }
} 