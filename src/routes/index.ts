import { Router } from 'express';
import { splitImageController, healthCheckController } from '../controllers/splitController';

const router = Router();

// Health check endpoint
router.get('/health', healthCheckController);

// Image splitting endpoint
router.post('/api/split', splitImageController);

export default router;
