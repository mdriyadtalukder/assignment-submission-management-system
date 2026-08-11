"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardPath, getUser } from "@/lib/auth";
import type { Role } from "@/types";
import Loading from "./Loading";
export default function Protected({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const r = useRouter();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const u = getUser();
    if (!u) r.replace("/login");
    else if (u.role !== role) r.replace(dashboardPath(u.role));
    else setOk(true);
  }, [role, r]);
  return ok ? (
    <>{children}</>
  ) : (
    <Loading fullScreen text="Loading your workspace..." />
  );
}
