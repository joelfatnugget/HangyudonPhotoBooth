export type BubbleItemType = 'plain' | 'ramen' | 'star' | 'sayuri' | 'heart' | 'pearl' | 'fish';

export interface Bubble {
  id: string;
  x: number;
  y: number;
  radius: number;
  speed: number;
  wobbleSpeed: number;
  wobbleAmplitude: number;
  wobbleOffset: number;
  opacity: number;
  popped: boolean;
  itemType: BubbleItemType;
  hueShift: number;
}

export interface PopParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  lifespan: number;
  age: number;
}

export interface WaterRipple {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

export interface BubbleEngineOptions {
  width?: number;
  height?: number;
  initialBubbleCount?: number;
  faceSafeZone?: boolean;
}

const ITEM_TYPES: BubbleItemType[] = ['plain', 'ramen', 'star', 'sayuri', 'heart', 'pearl', 'fish'];

export class BubbleEngine {
  private width: number;
  private height: number;
  private bubbles: Bubble[] = [];
  private particles: PopParticle[] = [];
  private ripples: WaterRipple[] = [];
  private nextId: number = 1;
  private faceSafeZone: boolean = true;

  constructor(options: BubbleEngineOptions = {}) {
    this.width = options.width ?? 800;
    this.height = options.height ?? 600;
    this.faceSafeZone = options.faceSafeZone ?? true;
    const count = options.initialBubbleCount ?? 7;

    for (let i = 0; i < count; i++) {
      this.bubbles.push(this.createRandomBubble(true));
    }
  }

  public setBounds(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public setFaceSafeZone(enabled: boolean): void {
    this.faceSafeZone = enabled;
  }

  public getFaceSafeZone(): boolean {
    return this.faceSafeZone;
  }

  public getBubbles(): Bubble[] {
    return this.bubbles;
  }

  public getParticles(): PopParticle[] {
    return this.particles;
  }

  public getRipples(): WaterRipple[] {
    return this.ripples;
  }

  private generateId(prefix: string): string {
    return `${prefix}-${this.nextId++}-${Math.random().toString(36).substring(2, 7)}`;
  }

  private getRandomX(): number {
    if (this.faceSafeZone) {
      // Keep bubbles strictly in perimeter border lanes (left 22% or right 22%)
      const isLeftLane = Math.random() < 0.5;
      if (isLeftLane) {
        return Math.random() * (this.width * 0.22);
      } else {
        return this.width * 0.78 + Math.random() * (this.width * 0.22);
      }
    }
    return Math.random() * this.width;
  }

  private createRandomBubble(randomY: boolean = false): Bubble {
    const radius = 18 + Math.random() * 20; // 18px to 38px (elegant, not overwhelming)
    const itemType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];

    return {
      id: this.generateId('bubble'),
      x: this.getRandomX(),
      y: randomY ? Math.random() * this.height : this.height + radius + 10,
      radius,
      speed: 0.35 + Math.random() * 0.6, // gentle drifting speed
      wobbleSpeed: 0.002 + Math.random() * 0.003,
      wobbleAmplitude: 8 + Math.random() * 12,
      wobbleOffset: Math.random() * Math.PI * 2,
      opacity: 0.7 + Math.random() * 0.25,
      popped: false,
      itemType,
      hueShift: Math.floor(Math.random() * 360),
    };
  }

  public spawnBubbleAt(x: number, y: number, itemType: BubbleItemType = 'plain', radius?: number): Bubble {
    const bubbleRadius = radius ?? (24 + Math.random() * 24);
    const bubble: Bubble = {
      id: this.generateId('bubble'),
      x,
      y,
      radius: bubbleRadius,
      speed: 0.5 + Math.random() * 0.7,
      wobbleSpeed: 0.003,
      wobbleAmplitude: 15,
      wobbleOffset: Math.random() * Math.PI * 2,
      opacity: 0.85,
      popped: false,
      itemType,
      hueShift: Math.floor(Math.random() * 360),
    };
    this.bubbles.push(bubble);
    return bubble;
  }

  public spawnRippleAt(x: number, y: number): WaterRipple {
    const ripple: WaterRipple = {
      id: this.generateId('ripple'),
      x,
      y,
      radius: 5,
      maxRadius: 55 + Math.random() * 25,
      opacity: 0.8,
    };
    this.ripples.push(ripple);
    return ripple;
  }

  public findBubbleAt(x: number, y: number): Bubble | null {
    // Check backwards to hit topmost bubble first
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const bubble = this.bubbles[i];
      if (bubble.popped) continue;
      const dx = bubble.x - x;
      const dy = bubble.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= bubble.radius) {
        return bubble;
      }
    }
    return null;
  }

  public popBubble(id: string): Bubble | null {
    const index = this.bubbles.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const [bubble] = this.bubbles.splice(index, 1);
    bubble.popped = true;

    // Create 8-14 burst particles
    const particleCount = 8 + Math.floor(Math.random() * 6);
    const colors = ['#a7f3d0', '#67e8f9', '#fde68a', '#fda4af', '#ffffff'];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        id: this.generateId('particle'),
        x: bubble.x,
        y: bubble.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        radius: 2 + Math.random() * 3.5,
        opacity: 0.9,
        color: colors[Math.floor(Math.random() * colors.length)],
        lifespan: 350 + Math.random() * 200, // ms
        age: 0,
      });
    }

    this.spawnRippleAt(bubble.x, bubble.y);
    return bubble;
  }

  public update(deltaTimeMs: number): void {
    const dtFactor = deltaTimeMs / 16.67; // Normalize to 60fps frame delta

    // Update bubbles
    for (let i = 0; i < this.bubbles.length; i++) {
      const b = this.bubbles[i];
      b.y -= b.speed * dtFactor * 1.5;
      b.wobbleOffset += b.wobbleSpeed * deltaTimeMs;
      b.x += Math.sin(b.wobbleOffset) * 0.4 * dtFactor;

      // Wrap around or respawn from bottom if floated out of screen
      if (b.y < -b.radius - 20) {
        b.y = this.height + b.radius + 10;
        b.x = this.getRandomX();
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += deltaTimeMs;
      if (p.age >= p.lifespan) {
        this.particles.splice(i, 1);
      } else {
        p.x += p.vx * dtFactor;
        p.y += p.vy * dtFactor;
        p.vy += 0.05 * dtFactor; // subtle gravity
        p.opacity = Math.max(0, 0.9 * (1 - p.age / p.lifespan));
      }
    }

    // Update ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += 1.8 * dtFactor;
      r.opacity = Math.max(0, 0.8 * (1 - r.radius / r.maxRadius));
      if (r.radius >= r.maxRadius || r.opacity <= 0.02) {
        this.ripples.splice(i, 1);
      }
    }
  }
}
