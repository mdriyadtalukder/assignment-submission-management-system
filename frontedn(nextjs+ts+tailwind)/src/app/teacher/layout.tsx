import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import type { Role } from "@/types";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Protected role={"Teacher" as Role}>
      <AppShell role={"Teacher" as Role}>{children}</AppShell>
    </Protected>
  );
}
