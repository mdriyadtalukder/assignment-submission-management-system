import { getToken } from "./auth";
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5024/api";
export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const h = new Headers(options.headers);
  h.set("Content-Type", "application/json");
  const t = getToken();
  if (t) h.set("Authorization", `Bearer ${t}`);
  const r = await fetch(BASE + path, {
    ...options,
    headers: h,
    cache: "no-store",
  });
  const text = await r.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!r.ok)
    throw new Error(
      typeof data === "string" ? data : `Request failed (${r.status})`,
    );
  return data as T;
}
export const get = <T>(p: string) => api<T>(p);
export const post = <T>(p: string, b: unknown) =>
  api<T>(p, { method: "POST", body: JSON.stringify(b) });
export const put = <T>(p: string, b: unknown) =>
  api<T>(p, { method: "PUT", body: JSON.stringify(b) });
export const patch = <T>(p: string, b: unknown) =>
  api<T>(p, { method: "PATCH", body: JSON.stringify(b) });
export const del = <T = unknown>(p: string) => api<T>(p, { method: "DELETE" });
