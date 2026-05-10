import express from 'express';
import { updateSettings } from '../controllers/settings.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.patch('/', updateSettings);

export default router;
