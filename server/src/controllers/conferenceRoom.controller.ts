import { Request, Response } from 'express';
import connection from '../config/database';
import { AuthRequest } from '../types/express';

// Get all bookings (with optional filters)
export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { room, status, date } = req.query;
    const conn = await connection;
    const where: string[] = [];
    const params: any[] = [];

    if (room) {
      where.push('room_name = ?');
      params.push(room);
    }
    if (status) {
      where.push('status = ?');
      params.push(status);
    }
    if (date) {
      where.push('DATE(start_time) = ?');
      params.push(date);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await conn.execute(
      `SELECT * FROM conference_room_bookings ${whereClause} ORDER BY start_time DESC`,
      params
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get booking details by ID
export const getBookingById = async (req: AuthRequest, res: Response) =>    {
  try {
    const { id } = req.params;
    const conn = await connection;
    const [rows] = await conn.execute(
      `SELECT * FROM conference_room_bookings WHERE id = ?`,
      [id]
    ) as [any[], any];
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    return res.json((rows as any[])[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Create a new booking (status: Pending)
export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { room_name, start_time, end_time, purpose } = req.body;
    const booked_by = req.user?.id;
    if (!room_name || !start_time || !end_time || !booked_by) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const conn = await connection;
    // Check for conflicts
    const [conflicts] = await conn.execute(
      `SELECT id FROM conference_room_bookings WHERE room_name = ? AND status IN ('Pending','Approved')
       AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time >= ? AND end_time <= ?))`,
      [room_name, end_time, end_time, start_time, start_time, start_time, end_time]
    );
    if ((conflicts as any[]).length > 0) {
      return res.status(409).json({ message: 'Room is already booked for this time' });
    }
    const [result] = await conn.execute(
      `INSERT INTO conference_room_bookings (room_name, booked_by, purpose, start_time, end_time, status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [room_name, booked_by, purpose, start_time, end_time]
    );
    res.status(201).json({ message: 'Booking request submitted', id: (result as any).insertId });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
    return;
  }
};

// Approve or reject a booking
export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Approved' or 'Rejected'
    const approver_id = req.user?.id;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const conn = await connection;
    await conn.execute(
      `UPDATE conference_room_bookings SET status = ?, approver_id = ?, updated_at = NOW() WHERE id = ?`,
      [status, approver_id, id]
    );
    return res.json({ message: `Booking ${status.toLowerCase()}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Cancel a booking (by user or admin)
export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const conn = await connection;
    await conn.execute(
      `UPDATE conference_room_bookings SET status = 'Cancelled', updated_at = NOW() WHERE id = ?`,
      [id]
    );
    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



// Get all rooms
export const getRooms = async (req: AuthRequest, res: Response) => {
  try {
    const conn = await connection;
    const [rows] = await conn.execute(
      `SELECT * FROM conference_rooms ORDER BY name`
    ) as [any[], any];
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}

