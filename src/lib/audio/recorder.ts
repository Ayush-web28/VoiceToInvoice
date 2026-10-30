/**
 * Browser Audio Recording Utility using HTML5 MediaRecorder and AudioContext
 */

export interface AudioVisualizerCallback {
  (frequencyData: Uint8Array): void;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private onVisualizerData: AudioVisualizerCallback | null = null;
  private startTime: number = 0;
  private durationSeconds: number = 0;
  private timerInterval: NodeJS.Timeout | null = null;

  public isRecording = false;

  constructor(visualizerCallback?: AudioVisualizerCallback) {
    if (visualizerCallback) {
      this.onVisualizerData = visualizerCallback;
    }
  }

  /**
   * Request microphone access and start recording
   */
  async start(): Promise<void> {
    if (typeof window === 'undefined') return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Audio recording is not supported in this browser environment.');
    }

    this.audioChunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    // Detect supported MIME type
    const mimeType = this.getSupportedMimeType();
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: mimeType || undefined,
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    // Setup Web Audio API Analyser for waveform animation
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      this.startWaveformVisualizer();
    } catch (err) {
      console.warn('AudioContext visualization setup failed, audio recording will still proceed:', err);
    }

    this.mediaRecorder.start(200); // 200ms timeslices
    this.isRecording = true;
    this.startTime = Date.now();
    this.durationSeconds = 0;

    this.timerInterval = setInterval(() => {
      this.durationSeconds = (Date.now() - this.startTime) / 1000;
    }, 200);
  }

  /**
   * Stop recording and return final audio Blob
   */
  stop(): Promise<{ blob: Blob; mimeType: string; duration: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        return reject(new Error('Recorder is not active'));
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        const finalDuration = this.durationSeconds;

        this.cleanup();
        resolve({
          blob: audioBlob,
          mimeType,
          duration: finalDuration,
        });
      };

      this.mediaRecorder.stop();
      this.isRecording = false;
    });
  }

  private startWaveformVisualizer() {
    if (!this.analyser || !this.onVisualizerData) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const updateVisualizer = () => {
      if (!this.isRecording) return;
      this.analyser?.getByteFrequencyData(dataArray);
      if (this.onVisualizerData) {
        this.onVisualizerData(dataArray);
      }
      this.animFrameId = requestAnimationFrame(updateVisualizer);
    };

    this.animFrameId = requestAnimationFrame(updateVisualizer);
  }

  private cleanup() {
    this.isRecording = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav',
    ];
    for (const type of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }
}
