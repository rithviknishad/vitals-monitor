"use client";

import { MONITOR_SIZE } from "@/VitalsMonitor/constants";
import VitalsSourceConfig from "./VitalsSourceConfig";
import useVitalsMonitor from "@/VitalsMonitor/useVitalsMonitor";

export default function Home() {
  const { connect, canvasRef } = useVitalsMonitor();

  return (
    <div className="flex flex-col h-screen w-full gap-2">
      <VitalsSourceConfig onConnect={connect} />
      <canvas
        className="bg-black"
        style={{
          height: MONITOR_SIZE.height,
          width: MONITOR_SIZE.width,
        }}
        ref={canvasRef}
        {...MONITOR_SIZE}
      />
    </div>
  );
}
