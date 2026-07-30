import { useEffect, useRef, useState } from 'react';

interface DrawingCanvasProps {
  isEnabled: boolean;
  onDrawComplete?: (circleData: { x: number, y: number, radius: number }) => void;
}

export default function DrawingCanvas({ isEnabled, onDrawComplete }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Resize canvas to match parent precisely
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEnabled) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setIsDrawing(true);
    setStartPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isEnabled || !startPos || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const radius = Math.sqrt(
      Math.pow(currentX - startPos.x, 2) + Math.pow(currentY - startPos.y, 2)
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw dashed red circle
    ctx.beginPath();
    ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]);
    ctx.stroke();

    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEnabled || !isDrawing || !startPos || !canvasRef.current) return;
    setIsDrawing(false);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const radius = Math.sqrt(
      Math.pow(currentX - startPos.x, 2) + Math.pow(currentY - startPos.y, 2)
    );

    // Reset dash for future dynamic Gemma overlays (like solid arrows)
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    }

    // Trigger the callback with normalized coordinates (0 to 1) for the backend math
    if (onDrawComplete && radius > 5) { // Ensure it wasn't just a click
      onDrawComplete({
        x: startPos.x / canvasRef.current.width,
        y: startPos.y / canvasRef.current.height,
        radius: radius / Math.min(canvasRef.current.width, canvasRef.current.height)
      });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 z-10 ${isEnabled ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}
