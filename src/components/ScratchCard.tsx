import { useEffect, useRef, useState } from "react";

type Props = {
  width?: number;
  height?: number;
  onComplete: () => void;
  children: React.ReactNode;
};

export function ScratchCard({ width = 320, height = 320, onComplete, children }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Foil layer
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#c9a24a");
    grad.addColorStop(0.5, "#f5d989");
    grad.addColorStop(1, "#a87a2a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "bold 22px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH HERE", width / 2, height / 2 - 8);
    ctx.font = "16px system-ui";
    ctx.fillText("👆 Use your finger", width / 2, height / 2 + 18);

    ctx.globalCompositeOperation = "destination-out";
  }, [width, height]);

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas || done) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const cx = x - rect.left;
    const cy = y - rect.top;
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fill();
  };

  const autoReveal = () => {
    const canvas = canvasRef.current;
    if (!canvas || done) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setDone(true);
    // Animate clearing the rest of the foil
    let radius = 30;
    const cx = canvas.width / (2 * (window.devicePixelRatio || 1));
    const cy = canvas.height / (2 * (window.devicePixelRatio || 1));
    const maxR = Math.max(width, height);
    const step = () => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      radius += 18;
      if (radius < maxR) requestAnimationFrame(step);
      else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onComplete();
      }
    };
    step();
  };

  const checkCompletion = () => {
    const canvas = canvasRef.current;
    if (!canvas || done) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0;
    const step = 50;
    for (let i = 3; i < pixels.length; i += 4 * step) {
      if (pixels[i] === 0) cleared++;
    }
    const total = pixels.length / (4 * step);
    // Auto-reveal quickly so the prize and celebration are easy to reach.
    if (cleared / total > 0.08) {
      autoReveal();
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDrawing.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    scratch(e.clientX, e.clientY);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current) return;
    scratch(e.clientX, e.clientY);
    checkCompletion();
  };
  const handlePointerUp = () => {
    isDrawing.current = false;
    checkCompletion();
  };

  return (
    <div
      ref={wrapRef}
      className="relative overflow-hidden rounded-3xl border-4 border-gold shadow-pop"
      style={{ width, height }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-confetti p-6 text-center">
        {children}
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
        style={{ opacity: done ? 0 : 1, transition: "opacity 0.4s ease" }}
      />
    </div>
  );
}
