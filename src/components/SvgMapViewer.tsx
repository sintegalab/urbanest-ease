import { useState, useRef, useCallback, useEffect } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { LOT_STATUS_CONFIG, type Lot } from "@/data/mockData";
import { cn } from "@/lib/utils";

// Simulated clickable zones mapped to lot IDs
// In production these would come from real SVG path analysis
const SIMULATED_ZONES: { lotId: string; cx: number; cy: number; r: number }[] = [
  { lotId: "lot-1", cx: 320, cy: 420, r: 18 },
  { lotId: "lot-2", cx: 360, cy: 420, r: 18 },
  { lotId: "lot-3", cx: 400, cy: 420, r: 18 },
  { lotId: "lot-4", cx: 440, cy: 420, r: 18 },
  { lotId: "lot-5", cx: 480, cy: 420, r: 18 },
  { lotId: "lot-6", cx: 520, cy: 420, r: 18 },
  { lotId: "lot-7", cx: 320, cy: 380, r: 18 },
  { lotId: "lot-8", cx: 360, cy: 380, r: 18 },
  { lotId: "lot-9", cx: 400, cy: 380, r: 18 },
  { lotId: "lot-10", cx: 440, cy: 380, r: 18 },
  { lotId: "lot-11", cx: 480, cy: 380, r: 18 },
  { lotId: "lot-12", cx: 520, cy: 380, r: 18 },
  { lotId: "lot-13", cx: 320, cy: 340, r: 18 },
  { lotId: "lot-14", cx: 360, cy: 340, r: 18 },
  { lotId: "lot-15", cx: 400, cy: 340, r: 18 },
  { lotId: "lot-16", cx: 440, cy: 340, r: 18 },
  { lotId: "lot-17", cx: 480, cy: 340, r: 18 },
  { lotId: "lot-18", cx: 520, cy: 340, r: 18 },
  { lotId: "lot-19", cx: 320, cy: 300, r: 18 },
  { lotId: "lot-20", cx: 360, cy: 300, r: 18 },
  { lotId: "lot-21", cx: 400, cy: 300, r: 18 },
  { lotId: "lot-22", cx: 440, cy: 300, r: 18 },
  { lotId: "lot-23", cx: 480, cy: 300, r: 18 },
  { lotId: "lot-24", cx: 520, cy: 300, r: 18 },
];

interface Props {
  lots: Lot[];
  selectedLot: Lot | null;
  onSelectLot: (lot: Lot) => void;
}

export default function SvgMapViewer({ lots, selectedLot, onSelectLot }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const lotsById = Object.fromEntries(lots.map((l) => [l.id, l]));

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.3, 5));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.3, 0.5));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.min(Math.max(z * factor, 0.5), 5));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  return (
    <div className="relative w-full" style={{ minHeight: 500 }}>
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <button onClick={handleZoomIn} className="rounded-lg bg-card/90 backdrop-blur border border-border p-2 hover:bg-muted transition-colors shadow-sm">
          <ZoomIn className="h-4 w-4 text-card-foreground" />
        </button>
        <button onClick={handleZoomOut} className="rounded-lg bg-card/90 backdrop-blur border border-border p-2 hover:bg-muted transition-colors shadow-sm">
          <ZoomOut className="h-4 w-4 text-card-foreground" />
        </button>
        <button onClick={handleReset} className="rounded-lg bg-card/90 backdrop-blur border border-border p-2 hover:bg-muted transition-colors shadow-sm">
          <Maximize2 className="h-4 w-4 text-card-foreground" />
        </button>
      </div>

      {/* Zoom level indicator */}
      <div className="absolute bottom-3 left-3 z-10 rounded-md bg-card/90 backdrop-blur border border-border px-2 py-1 text-xs text-muted-foreground font-medium">
        {Math.round(zoom * 100)}%
      </div>

      {/* Map container with pan/zoom */}
      <div
        ref={containerRef}
        className={cn("overflow-hidden w-full", dragging ? "cursor-grabbing" : "cursor-grab")}
        style={{ height: 560 }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: dragging ? "none" : "transform 0.2s ease-out",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          {/* The actual SVG plano */}
          <img
            src="/maps/lomas-del-pedregal.svg"
            alt="Plano del desarrollo"
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />

          {/* Simulated clickable lot overlays */}
          <svg
            viewBox="0 0 800 600"
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: "none" }}
          >
            {SIMULATED_ZONES.map((zone) => {
              const lot = lotsById[zone.lotId];
              if (!lot) return null;
              const isSelected = selectedLot?.id === zone.lotId;
              const config = LOT_STATUS_CONFIG[lot.status];
              return (
                <g key={zone.lotId} style={{ pointerEvents: "auto" }}>
                  <rect
                    x={zone.cx - zone.r}
                    y={zone.cy - zone.r}
                    width={zone.r * 2}
                    height={zone.r * 2}
                    rx={3}
                    fill={`hsl(var(${config.colorVar}) / ${isSelected ? 0.85 : 0.5})`}
                    stroke={isSelected ? "hsl(var(--foreground))" : `hsl(var(${config.colorVar}))`}
                    strokeWidth={isSelected ? 2 : 1}
                    className="cursor-pointer transition-all duration-150 hover:opacity-90"
                    onClick={(e) => { e.stopPropagation(); onSelectLot(lot); }}
                  />
                  <text
                    x={zone.cx}
                    y={zone.cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="10"
                    fontWeight="600"
                    fill="hsl(var(--foreground))"
                    className="pointer-events-none select-none"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    {lot.number}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
