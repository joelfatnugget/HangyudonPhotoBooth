import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Volume2, VolumeX, Sparkles, Download, RotateCcw, FlipHorizontal, Heart, Smile } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BubbleEngine, Bubble } from '../services/bubbleEngine';
import { SoundSynthesizer } from '../services/soundSynthesizer';
import { TimerManager } from '../services/timerManager';
import { StickerManager, StickerType } from '../services/stickerManager';
import {
  FaceTrackerEngine,
  DetectedFace,
  HangyudonFaceFilter,
} from '../services/faceTrackerEngine';
import {
  PhotoStripCompositor,
  FRAME_THEMES,
  FrameThemeKey,
  StripLayoutType,
} from '../services/photoStripCompositor';
import { InteractiveBackground } from './InteractiveBackground';
import { StickerOverlay } from './StickerOverlay';
import { FaceFilterOverlay } from './FaceFilterOverlay';
import {
  HangyudonCharacter,
  SayuriOctopus,
  HangyudonHoodHeadband,
  RamenSticker,
  ClamSticker,
  SparkleSticker,
  BadgeSticker,
} from './HangyudonArt';

type FilterMode = 'ocean' | 'dreamy' | 'vintage' | 'vivid' | 'normal';

export const Photobooth: React.FC = () => {
  // Services
  const bubbleEngineRef = useRef<BubbleEngine>(new BubbleEngine({ width: 640, height: 480, initialBubbleCount: 16 }));
  const soundSynthRef = useRef<SoundSynthesizer>(new SoundSynthesizer());
  const stickerManagerRef = useRef<StickerManager>(new StickerManager());
  const compositorRef = useRef<PhotoStripCompositor>(new PhotoStripCompositor());
  const faceTrackerRef = useRef<FaceTrackerEngine>(new FaceTrackerEngine({ smoothingAlpha: 0.35 }));

  // Face Filter State
  const [activeFaceFilter, setActiveFaceFilter] = useState<HangyudonFaceFilter>('hood_headband');
  const [detectedFace, setDetectedFace] = useState<DetectedFace | null>(null);
  const [isFaceDetected, setIsFaceDetected] = useState<boolean>(false);

  // Camera & Stream State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Settings
  const [countdownSeconds, setCountdownSeconds] = useState<number>(3);
  const [totalShots, setTotalShots] = useState<number>(4); // 4 for strip, 1 for single
  const [filterMode, setFilterMode] = useState<FilterMode>('ocean');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [poppedCount, setPoppedCount] = useState<number>(0);

  // Capture & Timer State
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(3);
  const [currentShotNumber, setCurrentShotNumber] = useState<number>(0);
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);

  // Result customizer state
  const [selectedTheme, setSelectedTheme] = useState<FrameThemeKey>('mint');
  const [selectedLayout, setSelectedLayout] = useState<StripLayoutType>('strip_4');
  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sticker trigger update tick
  const [, setStickerTick] = useState<number>(0);
  const triggerStickerUpdate = () => setStickerTick((t) => t + 1);

  // Active Timer instance
  const activeTimerRef = useRef<TimerManager | null>(null);

  // Enumerate camera devices
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setVideoDevices(videoInputs);
        if (videoInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      }).catch(() => {});
    }
  }, [selectedDeviceId]);

  // Real-time Face Tracking Loop
  useEffect(() => {
    let animId: number;
    let isCancelled = false;
    let lastDetectTime = 0;

    const trackLoop = async (timestamp: number) => {
      if (isCancelled) return;

      if (timestamp - lastDetectTime >= 60) {
        lastDetectTime = timestamp;

        if (streamActive && videoRef.current && videoRef.current.readyState >= 2) {
          try {
            const raw = await faceTrackerRef.current.detectFromVideoOrCanvas(videoRef.current);
            const smoothed = faceTrackerRef.current.processFrame(raw, detectedFace);
            if (smoothed) {
              setDetectedFace(smoothed);
              setIsFaceDetected(true);
            } else {
              setDetectedFace(null);
              setIsFaceDetected(false);
            }
          } catch {
            // Frame detection error handled gracefully
          }
        } else if (!streamActive && activeFaceFilter !== 'none') {
          const time = timestamp * 0.002;
          const mock: DetectedFace = {
            x: 250,
            y: 165 + Math.sin(time) * 8,
            width: 140,
            height: 160,
            rollAngle: Math.sin(time * 0.7) * 3,
          };
          setDetectedFace(mock);
          setIsFaceDetected(true);
        } else {
          setDetectedFace(null);
          setIsFaceDetected(false);
        }
      }

      animId = requestAnimationFrame(trackLoop);
    };

    animId = requestAnimationFrame(trackLoop);
    return () => {
      isCancelled = true;
      cancelAnimationFrame(animId);
    };
  }, [streamActive, activeFaceFilter, detectedFace]);

  // Start Camera Stream
  const startCamera = async (deviceId?: string) => {
    try {
      setCameraError(null);
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((t) => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          deviceId: deviceId ? { exact: deviceId } : undefined,
        },
        audio: false,
      };

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access API is unavailable in this environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setStreamActive(true);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unable to access camera';
      setCameraError(errorMsg);
      setStreamActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Draw active Hangyudon face filter onto canvas for export
  const drawFaceFilterToCanvas = (
    ctx: CanvasRenderingContext2D,
    face: DetectedFace,
    filter: HangyudonFaceFilter
  ) => {
    if (filter === 'none') return;
    const tracker = faceTrackerRef.current;
    ctx.save();

    if (filter === 'hood_headband') {
      const anchor = tracker.calculateAnchor(face, 'headTop');
      ctx.translate(anchor.x, anchor.y);
      ctx.rotate((anchor.rotation * Math.PI) / 180);
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = anchor.width * 0.12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 15, anchor.width * 0.42, Math.PI, 0, false);
      ctx.stroke();

      ctx.fillStyle = '#38b2ac';
      ctx.beginPath();
      ctx.ellipse(0, -anchor.width * 0.38, anchor.width * 0.12, anchor.width * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (filter === 'wavy_lips') {
      const anchor = tracker.calculateAnchor(face, 'mouth');
      ctx.translate(anchor.x, anchor.y);
      ctx.rotate((anchor.rotation * Math.PI) / 180);
      ctx.fillStyle = '#ff8fab';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, anchor.width * 0.5, anchor.width * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (filter === 'big_eyes') {
      const anchor = tracker.calculateAnchor(face, 'eyes');
      ctx.translate(anchor.x, anchor.y);
      ctx.rotate((anchor.rotation * Math.PI) / 180);
      const eyeR = anchor.width * 0.18;
      const eyeSpacing = anchor.width * 0.32;
      [-eyeSpacing, eyeSpacing].forEach((xOff) => {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1e3a5f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(xOff, 0, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#1e3a5f';
        ctx.beginPath();
        ctx.arc(xOff + 1, 0, eyeR * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(xOff + 3, -eyeR * 0.2, eyeR * 0.2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (filter === 'sayuri_head') {
      const anchor = tracker.calculateAnchor(face, 'headTop');
      ctx.translate(anchor.x, anchor.y - anchor.height * 0.5);
      ctx.fillStyle = '#fb7185';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, anchor.width * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (filter === 'full_mask') {
      const anchor = tracker.calculateAnchor(face, 'faceCenter');
      ctx.translate(anchor.x, anchor.y);
      ctx.rotate((anchor.rotation * Math.PI) / 180);
      ctx.fillStyle = '#4ecdc4';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, anchor.width * 0.48, anchor.height * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ff8fab';
      ctx.beginPath();
      ctx.ellipse(0, 0, anchor.width * 0.18, anchor.height * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (filter === 'ramen_feeder') {
      const anchor = tracker.calculateAnchor(face, 'chin');
      ctx.translate(anchor.x, anchor.y);
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, anchor.width * 0.35, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  };

  // Capture single frame from live video or mock canvas
  const captureFrame = useCallback((): string => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    if (streamActive && video && video.readyState >= 2) {
      if (isMirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      if (isMirrored) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    } else {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#bae6fd');
      grad.addColorStop(1, '#a7f3d0');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#134e4a';
      ctx.font = 'bold 24px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Hangyudon & Friends Photo', canvas.width / 2, canvas.height / 2 - 30);
    }

    // Apply color filter if selected
    if (filterMode === 'ocean') {
      ctx.fillStyle = 'rgba(20, 184, 166, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (filterMode === 'dreamy') {
      ctx.fillStyle = 'rgba(244, 114, 182, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (filterMode === 'vintage') {
      ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw tracked face filter if active
    if (activeFaceFilter !== 'none' && detectedFace) {
      drawFaceFilterToCanvas(ctx, detectedFace, activeFaceFilter);
    }

    return canvas.toDataURL('image/jpeg', 0.95);
  }, [streamActive, isMirrored, filterMode, activeFaceFilter, detectedFace]);

  // Start Photobooth Countdown Sequence
  const startCountdown = () => {
    if (isCountingDown) return;

    setCapturedFrames([]);
    setIsCountingDown(true);
    setCurrentShotNumber(1);
    setRemainingTime(countdownSeconds);

    const shots: string[] = [];

    const timer = new TimerManager({
      countdownSeconds,
      totalShots,
      intervalBetweenShotsMs: 1500,
      onTick: (rem, current) => {
        setRemainingTime(rem);
        setCurrentShotNumber(current);
        soundSynthRef.current.playCountdownTick(rem === 1);
      },
      onCapture: (current) => {
        // Flash animation
        setFlashActive(true);
        setTimeout(() => setFlashActive(false), 200);

        // Sound snap
        soundSynthRef.current.playShutter();

        // Capture frame
        const frameData = captureFrame();
        shots.push(frameData);
        setCapturedFrames([...shots]);
        setCurrentShotNumber(current);
      },
      onComplete: () => {
        setIsCountingDown(false);
        setShowResultModal(true);
        soundSynthRef.current.playFanfare();

        // Confetti burst
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4ecdc4', '#ff8fab', '#fef08a', '#99f6e4'],
          });
        } catch {
          // In environments without confetti canvas
        }
      },
    });

    activeTimerRef.current = timer;
    timer.start();
  };

  const cancelCountdown = () => {
    if (activeTimerRef.current) {
      activeTimerRef.current.cancel();
      activeTimerRef.current = null;
    }
    setIsCountingDown(false);
  };

  // Toggle Sound Mute
  const handleToggleSound = () => {
    const newMuted = soundSynthRef.current.toggleMute();
    setIsMuted(newMuted);
  };

  // Handle Bubble Pop
  const handleBubblePop = (_bubble: Bubble) => {
    setPoppedCount((prev) => prev + 1);
  };

  // Add Sticker to Overlay
  const addSticker = (type: StickerType) => {
    stickerManagerRef.current.addSticker(type, {
      x: 320 + (Math.random() - 0.5) * 80,
      y: 240 + (Math.random() - 0.5) * 80,
    });
    triggerStickerUpdate();
    soundSynthRef.current.playBubblePop();
  };

  // Render Result Strip on canvas
  const drawCompositeResult = useCallback(() => {
    const canvas = resultCanvasRef.current;
    if (!canvas || capturedFrames.length === 0) return;

    const theme = FRAME_THEMES[selectedTheme];
    const compositor = compositorRef.current;
    const photoWidth = 360;
    const photoHeight = 270;

    const layout = compositor.computeLayout(selectedLayout, photoWidth, photoHeight);

    // Load images
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    capturedFrames.forEach((src, idx) => {
      const img = new Image();
      img.onload = () => {
        loadedCount += 1;
        if (loadedCount === capturedFrames.length) {
          compositor.renderStripToCanvas(canvas, layout, theme, loadedImages);
        }
      };
      img.src = src;
      loadedImages[idx] = img;
    });
  }, [capturedFrames, selectedTheme, selectedLayout]);

  useEffect(() => {
    if (showResultModal && capturedFrames.length > 0) {
      drawCompositeResult();
    }
  }, [showResultModal, capturedFrames, selectedTheme, selectedLayout, drawCompositeResult]);

  // Download Composite Image
  const handleDownload = () => {
    const canvas = resultCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `hangyudon-photobooth-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-cute selection:bg-teal-400 selection:text-slate-950">
      {/* Top Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-teal-900/50 py-3 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <HangyudonCharacter size={46} mood="happy" className="animate-wiggle" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-wide bg-gradient-to-r from-teal-300 via-emerald-200 to-rose-300 bg-clip-text text-transparent">
              HANGYUDON PHOTOBOOTH
            </h1>
            <p className="text-xs text-teal-400/80 font-sans tracking-wide">
              はんぎょどん と さゆりちゃんの ぷりくら
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Bubble Score Counter */}
          <div className="hidden sm:flex items-center gap-1.5 bg-teal-950/70 border border-teal-700/60 px-3 py-1.5 rounded-full text-xs text-teal-200">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <span>Bubbles Popped:</span>
            <strong className="text-teal-300 font-bold">{poppedCount}</strong>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-teal-800 text-teal-300 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Studio Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left / Center Viewport (Camera + Interactive Overlay + Flash) */}
        <div className="lg:col-span-3 flex flex-col items-center">
          {/* Camera Stage Container */}
          <div className="relative w-full max-w-3xl aspect-[4/3] bg-slate-900 rounded-3xl overflow-hidden border-4 border-teal-500/40 shadow-2xl shadow-teal-950/40 select-none">
            {/* Live Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-transform duration-200 ${
                isMirrored ? '-scale-x-100' : ''
              } ${streamActive ? 'block' : 'hidden'}`}
            />

            {/* Mock / Fallback Camera Stage when webcam is not started */}
            {!streamActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-sky-950 via-teal-950 to-slate-950 p-6 text-center">
                <div className="relative mb-4">
                  <HangyudonCharacter size={140} mood="happy" className="animate-float-slow" />
                  <div className="absolute -bottom-2 -right-2">
                    <SayuriOctopus size={60} className="animate-bounce" />
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-teal-200 mb-2">
                  Ready for your Hangyudon Photobooth?
                </h3>
                <p className="text-xs md:text-sm text-slate-300 max-w-md mb-5 font-sans">
                  Click &apos;Start Camera&apos; below to launch your camera! You can interact with the floating bubbles, pop them, or decorate with cute stickers anytime.
                </p>
                {cameraError && (
                  <p className="text-xs text-rose-300 bg-rose-950/80 border border-rose-800 px-3 py-1.5 rounded-lg mb-4">
                    {cameraError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => startCamera(selectedDeviceId)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-full shadow-lg shadow-teal-500/25 hover:from-teal-400 hover:to-emerald-300 transition-all hover:scale-105 active:scale-95"
                >
                  <Camera className="w-5 h-5" />
                  Start Camera
                </button>
              </div>
            )}

            {/* Interactive Background Canvas (Ripples, Bubbles, Pops) */}
            <InteractiveBackground
              engine={bubbleEngineRef.current}
              sound={soundSynthRef.current}
              width={640}
              height={480}
              onBubblePop={handleBubblePop}
              filterMode={filterMode}
              interactiveMode={!isCountingDown}
            />

            {/* Hangyudon Face Filter Overlay */}
            <FaceFilterOverlay
              face={detectedFace}
              filter={activeFaceFilter}
              tracker={faceTrackerRef.current}
            />

            {/* Draggable Stickers Overlay */}
            <StickerOverlay
              manager={stickerManagerRef.current}
              onUpdate={triggerStickerUpdate}
              interactive={!isCountingDown}
            />

            {/* Face Tracking Indicator Badge */}
            {activeFaceFilter !== 'none' && (
              <div className="absolute top-3 right-3 z-20 pointer-events-none flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] border border-teal-800/40">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isFaceDetected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="text-teal-200">
                  {isFaceDetected ? 'Face Tracked' : 'Searching Face...'}
                </span>
              </div>
            )}

            {/* Shutter White Flash Animation */}
            {flashActive && (
              <div className="absolute inset-0 z-40 bg-white pointer-events-none animate-ping" />
            )}

            {/* Countdown Overlay Display */}
            {isCountingDown && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm pointer-events-none">
                <div className="relative flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-4 border-teal-300/60 border-t-teal-400 animate-spin" />
                  <div className="absolute text-7xl font-extrabold text-white drop-shadow-[0_4px_16px_rgba(45,212,191,0.8)] font-cute animate-pulse-fast">
                    {remainingTime}
                  </div>
                </div>

                <div className="mt-4 px-4 py-1.5 rounded-full bg-slate-900/90 border border-teal-400 text-teal-200 font-bold text-sm">
                  Shot {currentShotNumber} of {totalShots}
                </div>
              </div>
            )}

            {/* Floating Top Hint for Interactivity */}
            <div className="absolute top-3 left-3 z-20 pointer-events-none bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-teal-200 border border-teal-800/40">
              Pop floating bubbles or tap anywhere to create ripples!
            </div>
          </div>

          {/* Camera Stage Bottom Controls Bar */}
          <div className="w-full max-w-3xl mt-4 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 backdrop-blur-sm p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              {streamActive ? (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-colors"
                >
                  Turn Off Camera
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => startCamera(selectedDeviceId)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 transition-colors"
                >
                  Start Camera
                </button>
              )}

              {/* Mirror Toggle */}
              <button
                type="button"
                onClick={() => setIsMirrored(!isMirrored)}
                title="Toggle Mirror Camera"
                className={`p-2 rounded-lg border text-xs transition-colors ${
                  isMirrored
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>

              {/* Camera Switcher (if multiple cameras exist) */}
              {videoDevices.length > 1 && (
                <select
                  value={selectedDeviceId}
                  onChange={(e) => {
                    setSelectedDeviceId(e.target.value);
                    if (streamActive) startCamera(e.target.value);
                  }}
                  className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-400"
                >
                  {videoDevices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Main Shutter Snap Button */}
            <div>
              {isCountingDown ? (
                <button
                  type="button"
                  onClick={cancelCountdown}
                  className="px-6 py-2 rounded-full bg-rose-600 text-white font-bold text-sm hover:bg-rose-500 transition-colors shadow-lg"
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startCountdown}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-400 via-pink-400 to-teal-400 text-slate-950 font-bold px-7 py-2.5 rounded-full shadow-lg shadow-rose-500/30 hover:shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  Take {totalShots === 4 ? '4-Cut Photos!' : 'Photo!'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Settings & Sticker Palette Sidebar */}
        <div className="lg:col-span-1 space-y-5">
          {/* Timer & Shot Mode Configuration */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs uppercase tracking-wider text-teal-400 font-bold mb-3 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" /> Photobooth Mode
            </h4>

            {/* Mode: 4-cut vs single */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setTotalShots(4)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                  totalShots === 4
                    ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                4-Cut Strip
              </button>
              <button
                type="button"
                onClick={() => setTotalShots(1)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                  totalShots === 1
                    ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Single Snap
              </button>
            </div>

            {/* Countdown Duration */}
            <label className="block text-xs text-slate-400 mb-2">Countdown Timer:</label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 10].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setCountdownSeconds(sec)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    countdownSeconds === sec
                      ? 'bg-teal-500 text-slate-950 border-teal-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Hangyudon Face AR Filter Selection */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs uppercase tracking-wider text-rose-300 font-bold mb-2 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5" /> Hangyudon Face Filters
            </h4>
            <p className="text-[11px] text-slate-400 mb-3">
              Tracks your face in real-time. Pick a cute prop to wear!
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'hood_headband', name: 'Headband', desc: 'Dorsal fin' },
                { id: 'full_mask', name: 'Full Face Mask', desc: 'Full Hangyudon' },
                { id: 'sayuri_head', name: 'Sayuri on Head', desc: 'Octopus pal' },
                { id: 'wavy_lips', name: 'Wavy Lips', desc: 'Iconic mouth' },
                { id: 'big_eyes', name: 'Big Fish Eyes', desc: 'Eyes & blush' },
                { id: 'ramen_feeder', name: 'Ramen Bowl', desc: 'Chomping noodles' },
                { id: 'none', name: 'No Face Filter', desc: 'Natural face' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setActiveFaceFilter(f.id as HangyudonFaceFilter);
                    soundSynthRef.current.playBubblePop();
                  }}
                  className={`py-2 px-2.5 text-xs font-semibold rounded-xl border text-left transition-all flex flex-col gap-0.5 ${
                    activeFaceFilter === f.id
                      ? 'bg-teal-500/20 border-teal-400 text-teal-200 ring-1 ring-teal-400 shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                  } ${f.id === 'none' ? 'col-span-2 text-center' : ''}`}
                >
                  <span className="font-bold text-xs">{f.name}</span>
                  <span className="text-[10px] text-slate-400">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Background Atmosphere Filter */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs uppercase tracking-wider text-teal-400 font-bold mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Ocean Atmosphere
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'ocean', name: 'Ocean Aqua' },
                { id: 'dreamy', name: 'Pastel Dream' },
                { id: 'vintage', name: 'Ramen Warm' },
                { id: 'normal', name: 'Natural' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterMode(f.id as FilterMode)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg border text-left transition-colors ${
                    filterMode === f.id
                      ? 'bg-teal-500/20 border-teal-400 text-teal-200'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Stickers & Props Drawer */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs uppercase tracking-wider text-rose-300 font-bold flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" /> Cute Stickers
              </h4>
              <button
                type="button"
                onClick={() => {
                  stickerManagerRef.current.clearStickers();
                  triggerStickerUpdate();
                }}
                className="text-[10px] text-slate-400 hover:text-rose-300"
              >
                Clear All
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mb-3">
              Click any sticker to place on camera. Drag & resize freely!
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => addSticker('hangyudon_hood')}
                className="p-2 bg-slate-800/80 hover:bg-teal-950 border border-slate-700 hover:border-teal-500 rounded-xl flex flex-col items-center gap-1 transition-all group"
                title="Hangyudon Headband"
              >
                <HangyudonHoodHeadband size={44} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-slate-300">Headband</span>
              </button>

              <button
                type="button"
                onClick={() => addSticker('hangyudon_face')}
                className="p-2 bg-slate-800/80 hover:bg-teal-950 border border-slate-700 hover:border-teal-500 rounded-xl flex flex-col items-center gap-1 transition-all group"
                title="Hangyudon"
              >
                <HangyudonCharacter size={40} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-slate-300">Hangyudon</span>
              </button>

              <button
                type="button"
                onClick={() => addSticker('sayuri_octopus')}
                className="p-2 bg-slate-800/80 hover:bg-teal-950 border border-slate-700 hover:border-teal-500 rounded-xl flex flex-col items-center gap-1 transition-all group"
                title="Sayuri Octopus"
              >
                <SayuriOctopus size={36} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-slate-300">Sayuri</span>
              </button>

              <button
                type="button"
                onClick={() => addSticker('ramen_bowl')}
                className="p-2 bg-slate-800/80 hover:bg-teal-950 border border-slate-700 hover:border-teal-500 rounded-xl flex flex-col items-center gap-1 transition-all group"
                title="Ramen Bowl"
              >
                <RamenSticker size={36} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-slate-300">Ramen</span>
              </button>

              <button
                type="button"
                onClick={() => addSticker('clam_pearl')}
                className="p-2 bg-slate-800/80 hover:bg-teal-950 border border-slate-700 hover:border-teal-500 rounded-xl flex flex-col items-center gap-1 transition-all group"
                title="Clam Pearl"
              >
                <ClamSticker size={36} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-slate-300">Pearl</span>
              </button>

              <button
                type="button"
                onClick={() => addSticker('sparkle_stars')}
                className="p-2 bg-slate-800/80 hover:bg-teal-950 border border-slate-700 hover:border-teal-500 rounded-xl flex flex-col items-center gap-1 transition-all group"
                title="Sparkles"
              >
                <SparkleSticker size={36} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-slate-300">Sparkle</span>
              </button>

              <button
                type="button"
                onClick={() => addSticker('badge_cute')}
                className="p-2 bg-slate-800/80 hover:bg-teal-950 border border-slate-700 hover:border-teal-500 rounded-xl flex flex-col items-center gap-1 transition-all group col-span-1"
                title="Kawaii Stamp"
              >
                <BadgeSticker text="KAWAII" subtext="★" size={40} />
                <span className="text-[10px] text-slate-300">Kawaii</span>
              </button>

              <button
                type="button"
                onClick={() => addSticker('badge_hangyudon')}
                className="p-2 bg-slate-800/80 hover:bg-teal-950 border border-slate-700 hover:border-teal-500 rounded-xl flex flex-col items-center gap-1 transition-all group col-span-2"
                title="Japanese Hangyudon Logo"
              >
                <BadgeSticker text="はんぎょどん" subtext="HANGYUDON" size={40} className="w-full h-10" />
                <span className="text-[10px] text-slate-300">Japanese Logo</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Result Print & Decorate Modal */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-teal-500/40 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <HangyudonCharacter size={40} mood="happy" />
                <div>
                  <h3 className="text-xl font-bold text-teal-300">
                    Your Hangyudon Photobooth Print!
                  </h3>
                  <p className="text-xs text-slate-400">
                    Customize your frame color theme and save high-resolution photo strip.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Photo Strip Render Canvas Preview */}
              <div className="flex justify-center bg-slate-950/60 p-4 rounded-2xl border border-slate-800 max-h-[580px] overflow-y-auto">
                <canvas
                  ref={resultCanvasRef}
                  className="rounded-xl shadow-2xl max-h-[520px] object-contain border border-teal-500/20"
                />
              </div>

              {/* Customization Options */}
              <div className="space-y-5">
                {/* Frame Theme Selection */}
                <div>
                  <label className="block text-xs uppercase font-bold text-teal-400 mb-2">
                    Frame Theme Color:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(FRAME_THEMES) as FrameThemeKey[]).map((key) => {
                      const th = FRAME_THEMES[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedTheme(key)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                            selectedTheme === key
                              ? 'border-teal-300 ring-2 ring-teal-400 text-white'
                              : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/20"
                            style={{ backgroundColor: th.primary }}
                          />
                          <span>{th.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Layout Type Selection */}
                <div>
                  <label className="block text-xs uppercase font-bold text-teal-400 mb-2">
                    Strip Layout:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'strip_4', name: 'Vertical Strip' },
                      { id: 'grid_4', name: '2x2 Grid' },
                      { id: 'single', name: 'Polaroid 1-Cut' },
                    ].map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setSelectedLayout(l.id as StripLayoutType)}
                        className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
                          selectedLayout === l.id
                            ? 'bg-teal-500 text-slate-950 border-teal-300'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions: Download / Retake */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-full shadow-lg shadow-teal-500/25 hover:from-teal-300 hover:to-emerald-300 transition-all hover:scale-105 active:scale-95"
                  >
                    <Download className="w-5 h-5" />
                    Download Photo Strip
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResultModal(false);
                      setCapturedFrames([]);
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-3 rounded-full border border-slate-700 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    New Photos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
