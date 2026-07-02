import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { KiyoMapCompletedProjects } from "@/components/kiyo-map/KiyoMapCompletedProjects";
import { KiyoMapShell } from "@/components/kiyo-map/KiyoMapShell";

export default async function KiyoMapCompletedPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/kiyo-map/completed");
  }

  return (
    <KiyoMapShell userEmail={session.user.email}>
      <KiyoMapCompletedProjects />
    </KiyoMapShell>
  );
}
