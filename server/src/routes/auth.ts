import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { requireAuth, signToken } from "../middleware/auth.js";
import { serializeUser } from "../lib/serializers.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  if (!username?.trim() || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const user = await prisma.user.findUnique({
    where: { username: username.trim() },
  });

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const token = signToken({
    userId: user.id,
    username: user.username,
    role: user.role,
  });

  return res.json({
    token,
    user: serializeUser(user),
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    return res.status(401).json({ error: "User not found." });
  }
  return res.json({ user: serializeUser(user) });
});
