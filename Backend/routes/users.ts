import { Router } from "express";
import { users } from "../db";

export const userRouter = Router();

userRouter.get("/", (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...u }) => u);
  res.json(usersWithoutPasswords);
});

userRouter.get("/:id", (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

userRouter.put("/:id", (req, res) => {
  const index = users.findIndex((u) => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "User not found" });
  
  const { password: _, ...updates } = req.body;
  
  users[index] = {
    ...users[index],
    ...updates,
    id: req.params.id // Ensure ID doesn't change
  };
  const { password, ...userWithoutPassword } = users[index];
  res.json(userWithoutPassword);
});