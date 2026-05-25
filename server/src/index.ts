import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { accountsRouter } from "./routes/accounts.js";
import { usersRouter } from "./routes/users.js";
import { visitsRouter } from "./routes/visits.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { auditRouter } from "./routes/audit.js";
import { prisma } from "./db.js";

const app = express();

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "25mb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ status: "ok", database: "connected" });
  } catch {
    return res.status(503).json({ status: "degraded", database: "unavailable" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/users", usersRouter);
app.use("/api/visits", visitsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/audit-logs", auditRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found." });
});

app.listen(config.port, () => {
  console.log(`DCMS API listening on http://localhost:${config.port}`);
});
