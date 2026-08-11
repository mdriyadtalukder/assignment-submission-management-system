"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { dashboardPath, getUser } from "@/lib/auth";
export default function Page() {
  const r = useRouter();
  useEffect(() => r.replace(dashboardPath(getUser()?.role)), [r]);
  return <div />;
}
