import React, { useRef, useEffect, useCallback } from 'react';
import { BubbleEngine, Bubble, BubbleItemType } from '../services/bubbleEngine';
import { SoundSynthesizer } from '../services/soundSynthesizer';

interface InteractiveBackgroundProps {
  engine: BubbleEngine;
  sound: SoundSynthesizer;
  width: number;
  height: number;
  onBubblePop?: (bubble: Bubble) => void;
  filterMode?: 'normal' | 'dreamy' | 'ocean' | 'vivid' | 'vintage';
  interactiveMode?: boolean;
}

export const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({
  engine,
  sound,
  width,
  height,
  onBubblePop,
  filterMode = 'ocean',
  interactiveMode = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Draw an individual bubble with glass highlight and optional cute item inside
  const drawBubble = (ctx: CanvasRenderingContext2D, bubble: Bubble) => {
    ctx.save();

    // Outer glow / bubble sphere
    const grad = ctx.createRadialGradient(
      bubble.x - bubble.radius * 0.3,
      bubble.y - bubble.radius * 0.3,
      bubble.radius * 0.1,
      bubble.x,
      bubble.y,
      bubble.radius
    );

    grad.addColorStop(0, `rgba(255, 255, 255, ${bubble.opacity * 0.85})`);
    grad.addColorStop(0.5, `rgba(167, 243, 208, ${bubble.opacity * 0.4})`); // mint
    grad.addColorStop(0.8, `rgba(186, 230, 253, ${bubble.opacity * 0.5})`); // sky
    grad.addColorStop(1, `rgba(251, 113, 133, ${bubble.opacity * 0.6})`); // subtle coral rim

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    ctx.fill();

    // Bubble rim outline
    ctx.strokeStyle = `rgba(255, 255, 255, ${bubble.opacity * 0.75})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Specular shine (crescent highlight)
    ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity * 0.9})`;
    ctx.beginPath();
    ctx.ellipse(
      bubble.x - bubble.radius * 0.35,
      bubble.y - bubble.radius * 0.35,
      bubble.radius * 0.28,
      bubble.radius * 0.14,
      -Math.PI / 4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw embedded cute item inside bubble
    drawEmbeddedItem(ctx, bubble.x, bubble.y, bubble.radius * 0.55, bubble.itemType);

    ctx.restore();
  };

  const drawEmbeddedItem = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    type: BubbleItemType
  ) => {
    if (type === 'plain') return;

    ctx.save();
    ctx.translate(x, y);

    if (type === 'ramen') {
      // Mini ramen bowl
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.8, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-size * 0.7, -size * 0.2, size * 1.4, size * 0.3);
      // Naruto swirl
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -size * 0.05, size * 0.28, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'star') {
      // Yellow star
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outer = size * 0.8;
        const inner = size * 0.35;
        const rot = (Math.PI / 5) * 2 * i - Math.PI / 2;
        const inRot = rot + Math.PI / 5;
        if (i === 0) ctx.moveTo(Math.cos(rot) * outer, Math.sin(rot) * outer);
        else ctx.lineTo(Math.cos(rot) * outer, Math.sin(rot) * outer);
        ctx.lineTo(Math.cos(inRot) * inner, Math.sin(inRot) * inner);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (type === 'heart') {
      // Pink heart
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(0, 0, -size * 0.6, 0, -size * 0.6, topCurveHeight);
      ctx.bezierCurveTo(-size * 0.6, size * 0.6, 0, size * 0.8, 0, size * 0.95);
      ctx.bezierCurveTo(0, size * 0.8, size * 0.6, size * 0.6, size * 0.6, topCurveHeight);
      ctx.bezierCurveTo(size * 0.6, 0, 0, 0, 0, topCurveHeight);
      ctx.fill();
    } else if (type === 'sayuri' || type === 'fish') {
      // Mini Sayuri or Hangyudon fin
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(0, -size * 0.1, size * 0.55, 0, Math.PI * 2);
      ctx.fill();
      // eyes
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-size * 0.2, -size * 0.2, 2, 3);
      ctx.fillRect(size * 0.15, -size * 0.2, 2, 3);
    } else if (type === 'pearl') {
      // Shimmering pearl
      const pearlGrad = ctx.createRadialGradient(-size * 0.2, -size * 0.2, 1, 0, 0, size * 0.6);
      pearlGrad.addColorStop(0, '#ffffff');
      pearlGrad.addColorStop(0.7, '#e9d5ff');
      pearlGrad.addColorStop(1, '#c084fc');
      ctx.fillStyle = pearlGrad;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  // Main animation render loop
  const renderLoop = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const delta = Math.min(now - lastTimeRef.current, 60);
      lastTimeRef.current = now;

      // Update bubble engine simulation
      engine.setBounds(width, height);
      engine.update(delta);

      // Clear canvas (transparent to preserve underlying camera feed visibility)
      ctx.clearRect(0, 0, width, height);

      // Subtle atmospheric filter overlay that preserves background camera visibility
      if (filterMode === 'ocean') {
        const ambient = ctx.createLinearGradient(0, 0, 0, height);
        ambient.addColorStop(0, 'rgba(34, 211, 238, 0.05)'); // subtle cyan top
        ambient.addColorStop(1, 'rgba(13, 148, 136, 0.12)'); // soft teal bottom
        ctx.fillStyle = ambient;
        ctx.fillRect(0, 0, width, height);
      } else if (filterMode === 'dreamy') {
        const ambient = ctx.createLinearGradient(0, 0, width, height);
        ambient.addColorStop(0, 'rgba(244, 114, 182, 0.08)'); // pastel pink
        ambient.addColorStop(1, 'rgba(192, 132, 252, 0.08)'); // pastel violet
        ctx.fillStyle = ambient;
        ctx.fillRect(0, 0, width, height);
      } else if (filterMode === 'vintage') {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.07)'; // warm yellow tint
        ctx.fillRect(0, 0, width, height);
      }

      // Render expanding water ripples
      engine.getRipples().forEach((ripple) => {
        ctx.save();
        ctx.strokeStyle = `rgba(167, 243, 208, ${ripple.opacity})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.opacity * 0.6})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, Math.max(1, ripple.radius - 6), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // Render floating bubbles
      engine.getBubbles().forEach((b) => {
        if (!b.popped) {
          drawBubble(ctx, b);
        }
      });

      // Render popping particle bursts
      engine.getParticles().forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(renderLoop);
    },
    [engine, width, height, filterMode]
  );

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [renderLoop]);

  // Handle pointer down (touch or click)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactiveMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if clicked an existing bubble
    const hitBubble = engine.findBubbleAt(clickX, clickY);

    if (hitBubble) {
      const popped = engine.popBubble(hitBubble.id);
      if (popped) {
        sound.playBubblePop();
        onBubblePop?.(popped);
      }
    } else {
      // Clicked on empty space: spawn water ripple & spawn new bubble!
      engine.spawnRippleAt(clickX, clickY);
      const items: BubbleItemType[] = ['ramen', 'sayuri', 'star', 'pearl', 'heart', 'fish'];
      const randomItem = items[Math.floor(Math.random() * items.length)];
      engine.spawnBubbleAt(clickX, clickY, randomItem);
      sound.playBubblePop();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onPointerDown={handlePointerDown}
      className="absolute inset-0 z-10 w-full h-full cursor-pointer pointer-events-auto touch-none"
      title="Tap or click bubbles to pop, click background to spawn bubbles!"
    />
  );
};
