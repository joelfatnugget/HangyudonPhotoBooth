import React, { useState, useRef } from 'react';
import {
  StickerManager,
  StickerInstance,
  StickerType,
} from '../services/stickerManager';
import {
  HangyudonCharacter,
  SayuriOctopus,
  HangyudonHoodHeadband,
  RamenSticker,
  ClamSticker,
  SparkleSticker,
  BadgeSticker,
} from './HangyudonArt';
import { Trash2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface StickerOverlayProps {
  manager: StickerManager;
  onUpdate: () => void;
  interactive?: boolean;
}

export const StickerOverlay: React.FC<StickerOverlayProps> = ({
  manager,
  onUpdate,
  interactive = true,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    initialStickerX: number;
    initialStickerY: number;
  } | null>(null);

  const stickers = manager.getStickers();

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    sticker: StickerInstance
  ) => {
    if (!interactive) return;
    e.stopPropagation();

    setSelectedId(sticker.id);
    manager.bringToFront(sticker.id);

    dragRef.current = {
      id: sticker.id,
      startX: e.clientX,
      startY: e.clientY,
      initialStickerX: sticker.x,
      initialStickerY: sticker.y,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onUpdate();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !interactive) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    manager.updateSticker(dragRef.current.id, {
      x: dragRef.current.initialStickerX + dx,
      y: dragRef.current.initialStickerY + dy,
    });
    onUpdate();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored if not captured
      }
      dragRef.current = null;
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    manager.removeSticker(id);
    if (selectedId === id) {
      setSelectedId(null);
    }
    onUpdate();
  };

  const handleScale = (id: string, factor: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const s = stickers.find((item) => item.id === id);
    if (!s) return;
    const newScale = Math.max(0.4, Math.min(3.0, s.scale + factor));
    manager.updateSticker(id, { scale: newScale });
    onUpdate();
  };

  const handleRotate = (id: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const s = stickers.find((item) => item.id === id);
    if (!s) return;
    manager.updateSticker(id, { rotation: (s.rotation + delta) % 360 });
    onUpdate();
  };

  const renderStickerGraphic = (type: StickerType) => {
    switch (type) {
      case 'hangyudon_face':
        return <HangyudonCharacter size={96} mood="happy" />;
      case 'hangyudon_hood':
        return <HangyudonHoodHeadband size={120} />;
      case 'sayuri_octopus':
        return <SayuriOctopus size={76} />;
      case 'ramen_bowl':
        return <RamenSticker size={76} />;
      case 'clam_pearl':
        return <ClamSticker size={72} />;
      case 'sparkle_stars':
        return <SparkleSticker size={64} />;
      case 'badge_cute':
        return <BadgeSticker text="KAWAII" subtext="さゆり & はんぎょ" size={76} />;
      case 'badge_hangyudon':
        return <BadgeSticker text="はんぎょどん" subtext="BEST FRIEND" size={82} />;
      case 'speech_bubble':
        return (
          <div className="bg-white/95 text-slate-800 font-cute font-bold text-xs px-3 py-1.5 rounded-2xl border-2 border-slate-800 shadow-md">
            Chillin&apos; underwater!
          </div>
        );
      default:
        return <HangyudonCharacter size={80} />;
    }
  };

  return (
    <div
      className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
      onClick={() => setSelectedId(null)}
    >
      {stickers.map((sticker) => {
        const isSelected = selectedId === sticker.id;
        return (
          <div
            key={sticker.id}
            data-testid={`sticker-item-${sticker.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(sticker.id);
              onUpdate();
            }}
            onPointerDown={(e) => handlePointerDown(e, sticker)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              transform: `translate(${sticker.x}px, ${sticker.y}px) translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
            }}
            className={`absolute top-0 left-0 pointer-events-auto cursor-grab active:cursor-grabbing select-none transition-shadow ${
              isSelected
                ? 'ring-2 ring-teal-400 ring-offset-2 ring-offset-transparent rounded-2xl shadow-lg'
                : 'hover:scale-105'
            }`}
          >
            {renderStickerGraphic(sticker.type)}

            {isSelected && interactive && (
              <div
                className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-xl border border-teal-300 pointer-events-auto"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  data-testid="delete-sticker-btn"
                  onClick={(e) => handleDelete(sticker.id, e)}
                  title="Remove sticker"
                  className="p-1 hover:bg-rose-500/40 rounded-full text-rose-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleScale(sticker.id, 0.15, e)}
                  title="Enlarge"
                  className="p-1 hover:bg-teal-500/40 rounded-full text-teal-300 transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleScale(sticker.id, -0.15, e)}
                  title="Shrink"
                  className="p-1 hover:bg-teal-500/40 rounded-full text-teal-300 transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleRotate(sticker.id, 15, e)}
                  title="Rotate"
                  className="p-1 hover:bg-teal-500/40 rounded-full text-teal-300 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
