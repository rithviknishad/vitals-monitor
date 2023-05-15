"use client";

import { useCallback, useRef } from "react";
import useCanvas from "@/hooks/useCanvas";
import VitalsMonitorClient, {
  VitalsMonitorObservation,
  VitalsMonitorWaveformData,
} from "./VitalsMonitorClient";
import VitalsRenderer, { ChannelOptions } from "./VitalsRenderer";

const MONITOR_RATIO = {
  w: 13,
  h: 11,
};
const MONITOR_SCALE = 38;
const MONITOR_WAVEFORMS_CANVAS_SIZE = {
  width: MONITOR_RATIO.h * MONITOR_SCALE,
  height: MONITOR_RATIO.h * MONITOR_SCALE,
};
const MONITOR_SIZE = {
  width: MONITOR_RATIO.w * MONITOR_SCALE,
  height: MONITOR_RATIO.h * MONITOR_SCALE,
};

export default function useVitalsMonitor(callbacks?: {
  [key in Parameters<VitalsMonitorClient["on"]>[0]]: (
    observation: VitalsMonitorObservation
  ) => void;
}) {
  const waveformForegroundCanvas = useCanvas();
  const waveformBackgroundCanvas = useCanvas();

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
          foregroundRenderContext: waveformForegroundCanvas.contextRef.current!,
          backgroundRenderContext: waveformBackgroundCanvas.contextRef.current!,
          size: MONITOR_WAVEFORMS_CANVAS_SIZE,
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

        if (callbacks) {
          Object.entries(callbacks).forEach(([key, callback]) => {
            _monitor?.on(key as any, callback);
          });
        }
      }

      monitor.current.once("ecg-waveform", (observation) => {
        ecgOptionsRef.current = getChannel(
          observation as VitalsMonitorWaveformData
        );
        obtainRenderer();
      });

      monitor.current.once("pleth-waveform", (observation) => {
        plethOptionsRef.current = getChannel(
          observation as VitalsMonitorWaveformData
        );
        obtainRenderer();
      });

      monitor.current.once("spo2-waveform", (observation) => {
        spo2OptionsRef.current = getChannel(
          observation as VitalsMonitorWaveformData
        );
        obtainRenderer();
      });
    },
    [waveformForegroundCanvas.contextRef]
  );

  return {
    connect,
    waveformCanvas: {
      foreground: waveformForegroundCanvas,
      background: waveformBackgroundCanvas,
      size: MONITOR_WAVEFORMS_CANVAS_SIZE,
    },
  };
}

const getChannel = (observation: VitalsMonitorWaveformData): ChannelOptions => {
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
      (observation as VitalsMonitorWaveformData).data
        .split(" ")
        .map((x) => parseInt(x)) || []
    );
  };
};
