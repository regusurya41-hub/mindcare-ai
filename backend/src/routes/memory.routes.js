import express from 'express';
import { getMemory, updateMemory } from '../controllers/memory.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getMemory);
router.patch('/', updateMemory);

export default router;
