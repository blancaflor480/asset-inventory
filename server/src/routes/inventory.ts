import { Router } from 'express';
import { 
  getInventoryItems, 
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem 
} from '../controllers/inventory.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getInventoryItems);
router.post('/', authenticateToken, createInventoryItem);
router.put('/:id', authenticateToken, updateInventoryItem);
router.delete('/:id', authenticateToken, deleteInventoryItem);

export default router;