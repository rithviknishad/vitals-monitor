"use client";

import { useCallback, useRef } from "react";
import useCanvas from "@/hooks/useCanvas";
import VitalsMonitorClient, {
  VitalsMonitorObservation,
} from "./VitalsMonitorClient";
import VitalsRenderer from "./VitalsRenderer";

const MONITOR_SIZE = { width: 880, height: 420 };

export default function useVitalsMonitor() {
  const { canvasRef, contextRef } = useCanvas();

  const monitor = useRef<VitalsMonitorClient>();

  const ecgRenderer = useRef<VitalsRenderer | null>(null);
  const plethRenderer = useRef<VitalsRenderer | null>(null);
  const spo2Renderer = useRef<VitalsRenderer | null>(null);

  const connect = useCallback(
    (socketUrl: string) => {
      monitor.current?.disconnect();

      monitor.current = new VitalsMonitorClient(socketUrl);

      const renderContext = contextRef.current as CanvasRenderingContext2D;

      monitor.current.once("ecg-waveform", (observation) => {
        ecgRenderer.current = new VitalsRenderer(renderContext, {
          channel: "ECG",
          cycleDuration: 7e3,
          position: { x: 0, y: 0 },
          rows: 2,
          ...parseOptionsFromObservation(observation),
        });
        monitor.current?.on("ecg-waveform", ingestTo(ecgRenderer.current));
      });

      monitor.current.once("pleth-waveform", (observation) => {
        plethRenderer.current = new VitalsRenderer(renderContext, {
          channel: "Pleth",
          cycleDuration: 7e3,
          position: { x: 0, y: MONITOR_SIZE.height * 0.5 },
          ...parseOptionsFromObservation(observation),
        });
        monitor.current?.on("pleth-waveform", ingestTo(plethRenderer.current));
      });

      monitor.current.once("resp-waveform", (observation) => {
        spo2Renderer.current = new VitalsRenderer(renderContext, {
          channel: "Resp",
          cycleDuration: 7e3,
          position: { x: 0, y: MONITOR_SIZE.height * 0.75 },
          ...parseOptionsFromObservation(observation),
        });
        monitor.current?.on("resp-waveform", ingestTo(spo2Renderer.current));
      });

      monitor.current.connect();
    },
    [contextRef]
  );

  return { canvasRef, connect, size: MONITOR_SIZE };
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

const ingestTo = (vitalsRenderer: VitalsRenderer) => {
  return (observation: VitalsMonitorObservation) => {
    vitalsRenderer.append(
      observation.data?.split(" ").map((x) => parseInt(x)) || []
    );
  };
};
