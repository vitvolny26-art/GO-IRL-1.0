import type { UserRole } from "../types";

export const beautyRouteAccess = (role: UserRole) =>
  role === "professional" || role === "admin" ? "allowed" : "blocked";
