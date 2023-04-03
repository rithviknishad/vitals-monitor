import { useCallback, useEffect, useRef } from "react";
import { VitalsMonitorObservation } from "./types";
import useCanvas from "@/hooks/useCanvas";
import VitalsMonitor from ".";
import { MONITOR_SIZE } from "./constants";
import VitalsWaveform from "./VitalsWaveform";

export default function useVitalsMonitor() {
  const { canvasRef, contextRef } = useCanvas();

  const monitor = useRef<VitalsMonitor | null>(null);

  const ecgWaveform = useRef<VitalsWaveform | null>(null);
  const plethWaveform = useRef<VitalsWaveform | null>(null);
  const respirationWaveform = useRef<VitalsWaveform | null>(null);

  const connect = useCallback(
    (socketUrl: string) => {
      monitor.current?.disconnect();
      monitor.current = new VitalsMonitor(socketUrl);

      const renderContext = contextRef.current as CanvasRenderingContext2D;

      monitor.current.once("ecg-waveform", (observation) => {
        ecgWaveform.current = new VitalsWaveform(renderContext, {
          channel: "ECG",
          cycleDuration: 7e3,
          position: { x: 0, y: 0 },
          rows: 2,
          ...parseOptionsFromObservation(observation),
        });
      });

      monitor.current.once("pleth-waveform", (observation) => {
        plethWaveform.current = new VitalsWaveform(renderContext, {
          channel: "Pleth",
          cycleDuration: 14e3,
          position: { x: 0, y: MONITOR_SIZE.height * 0.5 },
          rows: 1,
          ...parseOptionsFromObservation(observation),
        });
      });

      monitor.current.once("resp-waveform", (observation) => {
        respirationWaveform.current = new VitalsWaveform(renderContext, {
          channel: "Resp",
          cycleDuration: 7e3,
          position: { x: 0, y: MONITOR_SIZE.height * 0.75 },
          ...parseOptionsFromObservation(observation),
        });
      });

      monitor.current.connect();
    },
    [contextRef]
  );

  return { canvasRef, connect };
}

const parseOptionsFromObservation = (observation: VitalsMonitorObservation) => {
  const samplingInterval =
    1e3 / parseInt(observation["sampling rate"]?.replace("/sec", "") ?? "-1");

  if (samplingInterval <= 0) {
    throw new Error("Invalid sampling rate");
  }

  return {
    size: { width: 800, height: MONITOR_SIZE.height / 4 },
    samplingInterval,
    baseline: observation["data-baseline"] ?? 0,
    lowLimit: observation["data-low-limit"] ?? 0,
    highLimit: observation["data-high-limit"] ?? 0,
  };
};
