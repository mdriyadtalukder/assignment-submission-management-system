import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import type { Role } from "@/types";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Protected role={"Student" as Role}>
      <AppShell role={"Student" as Role}>{children}</AppShell>
    </Protected>
  );
}
