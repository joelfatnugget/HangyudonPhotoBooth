import { describe, it, expect } from 'vitest';
import { StickerManager } from '../stickerManager';

describe('StickerManager', () => {
  it('starts with an empty sticker list or provided initial stickers', () => {
    const manager = new StickerManager();
    expect(manager.getStickers()).toEqual([]);
  });

  it('adds a sticker with default position, scale, and rotation', () => {
    const manager = new StickerManager();
    const sticker = manager.addSticker('hangyudon_face', { x: 150, y: 200 });

    expect(sticker.type).toBe('hangyudon_face');
    expect(sticker.x).toBe(150);
    expect(sticker.y).toBe(200);
    expect(sticker.scale).toBe(1);
    expect(sticker.rotation).toBe(0);
    expect(manager.getStickers().length).toBe(1);
  });

  it('updates an existing sticker transform properties', () => {
    const manager = new StickerManager();
    const sticker = manager.addSticker('sayuri_octopus', { x: 100, y: 100 });

    const updated = manager.updateSticker(sticker.id, {
      x: 180,
      y: 220,
      scale: 1.5,
      rotation: 25,
    });

    expect(updated).not.toBeNull();
    expect(updated?.x).toBe(180);
    expect(updated?.y).toBe(220);
    expect(updated?.scale).toBe(1.5);
    expect(updated?.rotation).toBe(25);
  });

  it('removes a sticker by id', () => {
    const manager = new StickerManager();
    const s1 = manager.addSticker('ramen_bowl', { x: 50, y: 50 });
    const s2 = manager.addSticker('sparkle_stars', { x: 80, y: 80 });

    expect(manager.getStickers().length).toBe(2);

    const removed = manager.removeSticker(s1.id);
    expect(removed).toBe(true);
    expect(manager.getStickers().length).toBe(1);
    expect(manager.getStickers()[0].id).toBe(s2.id);
  });

  it('brings sticker to front (top of z-order)', () => {
    const manager = new StickerManager();
    const s1 = manager.addSticker('hangyudon_face', { x: 10, y: 10 });
    const s2 = manager.addSticker('clam_pearl', { x: 20, y: 20 });
    const s3 = manager.addSticker('badge_cute', { x: 30, y: 30 });

    expect(manager.getStickers().map((s) => s.id)).toEqual([s1.id, s2.id, s3.id]);

    manager.bringToFront(s1.id);
    expect(manager.getStickers().map((s) => s.id)).toEqual([s2.id, s3.id, s1.id]);
  });

  it('clears all stickers', () => {
    const manager = new StickerManager();
    manager.addSticker('hangyudon_face', { x: 10, y: 10 });
    manager.addSticker('sayuri_octopus', { x: 20, y: 20 });
    expect(manager.getStickers().length).toBe(2);

    manager.clearStickers();
    expect(manager.getStickers().length).toBe(0);
  });
});
