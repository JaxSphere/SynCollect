import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { serializeUser } from "../lib/serializers.js";
import { logAudit } from "../lib/auditLogger.js";
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
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
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

  await logAudit({
    action: "USER_CREATED",
    targetType: "USER",
    targetId: user.id,
    targetName: user.fullName || user.username,
    performedById: req.user!.userId,
    performedBy: req.user!.username,
    details: { role: user.role, username: user.username },
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
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (existing && existing.id !== userId) {
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

  const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    await logAudit({
      action: "USER_UPDATED",
      targetType: "USER",
      targetId: user.id,
      targetName: user.fullName || user.username,
      performedById: req.user!.userId,
      performedBy: req.user!.username,
      details: { updatedFields: Object.keys(data).filter((k) => k !== "passwordHash"), role: user.role },
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

  const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true, fullName: true, role: true } });
    await prisma.user.delete({ where: { id: userId } });

    if (user) {
      await logAudit({
        action: "USER_DELETED",
        targetType: "USER",
        targetId: user.id,
        targetName: user.fullName || user.username,
        performedById: req.user!.userId,
        performedBy: req.user!.username,
        details: { role: user.role, username: user.username },
      });
    }

    return res.status(204).send();
  } catch {
    return res.status(404).json({ error: "User not found." });
  }
});