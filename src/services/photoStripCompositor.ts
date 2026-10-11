export type StripLayoutType = 'single' | 'strip_4' | 'grid_4';
export type FrameThemeKey = 'mint' | 'coral' | 'navy' | 'buttercup' | 'lavender';

export interface FrameTheme {
  key: FrameThemeKey;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  textColor: string;
  pattern: 'dots' | 'bubbles' | 'stars' | 'waves';
}

export const FRAME_THEMES: Record<FrameThemeKey, FrameTheme> = {
  mint: {
    key: 'mint',
    name: 'Hangyudon Mint',
    primary: '#99f6e4',
    secondary: '#5eead4',
    accent: '#0d9488',
    textColor: '#134e4a',
    pattern: 'bubbles',
  },
  coral: {
    key: 'coral',
    name: 'Sayuri Coral',
    primary: '#fecdd3',
    secondary: '#fda4af',
    accent: '#e11d48',
    textColor: '#881337',
    pattern: 'dots',
  },
  navy: {
    key: 'navy',
    name: 'Deep Blue Sea',
    primary: '#0f2744',
    secondary: '#1e3a5f',
    accent: '#38b2ac',
    textColor: '#f0fdfa',
    pattern: 'waves',
  },
  buttercup: {
    key: 'buttercup',
    name: 'Ramen Yellow',
    primary: '#fef08a',
    secondary: '#fde047',
    accent: '#b45309',
    textColor: '#78350f',
    pattern: 'stars',
  },
  lavender: {
    key: 'lavender',
    name: 'Dreamy Lavender',
    primary: '#e9d5ff',
    secondary: '#d8b4fe',
    accent: '#7e22ce',
    textColor: '#581c87',
    pattern: 'bubbles',
  },
};

export interface PhotoSlot {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ComputedLayout {
  type: StripLayoutType;
  totalWidth: number;
  totalHeight: number;
  margin: number;
  photoSlots: PhotoSlot[];
  headerHeight: number;
  footerHeight: number;
}

export class PhotoStripCompositor {
  public computeLayout(
    layoutType: StripLayoutType,
    photoWidth: number,
    photoHeight: number
  ): ComputedLayout {
    const margin = 24;
    const spacing = 16;
    const headerHeight = 70;
    const footerHeight = 90;

    if (layoutType === 'single') {
      const totalWidth = photoWidth + margin * 2;
      const totalHeight = photoHeight + headerHeight + footerHeight + margin * 2;
      return {
        type: layoutType,
        totalWidth,
        totalHeight,
        margin,
        headerHeight,
        footerHeight,
        photoSlots: [
          {
            index: 0,
            x: margin,
            y: margin + headerHeight,
            width: photoWidth,
            height: photoHeight,
          },
        ],
      };
    }

    if (layoutType === 'grid_4') {
      const totalWidth = photoWidth * 2 + spacing + margin * 2;
      const totalHeight = photoHeight * 2 + spacing + headerHeight + footerHeight + margin * 2;

      const slots: PhotoSlot[] = [
        {
          index: 0,
          x: margin,
          y: margin + headerHeight,
          width: photoWidth,
          height: photoHeight,
        },
        {
          index: 1,
          x: margin + photoWidth + spacing,
          y: margin + headerHeight,
          width: photoWidth,
          height: photoHeight,
        },
        {
          index: 2,
          x: margin,
          y: margin + headerHeight + photoHeight + spacing,
          width: photoWidth,
          height: photoHeight,
        },
        {
          index: 3,
          x: margin + photoWidth + spacing,
          y: margin + headerHeight + photoHeight + spacing,
          width: photoWidth,
          height: photoHeight,
        },
      ];

      return {
        type: layoutType,
        totalWidth,
        totalHeight,
        margin,
        headerHeight,
        footerHeight,
        photoSlots: slots,
      };
    }

    // Default: 'strip_4' (vertical 4-cut photobooth strip)
    const totalWidth = photoWidth + margin * 2;
    const totalHeight =
      margin * 2 + headerHeight + footerHeight + photoHeight * 4 + spacing * 3;

    const slots: PhotoSlot[] = [];
    for (let i = 0; i < 4; i++) {
      slots.push({
        index: i,
        x: margin,
        y: margin + headerHeight + i * (photoHeight + spacing),
        width: photoWidth,
        height: photoHeight,
      });
    }

    return {
      type: layoutType,
      totalWidth,
      totalHeight,
      margin,
      headerHeight,
      footerHeight,
      photoSlots: slots,
    };
  }

  public renderStripToCanvas(
    canvas: HTMLCanvasElement,
    layout: ComputedLayout,
    theme: FrameTheme,
    photos: HTMLCanvasElement[] | HTMLImageElement[],
    dateString: string = new Date().toLocaleDateString('ja-JP')
  ): void {
    canvas.width = layout.totalWidth;
    canvas.height = layout.totalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background color
    ctx.fillStyle = theme.primary;
    ctx.fillRect(0, 0, layout.totalWidth, layout.totalHeight);

    // Cute decorative pattern
    ctx.fillStyle = theme.secondary;
    if (theme.pattern === 'bubbles' || theme.pattern === 'dots') {
      for (let x = 12; x < layout.totalWidth; x += 32) {
        for (let y = 12; y < layout.totalHeight; y += 32) {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Header: "HANGYUDON PHOTOBOOTH"
    ctx.fillStyle = theme.textColor;
    ctx.font = 'bold 22px Fredoka, Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('HANGYUDON PHOTOBOOTH', layout.totalWidth / 2, layout.margin + layout.headerHeight / 2 - 8);

    ctx.font = '14px Quicksand, sans-serif';
    ctx.fillText('はんぎょどん と さゆりちゃん', layout.totalWidth / 2, layout.margin + layout.headerHeight / 2 + 16);

    // Photos with cute inner frame borders
    layout.photoSlots.forEach((slot, idx) => {
      const img = photos[idx];
      // Photo card white border
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(slot.x - 4, slot.y - 4, slot.width + 8, slot.height + 8);

      if (img) {
        ctx.drawImage(img, slot.x, slot.y, slot.width, slot.height);
      } else {
        // Placeholder
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
      }
    });

    // Footer: cute mascot signature + date
    const footerCenterY = layout.totalHeight - layout.margin - layout.footerHeight / 2;
    ctx.fillStyle = theme.textColor;
    ctx.font = 'bold 16px Fredoka, Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SANRIO CHARACTERS / HANGYUDON', layout.totalWidth / 2, footerCenterY - 10);

    ctx.font = '12px monospace';
    ctx.fillText(dateString, layout.totalWidth / 2, footerCenterY + 14);
  }
}
