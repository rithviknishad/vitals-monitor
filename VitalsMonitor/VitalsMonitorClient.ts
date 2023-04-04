import { EventEmitter } from "events";

const WAVEFORM_KEY_MAP: Record<string, EventName> = {
  II: "ecg-waveform",
  Pleth: "pleth-waveform",
  Respiration: "spo2-waveform",
};

/**
 * Provides the API for connecting to the Vitals Monitor WebSocket and emitting
 * events for each observation.
 *
 * @example
 * const vitalsMonitor = new VitalsMonitor("wss://vitals-middleware.local/observations/192.168.1.14");
 *
 * vitalsMonitor.on("SpO2", (observation) => {
 *  console.log(observation.value);
 * });
 */
class VitalsMonitorClient extends EventEmitter {
  constructor(socketUrl: string) {
    super();
    this._ws = new WebSocket(socketUrl);
  }

  _ws: WebSocket;

  connect() {
    this._ws.onopen = () =>
      console.info(`VitalsMonitorClient(${this._ws.url}): Connected`);

    this._ws.onclose = () =>
      console.info(`VitalsMonitorClient(${this._ws.url}): Disconnected`);

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

  _parseObservations(data: string) {
    return JSON.parse(data || "[]") as VitalsMonitorObservation[];
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

export default VitalsMonitorClient;

export type ObservationID =
  | "heart-rate"
  | "ST"
  | "SpO2"
  | "pulse-rate"
  | "respiratory-rate"
  | "body-temperature1"
  | "body-temperature2"
  | "waveform";

export interface VitalsMonitorObservation {
  observation_id: ObservationID | "waveform";
  device_id: string;
  "date-time": string;
  "patient-id": string;
  "patient-name": string;
  status?: string;
  value?: number;
  unit?: string;
  interpretation?: string;
  "low-limit"?: number;
  "high-limit"?: number;
  "wave-name"?: "II" | "Pleth" | "Respiration";
  resolution?: string;
  "sampling rate"?: string;
  "data-baseline"?: number;
  "data-low-limit"?: number;
  "data-high-limit"?: number;
  data?: string;
}

type EventName =
  | ObservationID
  | "ecg-waveform"
  | "pleth-waveform"
  | "spo2-waveform";
