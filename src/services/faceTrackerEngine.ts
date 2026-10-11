export interface DetectedFace {
  x: number;
  y: number;
  width: number;
  height: number;
  rollAngle: number; // degrees
}

export type FaceAnchorType = 'headTop' | 'faceCenter' | 'mouth' | 'eyes' | 'chin';

export interface AnchorResult {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface FaceTrackerOptions {
  smoothingAlpha?: number; // 0 to 1, higher = faster, lower = smoother
  maxLostFrames?: number;
}

export type HangyudonFaceFilter =
  | 'none'
  | 'full_mask'
  | 'hood_headband'
  | 'sayuri_head'
  | 'wavy_lips'
  | 'big_eyes'
  | 'ramen_feeder';

export class FaceTrackerEngine {
  private smoothingAlpha: number;
  private maxLostFrames: number;
  private lostFrameCount: number = 0;
  private nativeDetector: unknown = null;

  constructor(options: FaceTrackerOptions = {}) {
    this.smoothingAlpha = options.smoothingAlpha ?? 0.35;
    this.maxLostFrames = options.maxLostFrames ?? 4;

    // Check for native Shape Detection API (window.FaceDetector)
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        const NativeDetectorClass = (window as unknown as { FaceDetector: new (opts?: unknown) => unknown }).FaceDetector;
        this.nativeDetector = new NativeDetectorClass({ fastMode: true, maxDetectedFaces: 1 });
      } catch {
        this.nativeDetector = null;
      }
    }
  }

  public getSmoothingAlpha(): number {
    return this.smoothingAlpha;
  }

  public smoothFace(newFace: DetectedFace, previousFace: DetectedFace): DetectedFace {
    const a = this.smoothingAlpha;
    return {
      x: previousFace.x + (newFace.x - previousFace.x) * a,
      y: previousFace.y + (newFace.y - previousFace.y) * a,
      width: previousFace.width + (newFace.width - previousFace.width) * a,
      height: previousFace.height + (newFace.height - previousFace.height) * a,
      rollAngle: previousFace.rollAngle + (newFace.rollAngle - previousFace.rollAngle) * a,
    };
  }

  public processFrame(rawFace: DetectedFace | null, previousFace: DetectedFace | null): DetectedFace | null {
    if (rawFace) {
      this.lostFrameCount = 0;
      if (previousFace) {
        return this.smoothFace(rawFace, previousFace);
      }
      return rawFace;
    }

    // Raw detection is null for this frame
    if (previousFace && this.lostFrameCount < this.maxLostFrames) {
      this.lostFrameCount += 1;
      return previousFace;
    }

    this.lostFrameCount = 0;
    return null;
  }

  public calculateAnchor(face: DetectedFace, anchorType: FaceAnchorType): AnchorResult {
    const centerX = face.x + face.width / 2;
    const centerY = face.y + face.height / 2;
    const rotation = face.rollAngle;

    switch (anchorType) {
      case 'headTop':
        return {
          x: centerX,
          y: face.y - face.height * 0.12,
          width: face.width * 1.15,
          height: face.height * 0.7,
          rotation,
        };
      case 'faceCenter':
        return {
          x: centerX,
          y: centerY,
          width: face.width * 1.25,
          height: face.height * 1.25,
          rotation,
        };
      case 'eyes':
        return {
          x: centerX,
          y: face.y + face.height * 0.38,
          width: face.width * 0.95,
          height: face.height * 0.45,
          rotation,
        };
      case 'mouth':
        return {
          x: centerX,
          y: face.y + face.height * 0.75,
          width: face.width * 0.65,
          height: face.height * 0.35,
          rotation,
        };
      case 'chin':
        return {
          x: centerX,
          y: face.y + face.height * 0.92,
          width: face.width * 0.9,
          height: face.height * 0.6,
          rotation,
        };
    }
  }

  public async detectFromVideoOrCanvas(
    source: HTMLVideoElement | HTMLCanvasElement
  ): Promise<DetectedFace | null> {
    // 1. Try native Shape Detection API if available
    if (this.nativeDetector) {
      try {
        const detector = this.nativeDetector as {
          detect: (src: ImageBitmapSource) => Promise<Array<{
            boundingBox: DOMRectReadOnly;
            landmarks?: Array<{ type: string; locations: Array<{ x: number; y: number }> }>;
          }>>;
        };
        const faces = await detector.detect(source);
        if (faces && faces.length > 0) {
          const first = faces[0];
          const bb = first.boundingBox;
          let roll = 0;
          // Calculate roll if eye landmarks are provided
          if (first.landmarks) {
            const leftEye = first.landmarks.find((l) => l.type === 'eye' || (l as unknown as { type: string }).type === 'leftEye');
            const rightEye = first.landmarks.find((l) => (l as unknown as { type: string }).type === 'rightEye');
            if (leftEye?.locations?.[0] && rightEye?.locations?.[0]) {
              const dx = rightEye.locations[0].x - leftEye.locations[0].x;
              const dy = rightEye.locations[0].y - leftEye.locations[0].y;
              roll = (Math.atan2(dy, dx) * 180) / Math.PI;
            }
          }
          return {
            x: bb.x,
            y: bb.y,
            width: bb.width,
            height: bb.height,
            rollAngle: roll,
          };
        }
      } catch {
        // Fallback below
      }
    }

    // 2. Optical luminance-contrast skin centroid detector fallback
    return this.detectSkinCentroidFallback(source);
  }

  private detectSkinCentroidFallback(
    source: HTMLVideoElement | HTMLCanvasElement
  ): DetectedFace | null {
    try {
      const w = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
      const h = source instanceof HTMLVideoElement ? source.videoHeight : source.height;
      if (!w || !h || w <= 0 || h <= 0) return null;

      // Downsample to 80x60 offscreen canvas for fast 60fps tracking
      const downW = 80;
      const downH = 60;

      const offCanvas = document.createElement('canvas');
      offCanvas.width = downW;
      offCanvas.height = downH;
      const ctx = offCanvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(source, 0, 0, downW, downH);
      const imgData = ctx.getImageData(0, 0, downW, downH);
      const data = imgData.data;

      let sumX = 0;
      let sumY = 0;
      let skinPixels = 0;
      let minX = downW;
      let maxX = 0;
      let minY = downH;
      let maxY = 0;

      // Scan middle region where face typically appears
      const startX = Math.floor(downW * 0.15);
      const endX = Math.floor(downW * 0.85);
      const startY = Math.floor(downH * 0.1);
      const endY = Math.floor(downH * 0.85);

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * downW + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Normalized color skin heuristic (Kovac et al standard)
          const isSkin =
            r > 80 &&
            g > 40 &&
            b > 20 &&
            r > g &&
            r > b &&
            Math.abs(r - g) > 12 &&
            r - b > 12;

          if (isSkin) {
            sumX += x;
            sumY += y;
            skinPixels += 1;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (skinPixels < (downW * downH) * 0.04) {
        return null;
      }

      const normCenterX = sumX / skinPixels / downW;
      const normCenterY = sumY / skinPixels / downH;
      const normW = Math.max(0.2, Math.min(0.65, (maxX - minX) / downW * 1.1));
      const normH = normW * 1.25;

      return {
        x: (normCenterX - normW / 2) * w,
        y: (normCenterY - normH / 2) * h,
        width: normW * w,
        height: normH * h,
        rollAngle: 0,
      };
    } catch {
      return null;
    }
  }
}
