"use client";

import { useCallback, useState } from "react";
import VitalsSourceConfig from "./VitalsSourceConfig";
import useVitalsMonitor from "@/VitalsMonitor/useVitalsMonitor";
import DummyVitalsMonitor from "./DummyVitalsMonitor";

export default function Home() {
  const [socketUrl, setSocketUrl] = useState("");

  return (
    <div className="flex flex-col h-screen w-full items-center gap-2">
      <VitalsSourceConfig onConnect={setSocketUrl} />
      {socketUrl &&
        Array.from({ length: 9 }).map((_, i) => (
          <DummyVitalsMonitor key={i} socketUrl={socketUrl} />
        ))}
    </div>
  );
}
