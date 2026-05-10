import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { verifyToken } from '../utils/token.js';

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;
    const [scheme, token] = header?.split(' ') || [];

    if (!/^Bearer$/i.test(scheme || '') || !token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.statusCode === 500) return next(error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
