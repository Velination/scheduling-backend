// scheduler/reminder.ts
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { transporter } from '../utils/mailer';
import { format } from 'date-fns';

const prisma = new PrismaClient();

// This runs every 10 minutes
cron.schedule('* * * * *', async () => {
  console.log('⏰ Checking for bookings within 2 hours...');

  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const dateStr = format(twoHoursLater, 'yyyy-MM-dd');
  const timeStr = format(twoHoursLater, 'HH:00'); // e.g., "14:00"

  const bookings = await prisma.booking.findMany({
    where: {
  date: {
    gte: new Date(`${dateStr}T00:00:00.000Z`),
    lt: new Date(`${dateStr}T23:59:59.999Z`)
  },
  time: timeStr,
  reminderSent: false,
},
  });

  for (const booking of bookings) {
    const { name, email, date, time } = booking;

    try {
      // Send email to customer
      await transporter.sendMail({
        to: email,
        subject: '⏰ Reminder: Your appointment is coming up',
        html: `<p>Hi ${name},<br>Your appointment is scheduled for <strong>${date}</strong> at <strong>${time}</strong>.</p>`,
      });

      // Send to worker
      await transporter.sendMail({
        to: process.env.MAIL_USER!,
        subject: `Upcoming Appointment with ${name}`,
        html: `<p>${name} has a booking on <strong>${date}</strong> at <strong>${time}</strong>.</p>`,
      });

      // Mark reminder as sent
      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminderSent: true },
      });

      console.log(`✅ Reminder sent for booking ${booking.id}`);
    } catch (error) {
      console.error(`❌ Failed to send reminder for booking ${booking.id}`, error);
    }
  }
});
