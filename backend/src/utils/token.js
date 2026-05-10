import jwt from 'jsonwebtoken';

export function signToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw Object.assign(new Error('JWT_SECRET is not configured'), { statusCode: 500 });
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

export function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    throw Object.assign(new Error('JWT_SECRET is not configured'), { statusCode: 500 });
  }

  return jwt.verify(token, process.env.JWT_SECRET);
}
