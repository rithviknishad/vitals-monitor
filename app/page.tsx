"use client";

import { useCallback, useRef } from "react";
import VitalsSourceConfig from "./VitalsSourceConfig";

export default function Home() {
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback((socketUrl: string) => {
    if (ws.current) {
      ws.current.close();
    }

    ws.current = new WebSocket(socketUrl);
    ws.current.onopen = () => console.log("connected");
    ws.current.onclose = () => console.log("disconnected");

    ws.current.addEventListener("message", (event) => {
      console.log(event.data);
    });
  }, []);

  return (
    <div className="flex flex-col h-screen w-full gap-2 bg-black text-white">
      <VitalsSourceConfig onConnect={connect} />
    </div>
  );
}
