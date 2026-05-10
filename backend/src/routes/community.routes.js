import express from 'express';
import { body } from 'express-validator';
import { commentPost, createPost, likePost, listPosts, reportPost } from '../controllers/community.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/', listPosts);
router.post('/', [body('body').trim().isLength({ min: 2, max: 1200 }), body('topic').optional().isIn(['support', 'gratitude', 'coping', 'question'])], validate, createPost);
router.post('/:id/like', likePost);
router.post('/:id/comment', [body('body').trim().isLength({ min: 1, max: 600 })], validate, commentPost);
router.post('/:id/report', [body('reason').trim().isLength({ min: 3, max: 240 })], validate, reportPost);

export default router;
