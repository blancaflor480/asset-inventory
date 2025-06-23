import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import inventoryRoutes from './routes/inventory';
import accountRoutes from './routes/account';
import employeeRoutes from './routes/inventory.routes';
import schedulerRoutes from './routes/scheduler';
import { scheduler } from 'timers/promises';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/accounts', accountRoutes); // Add this line
app.use('/api', employeeRoutes);
app.use('/api', schedulerRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});