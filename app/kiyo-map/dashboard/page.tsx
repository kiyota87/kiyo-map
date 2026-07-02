import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { KiyoMapDashboard } from "@/components/kiyo-map/KiyoMapDashboard";
import { KiyoMapShell } from "@/components/kiyo-map/KiyoMapShell";

export default async function KiyoMapDashboardPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/kiyo-map/dashboard");
  }

  return (
    <KiyoMapShell userEmail={session.user.email}>
      <KiyoMapDashboard />
    </KiyoMapShell>
  );
}
