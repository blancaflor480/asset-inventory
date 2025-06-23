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
router.get('/bookings', authenticateToken, getBookings);
router.get('/bookings/:id', authenticateToken, getBookingById);
router.post('/bookings', authenticateToken, createBooking);
router.put('/bookings/:id/status', authenticateToken, updateBookingStatus);
router.put('/bookings/:id/cancel', authenticateToken, cancelBooking);

// Room routes
router.get('/rooms', authenticateToken, getRooms);

export default router;