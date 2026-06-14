import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { KiyoWorkspace } from "@/components/kiyo/KiyoWorkspace";

export const metadata = {
  title: "AIオーケストレーション・kiyoワークスペース",
};

export default async function KiyoPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/kiyo-ai-orchestration");
  }

  return (
    <KiyoWorkspace userEmail={session.user.email ?? ""} />
  );
}
