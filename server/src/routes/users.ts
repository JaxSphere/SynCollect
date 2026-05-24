import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { serializeUser } from "../lib/serializers.js";
import { UserRole } from "@prisma/client";

export const usersRouter = Router();

usersRouter.use(requireAuth);

const validRoles = [UserRole.admin, UserRole.manager, UserRole.fieldOfficer];

// Managers and admins can read users
usersRouter.get(
  "/",
  requireRole(UserRole.admin, UserRole.manager),
  async (_req, res) => {
    const users = await prisma.user.findMany({ orderBy: { username: "asc" } });
    return res.json(users.map(serializeUser));
  },
);

usersRouter.get(
  "/:id",
  requireRole(UserRole.admin, UserRole.manager),
  async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.json(serializeUser(user));
  },
);

// Only admins can create, update, or delete users
usersRouter.post("/", requireRole(UserRole.admin), async (req, res) => {
  const { username, password, role, fullName } = req.body as {
    username?: string;
    password?: string;
    role?: UserRole;
    fullName?: string | null;
  };

  if (!username?.trim() || !password || !role) {
    return res
      .status(400)
      .json({ error: "Username, password, and role are required." });
  }

  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role." });
  }

  const existing = await prisma.user.findUnique({
    where: { username: username.trim() },
  });
  if (existing) {
    return res.status(409).json({ error: "Username already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username: username.trim(),
      passwordHash,
      role,
      fullName: fullName?.trim() || null,
    },
  });

  return res.status(201).json(serializeUser(user));
});

usersRouter.put("/:id", requireRole(UserRole.admin), async (req, res) => {
  const { username, password, role, fullName } = req.body as {
    username?: string;
    password?: string;
    role?: UserRole;
    fullName?: string | null;
  };

  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role." });
  }

  if (username?.trim()) {
    const existing = await prisma.user.findUnique({
      where: { username: username.trim() },
    });
    if (existing && existing.id !== req.params.id) {
      return res.status(409).json({ error: "Username already exists." });
    }
  }

  const data: {
    username?: string;
    passwordHash?: string;
    role?: UserRole;
    fullName?: string | null;
  } = {};
  if (username?.trim()) data.username = username.trim();
  if (role) data.role = role;
  if (fullName !== undefined) data.fullName = fullName?.trim() || null;
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
    });
    return res.json(serializeUser(user));
  } catch {
    return res.status(404).json({ error: "User not found." });
  }
});

usersRouter.delete("/:id", requireRole(UserRole.admin), async (req, res) => {
  if (req.params.id === req.user?.userId) {
    return res
      .status(400)
      .json({ error: "You cannot delete your own account." });
  }

  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch {
    return res.status(404).json({ error: "User not found." });
  }
});