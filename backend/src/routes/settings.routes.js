import express from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';

import {
  updateSettings,
  updateProfile,
  changePassword,
  deleteAccount,
  exportData,
} from '../controllers/settings.controller.js';

import { protect }   from '../middleware/auth.middleware.js';
import { validate }  from '../middleware/validate.middleware.js';

const router = express.Router();
router.use(protect);

/* Sensitive ops — tighter rate limit */
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: { success: false, message: 'Too many attempts. Try again later.' },
  skip: () => process.env.NODE_ENV === 'development',
});

/* ── PATCH / — toggle preferences ── */
router.patch('/', updateSettings);

/* ── PATCH /profile ── */
router.patch(
  '/profile',
  sensitiveLimiter,
  [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
  ],
  validate,
  updateProfile
);

/* ── PATCH /password ── */
router.patch(
  '/password',
  sensitiveLimiter,
  [
    body('currentPassword').notEmpty().withMessage('Current password required.'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('New password must be 8+ characters.')
      .matches(/[A-Za-z]/).withMessage('Must contain at least one letter.')
      .matches(/[0-9]/).withMessage('Must contain at least one number.'),
  ],
  validate,
  changePassword
);

/* ── DELETE /account ── */
router.delete(
  '/account',
  sensitiveLimiter,
  [body('password').notEmpty().withMessage('Password required to delete account.')],
  validate,
  deleteAccount
);

/* ── GET /export ── */
router.get('/export', exportData);

export default router;