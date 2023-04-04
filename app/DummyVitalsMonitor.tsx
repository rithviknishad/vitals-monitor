import useVitalsMonitor from "@/VitalsMonitor/useVitalsMonitor";
import { useEffect } from "react";

export default function DummyVitalsMonitor({
  socketUrl,
}: {
  socketUrl: string;
}) {
  const monitor = useVitalsMonitor();

  useEffect(() => {
    monitor.connect(socketUrl);
  }, [socketUrl]);

  const size = { width: monitor.size.width, height: monitor.size.height + 100 };

  return <canvas className="bg-black" ref={monitor.canvasRef} {...size} />;
}
