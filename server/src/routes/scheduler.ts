import { Router } from 'express';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  getRooms
} from '../controllers/conferenceRoom.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Booking routes
router.get('/', authenticateToken, getBookings);
router.get('/:id', authenticateToken, getBookingById);
router.post('/', authenticateToken, createBooking);
router.put('/:id/status', authenticateToken, updateBookingStatus);
router.put('/:id/cancel', authenticateToken, cancelBooking);

// Room routes
router.get('/rooms', authenticateToken, getRooms);

export default router;