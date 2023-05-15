"use client";

import { useCallback, useRef, useState } from "react";
import useCanvas from "@/hooks/useCanvas";
import VitalsDeviceClient, {
  VitalsData,
  VitalsValue,
  VitalsWaveformData,
} from "./VitalsDeviceClient";
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

interface VitalsBPValue {
  systolic: VitalsValue;
  diastolic: VitalsValue;
  map: VitalsValue;
}

export default function useVitalsMonitor() {
  const waveformForegroundCanvas = useCanvas();
  const waveformBackgroundCanvas = useCanvas();

  // Non waveform data states.
  const [pulseRate, setPulseRate] = useState<VitalsValue>();
  const [bp, setBp] = useState<VitalsBPValue>();
  const [spo2, setSpo2] = useState<VitalsValue>();
  const [respiratoryRate, setRespiratoryRate] = useState<VitalsValue>();
  const [temperature1, setTemperature1] = useState<VitalsValue>();
  const [temperature2, setTemperature2] = useState<VitalsValue>();

  // Waveform data states.
  const device = useRef<VitalsDeviceClient>();
  const renderer = useRef<VitalsRenderer | null>(null);

  const ecgOptionsRef = useRef<ChannelOptions>();
  const plethOptionsRef = useRef<ChannelOptions>();
  const spo2OptionsRef = useRef<ChannelOptions>();

  const connect = useCallback(
    (socketUrl: string) => {
      device.current?.disconnect();

      device.current = new VitalsDeviceClient(socketUrl);
      device.current.connect();

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
        device.current!.on("ecg-waveform", ingestTo(_renderer, "ecg"));
        device.current!.on("pleth-waveform", ingestTo(_renderer, "pleth"));
        device.current!.on("spo2-waveform", ingestTo(_renderer, "spo2"));

        const hook = (set: (data: any) => void) => (d: VitalsData) => set(d);
        device.current!.on("heart-rate", hook(setPulseRate));
        device.current!.on("SpO2", hook(setSpo2));
        device.current!.on("respiratory-rate", hook(setRespiratoryRate));
        device.current!.on("body-temperature1", hook(setTemperature1));
        device.current!.on("body-temperature2", hook(setTemperature2));
        device.current!.on("blood-pressure", hook(setBp));
      }

      device.current.once("ecg-waveform", (observation) => {
        ecgOptionsRef.current = getChannel(observation as VitalsWaveformData);
        obtainRenderer();
      });

      device.current.once("pleth-waveform", (observation) => {
        plethOptionsRef.current = getChannel(observation as VitalsWaveformData);
        obtainRenderer();
      });

      device.current.once("spo2-waveform", (observation) => {
        spo2OptionsRef.current = getChannel(observation as VitalsWaveformData);
        obtainRenderer();
      });
    },
    [waveformForegroundCanvas.contextRef, waveformBackgroundCanvas]
  );

  return {
    connect,
    waveformCanvas: {
      foreground: waveformForegroundCanvas,
      background: waveformBackgroundCanvas,
      size: MONITOR_WAVEFORMS_CANVAS_SIZE,
    },
    data: {
      pulseRate,
      bp,
      spo2,
      respiratoryRate,
      temperature1,
      temperature2,
    },
  };
}

const getChannel = (observation: VitalsWaveformData): ChannelOptions => {
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
  return (observation: VitalsData) => {
    vitalsRenderer.append(
      channel,
      (observation as VitalsWaveformData).data
        .split(" ")
        .map((x) => parseInt(x)) || []
    );
  };
};
