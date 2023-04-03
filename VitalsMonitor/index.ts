import { ObservationID, VitalsMonitorObservation } from "./types";

import { EventEmitter } from "stream";

type EventName =
  | ObservationID
  | "ecg-waveform"
  | "pleth-waveform"
  | "resp-waveform";

const WAVEFORM_KEY_MAP: Record<string, EventName> = {
  II: "ecg-waveform",
  Pleth: "pleth-waveform",
  Respiration: "resp-waveform",
};

class VitalsMonitor extends EventEmitter {
  constructor(socketUrl: string) {
    super();
    this._ws = new WebSocket(socketUrl);
  }

  _ws: WebSocket;

  connect() {
    this._ws.onopen = () => console.log("connected");
    this._ws.onclose = () => console.log("disconnected");

    this._ws.addEventListener("message", (event) => {
      const observations = this._parseObservations(event.data);

      observations.forEach((observation) => {
        if (observation["wave-name"]) {
          this.emit(WAVEFORM_KEY_MAP[observation["wave-name"]], observation);
        } else {
          this.emit(observation.observation_id, observation);
        }
      });
    });
  }

  _parseObservations(data: string): VitalsMonitorObservation[] {
    const observations = JSON.parse(data || "[]");
    return observations;
  }

  disconnect() {
    this._ws.close();
  }

  on(
    event: EventName,
    listener: (data: VitalsMonitorObservation) => void
  ): this {
    return super.on(event, listener);
  }

  emit(event: EventName, data: VitalsMonitorObservation): boolean {
    return super.emit(event, data);
  }

  once(
    event: EventName,
    listener: (data: VitalsMonitorObservation) => void
  ): this {
    return super.once(event, listener);
  }

  off(
    event: EventName,
    listener: (data: VitalsMonitorObservation) => void
  ): this {
    return super.off(event, listener);
  }
}

export default VitalsMonitor;
