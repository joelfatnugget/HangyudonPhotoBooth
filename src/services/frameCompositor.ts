import { DetectedFace, FaceTrackerEngine, HangyudonFaceFilter } from './faceTrackerEngine';
import { StickerInstance, StickerType } from './stickerManager';

export type FrameColorFilter = 'ocean' | 'dreamy' | 'vintage' | 'vivid' | 'normal';

export interface FrameCompositeParams {
  targetCanvas: HTMLCanvasElement;
  video: HTMLVideoElement | null;
  streamActive: boolean;
  isMirrored: boolean;
  backgroundCanvas: HTMLCanvasElement | null;
  face: DetectedFace | null;
  faceFilter: HangyudonFaceFilter;
  tracker: FaceTrackerEngine;
  stickers: StickerInstance[];
  colorFilter: FrameColorFilter;
}

export class FrameCompositor {
  public compositeFullFrame(params: FrameCompositeParams): void {
    const {
      targetCanvas,
      video,
      streamActive,
      isMirrored,
      backgroundCanvas,
      face,
      faceFilter,
      tracker,
      stickers,
      colorFilter,
    } = params;

    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return;

    const width = targetCanvas.width;
    const height = targetCanvas.height;

    // 1. Base Layer: Live Camera Feed or Fallback Stage
    ctx.save();
    if (streamActive && video && video.readyState >= 2) {
      if (isMirrored) {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);
      if (isMirrored) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    } else {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#bae6fd');
      grad.addColorStop(1, '#a7f3d0');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#134e4a';
      ctx.font = 'bold 24px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Hangyudon & Friends Photo', width / 2, height / 2 - 30);
    }
    ctx.restore();

    // 2. Color Atmosphere Tint Filter
    ctx.save();
    if (colorFilter === 'ocean') {
      ctx.fillStyle = 'rgba(20, 184, 166, 0.12)';
      ctx.fillRect(0, 0, width, height);
    } else if (colorFilter === 'dreamy') {
      ctx.fillStyle = 'rgba(244, 114, 182, 0.12)';
      ctx.fillRect(0, 0, width, height);
    } else if (colorFilter === 'vintage') {
      ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();

    // 3. Interactive Background Canvas Layer (Floating bubbles, ripples, particles)
    if (backgroundCanvas) {
      ctx.save();
      ctx.drawImage(backgroundCanvas, 0, 0, width, height);
      ctx.restore();
    }

    // 4. Tracked Face AR Filter Layer
    if (face && faceFilter !== 'none') {
      this.drawFaceFilter(ctx, face, faceFilter, tracker);
    }

    // 5. Placed Stickers Layer
    if (stickers && stickers.length > 0) {
      stickers.forEach((sticker) => {
        this.drawSticker(ctx, sticker);
      });
    }
  }

  private drawFaceFilter(
    ctx: CanvasRenderingContext2D,
    face: DetectedFace,
    filter: HangyudonFaceFilter,
    tracker: FaceTrackerEngine
  ): void {
    ctx.save();

    if (filter === 'hood_headband') {
      const anchor = tracker.calculateAnchor(face, 'headTop');
      ctx.translate(anchor.x, anchor.y);
      ctx.rotate((anchor.rotation * Math.PI) / 180);

      // Headband arch
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = anchor.width * 0.12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 15, anchor.width * 0.42, Math.PI, 0, false);
      ctx.stroke();

      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Top dorsal fin
      ctx.fillStyle = '#38b2ac';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, -anchor.width * 0.38, anchor.width * 0.12, anchor.width * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Mini Hangyudon head badge in center of headband
      ctx.fillStyle = '#4ecdc4';
      ctx.beginPath();
      ctx.arc(0, -5, anchor.width * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Eyes on badge
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-anchor.width * 0.05, -7, anchor.width * 0.035, 0, Math.PI * 2);
      ctx.arc(anchor.width * 0.05, -7, anchor.width * 0.035, 0, Math.PI * 2);
      ctx.fill();
    } else if (filter === 'full_mask') {
      const anchor = tracker.calculateAnchor(face, 'faceCenter');
      ctx.translate(anchor.x, anchor.y);
      ctx.rotate((anchor.rotation * Math.PI) / 180);

      // Dorsal fin on mask
      ctx.fillStyle = '#38b2ac';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(0, -anchor.height * 0.5, anchor.width * 0.15, anchor.height * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Main face
      ctx.fillStyle = '#4ecdc4';
      ctx.beginPath();
      ctx.ellipse(0, 0, anchor.width * 0.48, anchor.height * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Yellow tummy
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(0, anchor.height * 0.2, anchor.width * 0.26, anchor.height * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Big round eyes
      const eyeR = anchor.width * 0.13;
      [-anchor.width * 0.18, anchor.width * 0.18].forEach((xOff) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(xOff, -anchor.height * 0.1, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#1e3a5f';
        ctx.beginPath();
        ctx.arc(xOff + 1, -anchor.height * 0.1, eyeR * 0.52, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(xOff + 3, -anchor.height * 0.1 - eyeR * 0.2, eyeR * 0.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Wavy salmon lips
      ctx.fillStyle = '#ff8fab';
      ctx.beginPath();
      ctx.ellipse(0, anchor.height * 0.05, anchor.width * 0.18, anchor.height * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (filter === 'sayuri_head') {
      const anchor = tracker.calculateAnchor(face, 'headTop');
      ctx.translate(anchor.x, anchor.y - anchor.height * 0.5);
      ctx.rotate((anchor.rotation * Math.PI) / 180);

      // Sayuri head
      ctx.fillStyle = '#fb7185';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, anchor.width * 0.26, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Yellow hair bow
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(anchor.width * 0.16, -anchor.width * 0.18, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cute eyes & mouth
      ctx.fillStyle = '#1e3a5f';
      ctx.beginPath();
      ctx.arc(-8, -2, 3, 0, Math.PI * 2);
      ctx.arc(8, -2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.arc(0, 6, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (filter === 'wavy_lips') {
      const anchor = tracker.calculateAnchor(face, 'mouth');
      ctx.translate(anchor.x, anchor.y);
      ctx.rotate((anchor.rotation * Math.PI) / 180);

      ctx.fillStyle = '#ff8fab';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, anchor.width * 0.48, anchor.width * 0.24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-anchor.width * 0.3, 0);
      ctx.lineTo(anchor.width * 0.3, 0);
      ctx.stroke();
    } else if (filter === 'big_eyes') {
      const anchor = tracker.calculateAnchor(face, 'eyes');
      ctx.translate(anchor.x, anchor.y);
      ctx.rotate((anchor.rotation * Math.PI) / 180);

      const eyeR = anchor.width * 0.19;
      const eyeSpacing = anchor.width * 0.32;
      [-eyeSpacing, eyeSpacing].forEach((xOff) => {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1e3a5f';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(xOff, 0, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#1e3a5f';
        ctx.beginPath();
        ctx.arc(xOff + 1, 0, eyeR * 0.52, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(xOff + 3, -eyeR * 0.22, eyeR * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
        ctx.beginPath();
        ctx.ellipse(xOff, eyeR * 1.35, eyeR * 0.75, eyeR * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (filter === 'ramen_feeder') {
      const anchor = tracker.calculateAnchor(face, 'chin');
      ctx.translate(anchor.x, anchor.y);
      ctx.rotate((anchor.rotation * Math.PI) / 180);

      // Steam lines
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-15, -12);
      ctx.lineTo(-10, -28);
      ctx.moveTo(10, -12);
      ctx.lineTo(15, -28);
      ctx.stroke();

      // Ramen bowl
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, anchor.width * 0.38, 0, Math.PI);
      ctx.fill();
      ctx.stroke();

      // Noodles
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-anchor.width * 0.32, -anchor.width * 0.08, anchor.width * 0.64, anchor.width * 0.12);
      ctx.strokeRect(-anchor.width * 0.32, -anchor.width * 0.08, anchor.width * 0.64, anchor.width * 0.12);

      // Naruto whirlpool fishcake
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -anchor.width * 0.02, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ec4899';
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawSticker(ctx: CanvasRenderingContext2D, sticker: StickerInstance): void {
    ctx.save();
    ctx.translate(sticker.x, sticker.y);
    ctx.rotate((sticker.rotation * Math.PI) / 180);
    ctx.scale(sticker.scale, sticker.scale);

    const type: StickerType = sticker.type;

    if (type === 'hangyudon_face') {
      // Hangyudon round face
      ctx.fillStyle = '#4ecdc4';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Tummy
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(0, 16, 20, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-14, -8, 10, 0, Math.PI * 2);
      ctx.arc(14, -8, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1e3a5f';
      ctx.beginPath();
      ctx.arc(-13, -8, 5, 0, Math.PI * 2);
      ctx.arc(13, -8, 5, 0, Math.PI * 2);
      ctx.fill();

      // Lips
      ctx.fillStyle = '#ff8fab';
      ctx.beginPath();
      ctx.ellipse(0, 6, 15, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (type === 'sayuri_octopus') {
      ctx.fillStyle = '#fb7185';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(15, -15, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'ramen_bowl') {
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-24, -6, 48, 10);
    } else if (type === 'clam_pearl') {
      ctx.fillStyle = '#c4b5fd';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 28, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -4, 9, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'sparkle_stars') {
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'badge_cute' || type === 'badge_hangyudon') {
      ctx.fillStyle = '#f472b6';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(type === 'badge_cute' ? 'KAWAII' : 'はんぎょ', 0, 0);
    } else if (type === 'speech_bubble') {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1e3a5f';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(-45, -16, 90, 32, 12);
      } else {
        ctx.rect(-45, -16, 90, 32);
      }
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1e3a5f';
      ctx.font = 'bold 10px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("Chillin'!", 0, 0);
    } else {
      // General prop fallback
      ctx.fillStyle = '#4ecdc4';
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
