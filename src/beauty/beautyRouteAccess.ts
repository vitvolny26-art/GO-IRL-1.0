import type { UserRole } from "../types";

export const beautyRouteAccess = (role: UserRole) =>
  role === "professional" ? "allowed" : "blocked";
