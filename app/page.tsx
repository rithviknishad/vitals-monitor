"use client";

import { useCallback } from "react";
import VitalsSourceConfig from "./VitalsSourceConfig";
import useVitalsMonitor from "@/VitalsMonitor/useVitalsMonitor";

export default function Home() {
  const monitor1 = useVitalsMonitor();
  const monitor2 = useVitalsMonitor();
  const monitor3 = useVitalsMonitor();
  const monitor4 = useVitalsMonitor();
  const monitor5 = useVitalsMonitor();
  const monitor6 = useVitalsMonitor();
  const monitor7 = useVitalsMonitor();
  const monitor8 = useVitalsMonitor();
  const monitor9 = useVitalsMonitor();

  const connect = useCallback(
    (socketUrl: string) => {
      monitor1.connect(socketUrl);
      monitor2.connect(socketUrl);
      monitor3.connect(socketUrl);
      monitor4.connect(socketUrl);
      monitor5.connect(socketUrl);
      monitor6.connect(socketUrl);
      monitor7.connect(socketUrl);
      monitor8.connect(socketUrl);
      monitor9.connect(socketUrl);
    },
    [
      monitor1,
      monitor2,
      monitor3,
      monitor4,
      monitor5,
      monitor6,
      monitor7,
      monitor8,
      monitor9,
    ]
  );

  return (
    <div className="flex flex-col h-screen w-full gap-2">
      <VitalsSourceConfig onConnect={connect} />
      <div className="flex flex-col gap-2">
        <canvas
          className="bg-black"
          style={monitor1.size}
          ref={monitor1.canvasRef}
          {...monitor1.size}
        />
        <canvas
          className="bg-black"
          style={monitor2.size}
          ref={monitor2.canvasRef}
          {...monitor2.size}
        />
        <canvas
          className="bg-black"
          style={monitor3.size}
          ref={monitor3.canvasRef}
          {...monitor3.size}
        />
        <canvas
          className="bg-black"
          style={monitor4.size}
          ref={monitor4.canvasRef}
          {...monitor4.size}
        />
        <canvas
          className="bg-black"
          style={monitor5.size}
          ref={monitor5.canvasRef}
          {...monitor5.size}
        />
        <canvas
          className="bg-black"
          style={monitor6.size}
          ref={monitor6.canvasRef}
          {...monitor6.size}
        />
        <canvas
          className="bg-black"
          style={monitor7.size}
          ref={monitor7.canvasRef}
          {...monitor7.size}
        />
        <canvas
          className="bg-black"
          style={monitor8.size}
          ref={monitor8.canvasRef}
          {...monitor8.size}
        />
        <canvas
          className="bg-black"
          style={monitor9.size}
          ref={monitor9.canvasRef}
          {...monitor9.size}
        />
      </div>
    </div>
  );
}
