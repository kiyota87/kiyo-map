"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Map, Sparkles } from "lucide-react";

import { KIYO_MAP_WORKSPACE_NAME } from "@/lib/kiyo-map/branding";
import { Button } from "@/components/ui/button";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") ?? "/kiyo-map/map";
  const error = searchParams.get("error");
  const isKiyoMap = callbackUrl.startsWith("/kiyo-map");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#392171] px-6 text-[#f8f4ff]">
      <div className="flex flex-col items-center gap-2 text-center">
        {isKiyoMap ? (
          <>
            <Map className="size-8 text-[#fed100]" aria-hidden />
            <p className="text-sm text-[#fed100]">Kiyo Map</p>
            <h1 className="max-w-lg text-2xl font-semibold">
              {KIYO_MAP_WORKSPACE_NAME}
            </h1>
            <p className="max-w-md text-sm text-[#c8c0f0]">
              Google アカウントでログインしてください。許可されたメールアドレスのみ
              案件管理ワークスペースにアクセスできます。
            </p>
          </>
        ) : (
          <>
            <Sparkles className="size-8 text-[#fed100]" aria-hidden />
            <p className="text-sm text-[#fed100]">AI Orchestration</p>
            <h1 className="text-2xl font-semibold">
              AIオーケストレーション・kiyoワークスペース
            </h1>
            <p className="max-w-md text-sm text-[#c8c0f0]">
              Google アカウントでログインしてください。許可されたメールアドレスのみ
              kiyo / kiyo-map にアクセスできます。
            </p>
          </>
        )}
        {error ? (
          <p className="text-sm text-red-300">
            ログインに失敗しました。許可された Google アカウントか確認してください。
          </p>
        ) : null}
      </div>
      <Button
        className="h-10 rounded px-6 font-medium"
        style={{ background: "#fed100", color: "#1e1238" }}
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
        <div className="flex min-h-screen items-center justify-center bg-[#392171] text-[#f8f4ff]">
          読み込み中…
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
