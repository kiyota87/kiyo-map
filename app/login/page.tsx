"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") ?? "/kiyo-ai-orchestration";
  const error = searchParams.get("error");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#12102a] px-6 text-[#e8e4ff]">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm text-[#fed100]">AI Orchestration</p>
        <h1 className="text-2xl font-semibold">
          AIオーケストレーション・kiyoワークスペース
        </h1>
        <p className="max-w-md text-sm text-[#c8c0f0]">
          Google アカウントでログインしてください。許可されたメールアドレスのみアクセスできます。
        </p>
        {error ? (
          <p className="text-sm text-red-300">
            ログインに失敗しました。許可された Google アカウントか確認してください。
          </p>
        ) : null}
      </div>
      <Button
        className="kiyo-btn-accent h-10 px-6"
        onClick={() => signIn("google", { callbackUrl })}
      >
        Google でログイン
      </Button>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#12102a] text-[#e8e4ff]">
          読み込み中…
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
