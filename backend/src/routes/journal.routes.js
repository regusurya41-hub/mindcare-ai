import express from 'express';
import { body } from 'express-validator';
import { createJournal, deleteJournal, listJournals, updateJournal } from '../controllers/journal.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/', listJournals);
router.post(
  '/',
  [
    body('title').trim().isLength({ min: 2, max: 120 }),
    body('content').trim().isLength({ min: 1, max: 12000 }),
    body('tags').optional().isArray()
  ],
  validate,
  createJournal
);
router.put('/:id', updateJournal);
router.delete('/:id', deleteJournal);

export default router;
