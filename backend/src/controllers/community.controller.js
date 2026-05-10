import Post from '../models/post.model.js';

export async function listPosts(_req, res, next) {
  try {
    const posts = await Post.find({ moderationStatus: { $ne: 'hidden' } }).sort({ createdAt: -1 }).limit(50);
    res.json({ posts });
  } catch (error) {
    next(error);
  }
}

export async function createPost(req, res, next) {
  try {
    const post = await Post.create({
      user: req.user._id,
      body: req.body.body,
      topic: req.body.topic,
      moderationStatus: req.body.body.length > 900 ? 'review' : 'visible'
    });
    res.status(201).json({ post });
  } catch (error) {
    next(error);
  }
}

export async function likePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLiked = post.likes.some((id) => id.equals(req.user._id));
    post.likes = alreadyLiked ? post.likes.filter((id) => !id.equals(req.user._id)) : [...post.likes, req.user._id];
    await post.save();
    res.json({ post });
  } catch (error) {
    next(error);
  }
}

export async function commentPost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ user: req.user._id, body: req.body.body });
    await post.save();
    res.status(201).json({ post });
  } catch (error) {
    next(error);
  }
}

export async function reportPost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.reports.push({ user: req.user._id, reason: req.body.reason });
    post.moderationStatus = 'review';
    await post.save();
    res.json({ message: 'Post reported for moderation' });
  } catch (error) {
    next(error);
  }
}
