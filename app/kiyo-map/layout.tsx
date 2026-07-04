import type { ReactNode } from "react";

import { KIYO_MAP_WORKSPACE_NAME } from "@/lib/kiyo-map/branding";
import "./kiyo-map-theme.css";

export const metadata = {
  title: KIYO_MAP_WORKSPACE_NAME,
  description: "案件とアイディアを一元管理するワークスペース",
};

export default function KiyoMapLayout({ children }: { children: ReactNode }) {
  return children;
}
