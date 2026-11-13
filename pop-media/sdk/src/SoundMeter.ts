import EventEmitter from 'events';

export class SoundMeter extends EventEmitter {
  private context: AudioContext | null = null;
  private _volume = 0.0;
  private mic: MediaStreamAudioSourceNode | null = null;
  private node: AnalyserNode | null = null;
  private currentThresholdStatus = false;
  private _frameHandle: number = 0;

  constructor(private threshold = 0.01) {
    super();
  }

  private reset = () => {
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    this.context = new AudioContext();
    this.node = this.context.createAnalyser();

    return { context: this.context, node: this.node };
  };

  private onFrame = () => {
    if (!this.node) return;

    const pcmData = new Float32Array(this.node.fftSize);
    this.node.getFloatTimeDomainData(pcmData);
    let sumSquares = 0.0;
    for (const amplitude of pcmData) {
      sumSquares += amplitude * amplitude;
    }
    this._volume = Math.sqrt(sumSquares / pcmData.length);
    if (this.currentThresholdStatus !== this._volume > this.threshold) {
      this.currentThresholdStatus = this._volume > this.threshold;
      this.emit('thresholdStatusChange', this.currentThresholdStatus);
    }
    this._frameHandle = window.requestAnimationFrame(this.onFrame);
  };

  connectToStream = async (stream: MediaStream) => {
    try {
      const { context, node } = this.reset();
      this.mic = context.createMediaStreamSource(stream);
      this.mic.connect(node);
      this.onConnected();
    } catch (e) {
      console.error(e);
    }
  };

  private onConnected = () => {
    this._frameHandle = window.requestAnimationFrame(this.onFrame);
  };

  disconnect = async () => {
    this.mic?.disconnect();
    this.node?.disconnect();
    if (this._frameHandle) cancelAnimationFrame(this._frameHandle);
  };

  /**
   * Current volume level of the source
   */
  get volume() {
    return this._volume;
  }
}
