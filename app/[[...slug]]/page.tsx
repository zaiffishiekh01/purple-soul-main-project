"use client";

import dynamic from "next/dynamic";

const LegacyAppShell = dynamic(() => import("@/LegacyAppShell"), {
  ssr: false,
});

export default function CatchAllPage() {
  return <LegacyAppShell />;
}
