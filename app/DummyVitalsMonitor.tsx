import useVitalsMonitor from "@/VitalsMonitor/useVitalsMonitor";
import { useEffect } from "react";

/**
 * A dummy vitals monitor that connects to a socket and renders the vitals
 * waveform.
 */
export default function DummyVitalsMonitor(props: { socketUrl: string }) {
  const monitor = useVitalsMonitor();

  useEffect(() => {
    monitor.connect(props.socketUrl);
  }, [props.socketUrl]);

  const size = { width: monitor.size.width, height: monitor.size.height + 100 };

  return <canvas className="bg-black" ref={monitor.canvasRef} {...size} />;
}
