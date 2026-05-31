import mongoose from "mongoose";
import User from "../models/user.model.js";
import { verifyToken } from "../utils/token.js";

const unauthorized = (res, message) =>
  res.status(401).json({
    success: false,
    message,
  });

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return unauthorized(
        res,
        "Authentication required"
      );
    }

    const token = authHeader.substring(7);

    const decoded = verifyToken(token);

    if (
      !decoded?.id ||
      !mongoose.Types.ObjectId.isValid(decoded.id)
    ) {
      return unauthorized(
        res,
        "Invalid authentication token"
      );
    }

    const user = await User.findById(decoded.id)
      .select(
        "_id name email avatarColor settings createdAt"
      )
      .lean();

    if (!user) {
      return unauthorized(
        res,
        "User no longer exists"
      );
    }

    req.user = user;

    next();
  } catch {
    return unauthorized(
      res,
      "Invalid or expired token"
    );
  }
}