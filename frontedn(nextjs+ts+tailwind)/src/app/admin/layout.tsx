import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import type { Role } from "@/types";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Protected role={"Admin" as Role}>
      <AppShell role={"Admin" as Role}>{children}</AppShell>
    </Protected>
  );
}
