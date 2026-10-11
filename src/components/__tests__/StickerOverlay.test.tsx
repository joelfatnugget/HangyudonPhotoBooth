import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { StickerOverlay } from '../StickerOverlay';
import { StickerManager } from '../../services/stickerManager';

describe('StickerOverlay', () => {
  it('renders active stickers from StickerManager', () => {
    const manager = new StickerManager();
    manager.addSticker('hangyudon_face', { x: 100, y: 150 });
    manager.addSticker('sayuri_octopus', { x: 250, y: 200 });

    const { container } = render(
      <StickerOverlay
        manager={manager}
        onUpdate={() => {}}
      />
    );

    const stickerElements = container.querySelectorAll('[data-testid^="sticker-item-"]');
    expect(stickerElements.length).toBe(2);
  });

  it('allows selecting and removing a sticker', () => {
    const manager = new StickerManager();
    const s1 = manager.addSticker('ramen_bowl', { x: 100, y: 100 });
    const updateSpy = vi.fn();

    const { getByTestId, queryByTestId } = render(
      <StickerOverlay
        manager={manager}
        onUpdate={updateSpy}
      />
    );

    // Click on sticker to select it
    const stickerElem = getByTestId(`sticker-item-${s1.id}`);
    fireEvent.click(stickerElem);

    // Delete button should now appear
    const deleteBtn = getByTestId('delete-sticker-btn');
    expect(deleteBtn).toBeInTheDocument();

    fireEvent.click(deleteBtn);
    expect(manager.getStickers().length).toBe(0);
    expect(queryByTestId(`sticker-item-${s1.id}`)).toBeNull();
  });
});
