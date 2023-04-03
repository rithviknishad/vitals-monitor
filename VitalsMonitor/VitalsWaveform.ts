interface Options {
  /**
   * The name of the channel.
   */
  channel: string;
  /**
   * The delta milliseconds between each data point.
   */
  samplingInterval: number;
  /**
   * The baseline value for this channel.
   */
  baseline: number;
  /**
   * The minimum value that can be displayed for this channel.
   */
  lowLimit: number;
  /**
   * The maximum value that can be displayed for this channel.
   */
  highLimit: number;
  /**
   * The duration taken for the waveform to complete one cycle.
   * After this duration, the cursor will start from the beginning of the
   * first row of this channel.
   */
  cycleDuration: number;
  /**
   * The number of rows to display for this channel.
   */
  rows?: number;
  /**
   * The starting position of the waveform.
   */
  position: { x: number; y: number };
  /**
   * Size of the waveform (for a single row).
   *
   * If multiple rows are specified, the height of the overall waveform will be
   * multiplied by the number of rows.
   */
  size: { width: number; height: number };
}

class VitalsWaveform {
  constructor(canvas: CanvasRenderingContext2D, options: Options) {
    const {
      samplingInterval,
      cycleDuration,
      rows = 1,
      lowLimit,
      highLimit,
      position: { y },
      size: { width, height },
    } = options;

    if (rows < 1) {
      throw new Error("Rows must be greater than 0");
    }

    this.canvas = canvas;
    this.options = options;
    this.deltaX = (samplingInterval / cycleDuration) * width * rows;
    this.interval = setInterval(this.draw, samplingInterval);
    this.transform = lerp(lowLimit, highLimit, y, y + height);
    this.cursorX = -this.deltaX;
  }

  /**
   * Transforms the data points and appends them to the buffer.
   * @param data The data points to append to the buffer.
   */
  append(data: number[]) {
    this.buffer.push(...data.map(this.transform));
  }

  private draw() {
    const next = this.buffer.shift();
    if (!next) return;

    const { size, rows = 1 } = this.options;

    // Move the cursor to the next data point.
    this.cursorX += this.deltaX;

    // If the cursor is out of bounds, move it to the beginning of the first row.
    if (this.cursorX > size.width * rows) {
      this.cursorX = 0;
    }

    // Move cursor to correct row.
    const deltaRows = Math.floor(this.cursorX / size.width);
    const x = this.cursorX - deltaRows * size.width;
    const y = next + deltaRows * size.height;

    // Draw a point
    const ctx = this.canvas;
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, 2 * Math.PI);
    ctx.fill();
  }

  /**
   * The options for this waveform.
   */
  private options: Options;
  /**
   * The canvas context to draw the waveform.
   */
  private canvas: CanvasRenderingContext2D;
  /**
   * The width between two data points in the same row.
   */
  private deltaX: number;
  /**
   * The buffer to store the transformed data points that are yet to be drawn.
   */
  private buffer: number[] = [];
  /**
   * The interval timer to draw the waveform.
   */
  private interval: NodeJS.Timer;
  /**
   * The current x coordinate of the cursor.
   */
  private cursorX: number;
  /**
   * Transforms the data points to the range of the waveform.
   */
  private transform: (data: number) => number;
}

export default VitalsWaveform;

/**
 * Maps a value from one range to another.
 * Or in mathematical terms, it performs a linear interpolation.
 *
 * @param x0 The lower bound of the input range.
 * @param x1 The upper bound of the input range.
 * @param y0 The lower bound of the output range.
 * @param y1 The upper bound of the output range.
 * @returns A function that maps a value from the input range to the output range.
 * @example
 * const map = lerp(0, 100, 0, 1);
 * map(50); // 0.5
 * map(100); // 1
 * map(0); // 0
 * map(200); // 2
 * map(-100); // -1
 */
const lerp = (x0: number, x1: number, y0: number, y1: number) => {
  // The first order partial differential of y with respect to x.
  const dy_by_dx = (y1 - y0) / (x1 - x0);
  return (x: number) => y0 + (x - x0) * dy_by_dx;
};
