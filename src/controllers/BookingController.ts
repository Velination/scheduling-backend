import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { transporter } from '../utils/mailer';

const prisma = new PrismaClient();

export const BookingController = {
  book: async (req: Request, res: Response): Promise<void> => {
    const { name, email, date, time } = req.body;

    // ✅ Add this block to reject past bookings
    const bookingDateTime = new Date(`${date}T${time}`);
    if (bookingDateTime < new Date()) {
      res.status(400).json({ message: 'Cannot book a time or date that has already passed.' });
      return;
    }

    try {
      // Check if slot already taken
      const existing = await prisma.booking.findFirst({
        where: {
          date: new Date(date),
          time,
        },
      });

      if (existing) {
        res.status(409).json({ message: 'Time slot already booked' });
        return;
      }

      // Save booking
      const booking = await prisma.booking.create({
        data: {
          name,
          email,
          date: new Date(date),
          time,
        },
      });

      // Send confirmation email
      await transporter.sendMail({
        to: email,
        subject: 'Booking Confirmed',
        html: `<p>Hi ${name}, your booking is confirmed for <strong>${date}</strong> at <strong>${time}</strong>.</p>`,
      });

      res.status(201).json({ message: 'Booking successful', booking });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};
