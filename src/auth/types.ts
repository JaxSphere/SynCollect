export type UserRole = "admin" | "manager" | "fieldOfficer";

export function resolveRole(username: string): UserRole {
  const normalized = username.trim().toLowerCase();
  if (normalized === "admin" || normalized.includes("admin")) {
    return "admin";
  }
  if (
    normalized.includes("field") ||
    normalized.includes("officer") ||
    normalized === "fo"
  ) {
    return "fieldOfficer";
  }
  return "manager";
}

export function getHomePath(role: UserRole): string {
  if (role === "admin") return "/admin";
  if (role === "fieldOfficer") return "/fo";
  return "/";
}
