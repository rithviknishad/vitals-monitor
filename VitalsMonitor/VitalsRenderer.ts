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

/**
 * Provides the API for rendering vitals waveform data.
 * @param renderContext The canvas rendering context to use for rendering.
 * @param options The options to use for rendering.
 *
 * @example
 * const renderContext = canvas.getContext("2d");
 *
 * const renderer = new VitalsRenderer(renderContext, {
 *  channel: "ECG",
 *  samplingInterval: 100,
 *  baseline: 0,
 *  lowLimit: -1,
 *  highLimit: 1,
 *  cycleDuration: 7000,
 *  rows: 2,
 *  position: { x: 0, y: 0 },
 *  size: { width: 100, height: 100 },
 * });
 *
 * renderer.append([0, 0.5, 1, 0.5, 0, -0.5, -1, -0.5, 0]);
 */
class VitalsRenderer {
  constructor(renderContext: CanvasRenderingContext2D, options: Options) {
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

    this.buffer = [];
    this.renderContext = renderContext;
    this.options = options;
    this.deltaX = (samplingInterval / cycleDuration) * width * rows;
    this.transform = lerp(lowLimit, highLimit, y, y + height);
    this.cursorX = -this.deltaX;
    this.interval = setInterval(() => {
      const next = this.buffer.shift();
      if (!next) {
        console.log("no more data in ", this.options.channel);
        return;
      }

      console.log(
        "buffer length in ",
        this.options.channel,
        this.buffer.length
      );

      // Move the cursor to the next data point.
      this.cursorX += this.deltaX;

      // If the cursor is out of bounds, move it to the beginning of the first row.
      if (this.cursorX > this.options.size.width * rows) {
        this.cursorX = 0;
      }

      // Move cursor to correct row.
      const deltaRows = Math.floor(this.cursorX / this.options.size.width);
      const x = this.cursorX - deltaRows * this.options.size.width;
      const y = next + deltaRows * this.options.size.height;

      // Draw a point
      const ctx = this.renderContext;
      ctx.fillStyle = "yellow";
      ctx.beginPath();
      ctx.arc(x, y, 0.5, 0, 2 * Math.PI);
      ctx.fill();

      // const buffer = [...this.buffer];
      // this.buffer = [];

      // if (buffer.length === 0) {
      //   console.log("no data in ", this.options.channel);
      //   return;
      // }

      // const { size, rows = 1 } = this.options;

      // for (const next of buffer) {
      //   // Move the cursor to the next data point.
      //   this.cursorX += this.deltaX;

      //   // If the cursor is out of bounds, move it to the beginning of the first row.
      //   if (this.cursorX > size.width * rows) {
      //     this.cursorX = 0;
      //   }

      //   // Move cursor to correct row.
      //   const deltaRows = Math.floor(this.cursorX / size.width);
      //   const x = this.cursorX - deltaRows * size.width;
      //   const y = next + deltaRows * size.height;

      //   // Draw a point
      //   const ctx = this.renderContext;
      //   ctx.fillStyle = "yellow";
      //   ctx.beginPath();
      //   ctx.arc(x, y, 0.5, 0, 2 * Math.PI);
      //   ctx.fill();
    }, samplingInterval);
  }

  /**
   * Transforms the data points and appends them to the buffer.
   * @param data The data points to append to the buffer.
   */
  append(data: number[]) {
    this.buffer.push(...data.map(this.transform));
  }

  /**
   * The options for this waveform.
   */
  private options: Options;
  /**
   * The canvas render context to draw the waveform.
   */
  private renderContext: CanvasRenderingContext2D;
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

export default VitalsRenderer;

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
