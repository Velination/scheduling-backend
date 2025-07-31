import express from 'express';
import './scheduler/reminder';
import cors from 'cors';
import dotenv from 'dotenv';
import bookingRoutes from './routes/booking';
import scheduleRoutes from './routes/schedule';


dotenv.config();

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000', // for local dev
    'https://scheduling-a4zlipacq-stringify-protfolios-projects.vercel.app' // for production
  ],
  credentials: true,
}));
app.use(express.json());


app.use('/book', bookingRoutes);
app.use('/api/schedule', scheduleRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});
