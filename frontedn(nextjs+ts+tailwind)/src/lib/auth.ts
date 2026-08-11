import type { LoginResponse, User } from "@/types";
const TK = "asms_token",
  UK = "asms_user";
export function saveSession(x: LoginResponse) {
  localStorage.setItem(TK, x.token);
  localStorage.setItem(UK, JSON.stringify(x.user));
}
export function getToken() {
  return typeof window === "undefined" ? null : localStorage.getItem(TK);
}
export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const x = localStorage.getItem(UK);
    return x ? JSON.parse(x) : null;
  } catch {
    return null;
  }
}
export function clearSession() {
  localStorage.removeItem(TK);
  localStorage.removeItem(UK);
}
export function dashboardPath(role?: string) {
  return role === "Admin"
    ? "/admin"
    : role === "Teacher"
      ? "/teacher"
      : role === "Student"
        ? "/student"
        : "/login";
}
