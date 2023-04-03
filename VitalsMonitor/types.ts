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
