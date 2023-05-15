import useVitalsMonitor from "@/VitalsMonitor/useVitalsMonitor";
import { useEffect } from "react";

/**
 * A dummy vitals monitor that connects to a socket and renders the vitals
 * waveform.
 */
export default function DummyVitalsMonitor(props: { socketUrl: string }) {
  const { connect, waveformCanvas } = useVitalsMonitor();

  useEffect(() => {
    connect(props.socketUrl);
  }, [props.socketUrl, connect]);

  return (
    <div className="flex gap-2 bg-black p-2 rounded">
      <div className="relative">
        <canvas
          className="top-0 left-0"
          ref={waveformCanvas.foreground.canvasRef}
          {...waveformCanvas.size}
        />
      </div>
      <div className="w-20 text-white">hello</div>
    </div>
  );
}
