import { Router } from 'express';
import { listEmployees } from '../controllers/inventory.controller';

const router = Router();

router.get('/employees', listEmployees);

export default router;