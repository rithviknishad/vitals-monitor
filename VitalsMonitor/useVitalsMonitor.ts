"use client";

import { useCallback, useRef } from "react";
import useCanvas from "@/hooks/useCanvas";
import VitalsMonitorClient, {
  VitalsMonitorObservation,
} from "./VitalsMonitorClient";
import VitalsRenderer, { ChannelOptions } from "./VitalsRenderer";

const MONITOR_SIZE = { width: 880, height: 420 };

export default function useVitalsMonitor() {
  const { canvasRef, contextRef } = useCanvas();

  const monitor = useRef<VitalsMonitorClient>();
  const renderer = useRef<VitalsRenderer | null>(null);

  const ecgOptionsRef = useRef<ChannelOptions>();
  const plethOptionsRef = useRef<ChannelOptions>();
  const spo2OptionsRef = useRef<ChannelOptions>();

  const connect = useCallback(
    (socketUrl: string) => {
      monitor.current?.disconnect();

      monitor.current = new VitalsMonitorClient(socketUrl);
      monitor.current.connect();

      function obtainRenderer() {
        if (
          !ecgOptionsRef.current ||
          !plethOptionsRef.current ||
          !spo2OptionsRef.current
        )
          return;

        renderer.current = new VitalsRenderer({
          renderContext: contextRef.current as CanvasRenderingContext2D,
          size: MONITOR_SIZE,
          animationInterval: 50,
          ecg: ecgOptionsRef.current,
          pleth: plethOptionsRef.current,
          spo2: spo2OptionsRef.current,
        });

        const _renderer = renderer.current;
        const _monitor = monitor.current;

        _monitor?.on("ecg-waveform", ingestTo(_renderer, "ecg"));
        _monitor?.on("pleth-waveform", ingestTo(_renderer, "pleth"));
        _monitor?.on("spo2-waveform", ingestTo(_renderer, "spo2"));
      }

      monitor.current.once("ecg-waveform", (observation) => {
        ecgOptionsRef.current = getChannel(observation);
        obtainRenderer();
      });

      monitor.current.once("pleth-waveform", (observation) => {
        plethOptionsRef.current = getChannel(observation);
        obtainRenderer();
      });

      monitor.current.once("spo2-waveform", (observation) => {
        spo2OptionsRef.current = getChannel(observation);
        obtainRenderer();
      });
    },
    [contextRef]
  );

  return { canvasRef, connect, size: MONITOR_SIZE };
}

const getChannel = (observation: VitalsMonitorObservation): ChannelOptions => {
  return {
    samplingRate: parseInt(
      observation["sampling rate"]?.replace("/sec", "") ?? "-1"
    ),
    baseline: observation["data-baseline"] ?? 0,
    lowLimit: observation["data-low-limit"] ?? 0,
    highLimit: observation["data-high-limit"] ?? 0,
  };
};

const ingestTo = (
  vitalsRenderer: VitalsRenderer,
  channel: "ecg" | "pleth" | "spo2"
) => {
  return (observation: VitalsMonitorObservation) => {
    vitalsRenderer.append(
      channel,
      observation.data?.split(" ").map((x) => parseInt(x)) || []
    );
  };
};
