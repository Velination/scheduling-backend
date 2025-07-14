import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { formatISO, addDays } from 'date-fns';

const router = Router();
const prisma = new PrismaClient();

const MAX_BOOKINGS_PER_DAY = 4;

// ✅ GET /api/schedule/available-dates
router.get(
  '/available-dates',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const today = new Date();
    const rangeDays = 14;
    const availableDates: string[] = [];

    try {
      for (let i = 0; i < rangeDays; i++) {
        const current = addDays(today, i);
        const start = new Date(current.setHours(0, 0, 0, 0));
        const end = new Date(current.setHours(23, 59, 59, 999));

        const count = await prisma.booking.count({
          where: {
            date: {
              gte: start,
              lte: end,
            },
          },
        });

        if (count < MAX_BOOKINGS_PER_DAY) {
          availableDates.push(formatISO(start, { representation: 'date' }));
        }
      }

      res.json({ dates: availableDates });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to load available dates' });
    }
  }
);

// ✅ GET /api/schedule/times?date=YYYY-MM-DD
router.get('/times', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      res.status(400).json({ message: 'Date is required' });
      return;
    }

    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59`);

    const allSlots = Array.from({ length: 10 }, (_, i) => {
      const hour = 9 + i;
      return `${hour.toString().padStart(2, '0')}:00`;
    });

    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      select: { time: true },
    });

    const bookedTimes = bookings.map((b) => b.time);
    const available = allSlots.filter((slot) => !bookedTimes.includes(slot));

    res.json({ times: available });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error loading time slots' });
  }
});


export default router;
