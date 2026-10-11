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
    if (faceFilter !== 'none') {
      const mappedFace =
        face && video && video.videoWidth > 0
          ? tracker.mapFaceToContainer({
              face,
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
              containerWidth: width,
              containerHeight: height,
              isMirrored,
            })
          : face;

      this.drawFaceFilter(ctx, mappedFace, faceFilter, tracker, width, height);
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
    face: DetectedFace | null,
    filter: HangyudonFaceFilter,
    tracker: FaceTrackerEngine,
    containerWidth: number,
    containerHeight: number
  ): void {
    ctx.save();

    if (filter === 'corner_buddies') {
      // Bottom-left Hangyudon
      ctx.save();
      ctx.translate(50, containerHeight - 50);
      ctx.fillStyle = '#4ecdc4';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-8, -4, 6, 0, Math.PI * 2);
      ctx.arc(8, -4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1e3a5f';
      ctx.beginPath();
      ctx.arc(-7, -4, 3, 0, Math.PI * 2);
      ctx.arc(9, -4, 3, 0, Math.PI * 2);
      ctx.fill();
      // Lips
      ctx.fillStyle = '#ff8fab';
      ctx.beginPath();
      ctx.ellipse(0, 8, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Bottom-right Sayuri
      ctx.save();
      ctx.translate(containerWidth - 50, containerHeight - 45);
      ctx.fillStyle = '#fb7185';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Bow
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(14, -14, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Eyes
      ctx.fillStyle = '#1e3a5f';
      ctx.beginPath();
      ctx.arc(-6, -2, 2.5, 0, Math.PI * 2);
      ctx.arc(6, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();
      return;
    }

    if (!face) {
      ctx.restore();
      return;
    }

    if (filter === 'hood_headband') {
      const anchor = tracker.calculateAnchor(face, 'headTop');
      ctx.translate(anchor.x, anchor.y);
      ctx.rotate((anchor.rotation * Math.PI) / 180);

      // Headband gentle arch resting on hair line
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = anchor.width * 0.08;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 8, anchor.width * 0.44, Math.PI * 0.95, Math.PI * 0.05, true);
      ctx.stroke();

      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Top dorsal fin
      ctx.fillStyle = '#38b2ac';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, -anchor.width * 0.22, anchor.width * 0.1, anchor.width * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Mini Hangyudon head badge in center of headband
      ctx.fillStyle = '#4ecdc4';
      ctx.beginPath();
      ctx.arc(0, -2, anchor.width * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Eyes on badge
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-anchor.width * 0.035, -4, anchor.width * 0.024, 0, Math.PI * 2);
      ctx.arc(anchor.width * 0.035, -4, anchor.width * 0.024, 0, Math.PI * 2);
      ctx.fill();
    } else if (filter === 'sayuri_head') {
      const anchor = tracker.calculateAnchor(face, 'headTop');
      ctx.translate(anchor.x, anchor.y - anchor.height * 0.25);
      ctx.rotate((anchor.rotation * Math.PI) / 180);

      // Sayuri head
      ctx.fillStyle = '#fb7185';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, anchor.width * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Yellow hair bow
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(anchor.width * 0.14, -anchor.width * 0.14, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cute eyes & mouth
      ctx.fillStyle = '#1e3a5f';
      ctx.beginPath();
      ctx.arc(-6, -2, 2.5, 0, Math.PI * 2);
      ctx.arc(6, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (filter === 'blush_sparkles') {
      const leftAnchor = tracker.calculateAnchor(face, 'blushLeft');
      const rightAnchor = tracker.calculateAnchor(face, 'blushRight');

      // Left cheek blush
      ctx.save();
      ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
      ctx.beginPath();
      ctx.ellipse(leftAnchor.x, leftAnchor.y, leftAnchor.width * 0.5, leftAnchor.height * 0.5, -0.1, 0, Math.PI * 2);
      ctx.fill();
      // Gold twinkle
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('✦', leftAnchor.x + 8, leftAnchor.y - 6);
      ctx.restore();

      // Right cheek blush
      ctx.save();
      ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
      ctx.beginPath();
      ctx.ellipse(rightAnchor.x, rightAnchor.y, rightAnchor.width * 0.5, rightAnchor.height * 0.5, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Gold twinkle
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('✦', rightAnchor.x - 14, rightAnchor.y - 6);
      ctx.restore();
    } else if (filter === 'sailor_beret') {
      const anchor = tracker.calculateAnchor(face, 'sailorTop');
      ctx.translate(anchor.x, anchor.y);
      ctx.rotate((anchor.rotation * Math.PI) / 180);

      // White dome
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, -anchor.height * 0.3, anchor.width * 0.42, anchor.height * 0.35, 0, Math.PI, 0, true);
      ctx.fill();
      ctx.stroke();

      // Navy band
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(-anchor.width * 0.4, -anchor.height * 0.3, anchor.width * 0.8, anchor.height * 0.14);

      // Gold badge
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -anchor.height * 0.23, 5, 0, Math.PI * 2);
      ctx.fill();
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
