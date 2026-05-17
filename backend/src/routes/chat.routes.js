import express from 'express';
import { body } from 'express-validator';
import { getChat, sendMessage } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getChat);
router.post(
  '/',
  [
    body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message is required'),
    body('personality').optional().isIn(['friend', 'guide', 'coach']),
    body('language').optional().isLength({ min: 2, max: 12 }).withMessage('Invalid language')
  ],
  validate,
  sendMessage
);

export default router;
