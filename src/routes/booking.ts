import { Router } from 'express';
import { BookingController } from '../controllers/BookingController';

const router = Router();

router.post('/', BookingController.book);

export default router;
