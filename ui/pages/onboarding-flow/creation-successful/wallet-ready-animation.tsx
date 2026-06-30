import React, { useEffect, useRef } from 'react';
import { Box } from '@metamask/design-system-react';

// eslint-disable-next-line @typescript-eslint/naming-convention
export default function WalletReadyAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return undefined;
    }

    const CX = 150;
    const CY = 150;
    const ORANGE = '#ff7500';
    let t = 0;
    let rafId: number;

    const particles = Array.from({ length: 28 }, (_, i) => ({
      angle: (i / 28) * Math.PI * 2,
      r: 78 + Math.random() * 52,
      speed:
        (0.004 + Math.random() * 0.008) * (Math.random() < 0.5 ? 1 : -1),
      size: 1.5 + Math.random() * 2.5,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.6 + Math.random() * 0.4,
      colorPhase: Math.random() * Math.PI * 2,
    }));

    function lerpColor(val: number) {
      return { r: Math.round(255 * val), g: Math.round(140 * val), b: 0 };
    }

    function drawGlowRing() {
      const radius = 108;
      for (let i = 3; i >= 0; i--) {
        ctx.beginPath();
        ctx.arc(CX, CY, radius + i * 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,140,0,${0.05 + i * 0.02})`;
        ctx.lineWidth = (4 - i) * 3;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(CX, CY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = ORANGE;
      ctx.lineWidth = 3.5;
      ctx.stroke();
    }

    function drawParticles(time: number) {
      particles.forEach((p) => {
        p.angle += p.speed;
        const wobble = Math.sin(time * 1.2 + p.phase) * 7;
        const px = CX + Math.cos(p.angle) * (p.r + wobble);
        const py = CY + Math.sin(p.angle) * (p.r + wobble) * 0.65;
        const cycle = 0.5 + 0.5 * Math.sin(time * 1.4 + p.colorPhase);
        const { r, g, b } = lerpColor(cycle);
        const pulse = 0.5 + 0.5 * Math.sin(time * 2 + p.phase);
        const alpha = (0.5 + pulse * 0.5) * p.opacity;
        const size = p.size * (0.7 + pulse * 0.4);
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();
      });
    }

    function frame() {
      ctx.clearRect(0, 0, 300, 300);
      t += 0.025;
      drawGlowRing();
      drawParticles(t);
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <Box className="riv-animation__wallet-ready-container">
      <div style={{ position: 'relative', width: 300, height: 300 }}>
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
        <img
          src="https://s3.ap-southeast-2.wasabisys.com/airdrive-apps/air-coin-icon.png"
          alt="AIR Wallet"
          style={{
            position: 'absolute',
            width: 196,
            height: 196,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 1,
            pointerEvents: 'none',
          }}
        />
      </div>
    </Box>
  );
}
