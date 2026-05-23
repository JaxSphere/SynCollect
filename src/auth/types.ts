export type UserRole = "manager" | "fieldOfficer";

export function resolveRole(username: string): UserRole {
  const normalized = username.trim().toLowerCase();
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
  return role === "fieldOfficer" ? "/fo" : "/";
}
