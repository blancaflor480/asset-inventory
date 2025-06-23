import { Router } from 'express';
import { 
    getBookings, 
    getBookingById,
    createBooking, 
    updateBookingStatus, 
    cancelBooking,
   
} from '../controllers/conferenceRoom.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Helper to wrap async route handlers
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/', authenticateToken, asyncHandler(getBookings));
router.get('/:id', authenticateToken, asyncHandler(getBookingById));
router.post('/', authenticateToken, asyncHandler(createBooking));
router.put('/:id/status', authenticateToken, asyncHandler(updateBookingStatus));
router.put('/:id/cancel', authenticateToken, asyncHandler(cancelBooking));

export default router;
