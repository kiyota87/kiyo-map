import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { KiyoMapShell } from "@/components/kiyo-map/KiyoMapShell";
import { KiyoMapWorkspace } from "@/components/kiyo-map/KiyoMapWorkspace";

export default async function KiyoMapPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/kiyo-map/map");
  }

  return (
    <KiyoMapShell userEmail={session.user.email}>
      <KiyoMapWorkspace />
    </KiyoMapShell>
  );
}
