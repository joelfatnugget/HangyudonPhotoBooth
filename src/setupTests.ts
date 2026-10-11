import '@testing-library/jest-dom';

// Mock Web Audio API for tests
class AudioContextMock {
  state = 'running';
  sampleRate = 44100;
  currentTime = 0;
  destination = {};
  createOscillator() {
    return {
      type: 'sine',
      frequency: {
        value: 440,
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
      },
      connect: () => {},
      start: () => {},
      stop: () => {},
    };
  }
  createGain() {
    return {
      gain: {
        value: 1,
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
      },
      connect: () => {},
    };
  }
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: { value: 1000 },
      Q: { value: 1 },
      connect: () => {},
    };
  }
  close() {
    return Promise.resolve();
  }
}

// Attach to global window
(global as unknown as { AudioContext: typeof AudioContextMock }).AudioContext = AudioContextMock;
(global as unknown as { webkitAudioContext: typeof AudioContextMock }).webkitAudioContext = AudioContextMock;

// Mock HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement & { _cached2d?: CanvasRenderingContext2D }, contextType: string) {
  if (contextType === '2d') {
    if (!this._cached2d) {
      this._cached2d = {
        clearRect: () => {},
        fillRect: () => {},
        strokeRect: () => {},
        beginPath: () => {},
        closePath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        bezierCurveTo: () => {},
        quadraticCurveTo: () => {},
        arcTo: () => {},
        arc: () => {},
        ellipse: () => {},
        roundRect: () => {},
        rect: () => {},
        fill: () => {},
        stroke: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        scale: () => {},
        rotate: () => {},
        setTransform: () => {},
        fillText: () => {},
        drawImage: () => {},
        createRadialGradient: () => ({
          addColorStop: () => {},
        }),
        createLinearGradient: () => ({
          addColorStop: () => {},
        }),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        font: '',
        textAlign: 'left',
        textBaseline: 'alphabetic',
        globalAlpha: 1,
      } as unknown as CanvasRenderingContext2D;
    }
    return this._cached2d;
  }
  return null;
} as unknown as typeof HTMLCanvasElement.prototype.getContext;

