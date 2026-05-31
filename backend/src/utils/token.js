import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function ensureJwtConfig() {
  if (!JWT_SECRET) {
    const error = new Error("JWT_SECRET is not configured");
    error.statusCode = 500;
    throw error;
  }
}

export function signToken(userId) {
  ensureJwtConfig();

  return jwt.sign(
    {
      id: userId,
      type: "access",
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "mindcare-ai",
      audience: "mindcare-ai-users",
    }
  );
}

export function verifyToken(token) {
  ensureJwtConfig();

  return jwt.verify(token, JWT_SECRET, {
    issuer: "mindcare-ai",
    audience: "mindcare-ai-users",
  });
}

export function decodeToken(token) {
  return jwt.decode(token);
}