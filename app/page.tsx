"use client";

import { useState } from "react";
import VitalsSourceConfig from "./VitalsSourceConfig";
import DummyVitalsMonitor from "./DummyVitalsMonitor";

export default function Home() {
  const [socketUrl, setSocketUrl] = useState("");

  return (
    <div className="flex flex-col h-screen w-full items-center gap-2">
      <VitalsSourceConfig onConnect={setSocketUrl} />
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-2">
        {socketUrl &&
          Array.from({ length: 9 }).map((_, i) => (
            <DummyVitalsMonitor key={i} socketUrl={socketUrl} />
          ))}
      </div>
    </div>
  );
}
