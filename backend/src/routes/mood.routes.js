import express from 'express';
import { body } from 'express-validator';
import { createMood, listMoods, moodAnalytics } from '../controllers/mood.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/', listMoods);
router.get('/analytics', moodAnalytics);
router.post(
  '/',
  [
    body('mood').isIn(['great', 'good', 'okay', 'low', 'heavy']),
    body('emoji').isLength({ min: 1, max: 8 }),
    body('note').optional().trim().isLength({ max: 500 })
  ],
  validate,
  createMood
);

export default router;
