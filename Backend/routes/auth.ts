import { Router } from "express";
import { users } from "../db";
import { LoginSchema, RegisterSchema, UserStatus, User } from "../types";
import { v4 as uuidv4 } from "uuid";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }

  const { email, password } = result.data;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  if (user.status === UserStatus.INACTIVE) {
    return res.status(403).json({ error: "Account is inactive" });
  }

  // In a real app, we'd return a JWT. For this in-memory demo, we'll return the user.
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token: user.id });
});

authRouter.post("/register", (req, res) => {
  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }

  const { name, email, password, role } = result.data;

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    password,
    role,
    status: UserStatus.ACTIVE,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ user: userWithoutPassword, token: newUser.id });
});
