import { describe, it, expect, vi } from 'vitest';
import { FrameCompositor } from '../frameCompositor';
import { FaceTrackerEngine, DetectedFace } from '../faceTrackerEngine';
import { StickerInstance } from '../stickerManager';

describe('FrameCompositor', () => {
  it('initializes and provides layer compositing pipeline', () => {
    const compositor = new FrameCompositor();
    expect(compositor).toBeDefined();
  });

  it('composites video layer, background overlay, face filter, and stickers onto target canvas', () => {
    const compositor = new FrameCompositor();
    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = 640;
    targetCanvas.height = 480;

    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 640;
    bgCanvas.height = 480;

    const tracker = new FaceTrackerEngine();
    const face: DetectedFace = {
      x: 200,
      y: 150,
      width: 140,
      height: 160,
      rollAngle: 5,
    };

    const stickers: StickerInstance[] = [
      {
        id: 's1',
        type: 'ramen_bowl',
        x: 100,
        y: 100,
        scale: 1.2,
        rotation: 15,
      },
      {
        id: 's2',
        type: 'sayuri_octopus',
        x: 450,
        y: 300,
        scale: 1,
        rotation: 0,
      },
    ];

    const ctx = targetCanvas.getContext('2d');
    const drawImageSpy = vi.spyOn(ctx!, 'drawImage');
    const saveSpy = vi.spyOn(ctx!, 'save');
    const restoreSpy = vi.spyOn(ctx!, 'restore');

    compositor.compositeFullFrame({
      targetCanvas,
      video: null,
      streamActive: false,
      isMirrored: true,
      backgroundCanvas: bgCanvas,
      face,
      faceFilter: 'hood_headband',
      tracker,
      stickers,
      colorFilter: 'ocean',
    });

    // Should composite background canvas
    expect(drawImageSpy).toHaveBeenCalledWith(bgCanvas, 0, 0, 640, 480);
    // Should save/restore context for transformed layers
    expect(saveSpy).toHaveBeenCalled();
    expect(restoreSpy).toHaveBeenCalled();
  });

  it('draws face filter graphics for each filter mode', () => {
    const compositor = new FrameCompositor();
    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = 640;
    targetCanvas.height = 480;

    const tracker = new FaceTrackerEngine();
    const face: DetectedFace = {
      x: 200,
      y: 150,
      width: 140,
      height: 160,
      rollAngle: 0,
    };

    const filterModes = [
      'none',
      'hood_headband',
      'sayuri_head',
      'blush_sparkles',
      'sailor_beret',
      'corner_buddies',
    ] as const;

    filterModes.forEach((filter) => {
      expect(() => {
        compositor.compositeFullFrame({
          targetCanvas,
          video: null,
          streamActive: false,
          isMirrored: false,
          backgroundCanvas: null,
          face,
          faceFilter: filter,
          tracker,
          stickers: [],
          colorFilter: 'normal',
        });
      }).not.toThrow();
    });
  });

  it('draws all sticker types without error', () => {
    const compositor = new FrameCompositor();
    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = 640;
    targetCanvas.height = 480;

    const tracker = new FaceTrackerEngine();
    const stickers: StickerInstance[] = [
      { id: '1', type: 'hangyudon_face', x: 50, y: 50, scale: 1, rotation: 0 },
      { id: '2', type: 'hangyudon_hood', x: 100, y: 50, scale: 1, rotation: 0 },
      { id: '3', type: 'sayuri_octopus', x: 150, y: 50, scale: 1, rotation: 0 },
      { id: '4', type: 'ramen_bowl', x: 200, y: 50, scale: 1, rotation: 0 },
      { id: '5', type: 'clam_pearl', x: 250, y: 50, scale: 1, rotation: 0 },
      { id: '6', type: 'sparkle_stars', x: 300, y: 50, scale: 1, rotation: 0 },
      { id: '7', type: 'badge_cute', x: 350, y: 50, scale: 1, rotation: 0 },
      { id: '8', type: 'badge_hangyudon', x: 400, y: 50, scale: 1, rotation: 0 },
      { id: '9', type: 'speech_bubble', x: 450, y: 50, scale: 1, rotation: 0 },
    ];

    expect(() => {
      compositor.compositeFullFrame({
        targetCanvas,
        video: null,
        streamActive: false,
        isMirrored: false,
        backgroundCanvas: null,
        face: null,
        faceFilter: 'none',
        tracker,
        stickers,
        colorFilter: 'normal',
      });
    }).not.toThrow();
  });
});
