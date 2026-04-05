import { Request, Response, NextFunction } from "express";
import { users } from "../db";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: Missing user ID" });
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized: User not found" });
  }

  // Attach user to request
  (req as any).user = user;
  next();
}