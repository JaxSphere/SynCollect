import "dotenv/config";

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  jwtSecret: requireEnv("JWT_SECRET", "dev-only-change-me-in-production"),
  databaseUrl: requireEnv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/dcms?schema=public",
  ),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
