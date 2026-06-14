import type { ReactNode } from "react";
import { Toaster } from "sonner";
import "./kiyo-theme.css";

export default function KiyoLayout({ children }: { children: ReactNode }) {
  return (
    <div data-workspace="kiyo" className="min-h-screen">
      {children}
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "#221e42",
            border: "0.5px solid #392171",
            color: "#e8e4ff",
          },
        }}
      />
    </div>
  );
}
