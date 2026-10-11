export type StickerType =
  | 'hangyudon_face'
  | 'hangyudon_hood'
  | 'sayuri_octopus'
  | 'ramen_bowl'
  | 'otamaro_tadpole'
  | 'clam_pearl'
  | 'sparkle_stars'
  | 'badge_cute'
  | 'badge_hangyudon'
  | 'speech_bubble';

export interface StickerInstance {
  id: string;
  type: StickerType;
  x: number;
  y: number;
  scale: number;
  rotation: number; // degrees
}

export interface StickerUpdateParams {
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
}

export class StickerManager {
  private stickers: StickerInstance[] = [];
  private nextId: number = 1;

  constructor(initialStickers: StickerInstance[] = []) {
    this.stickers = [...initialStickers];
  }

  public getStickers(): StickerInstance[] {
    return this.stickers;
  }

  public addSticker(type: StickerType, position: { x: number; y: number }): StickerInstance {
    const sticker: StickerInstance = {
      id: `sticker-${this.nextId++}-${Date.now().toString(36)}`,
      type,
      x: position.x,
      y: position.y,
      scale: 1,
      rotation: 0,
    };
    this.stickers.push(sticker);
    return sticker;
  }

  public updateSticker(id: string, params: StickerUpdateParams): StickerInstance | null {
    const sticker = this.stickers.find((s) => s.id === id);
    if (!sticker) return null;

    if (params.x !== undefined) sticker.x = params.x;
    if (params.y !== undefined) sticker.y = params.y;
    if (params.scale !== undefined) sticker.scale = params.scale;
    if (params.rotation !== undefined) sticker.rotation = params.rotation;

    return sticker;
  }

  public removeSticker(id: string): boolean {
    const index = this.stickers.findIndex((s) => s.id === id);
    if (index === -1) return false;
    this.stickers.splice(index, 1);
    return true;
  }

  public bringToFront(id: string): boolean {
    const index = this.stickers.findIndex((s) => s.id === id);
    if (index === -1) return false;
    const [sticker] = this.stickers.splice(index, 1);
    this.stickers.push(sticker);
    return true;
  }

  public clearStickers(): void {
    this.stickers = [];
  }
}
