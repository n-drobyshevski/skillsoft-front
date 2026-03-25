'use client';

import { useMemo, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface RadarDataPoint {
  label: string;
  primary: number;    // 0-100 — the main dataset (e.g., candidate score)
  secondary: number;  // 0-100 — the comparison dataset (e.g., benchmark)
}

export interface RadarDatasetConfig {
  label: string;
  stroke: string;         // e.g., '#10b981'
  fill: string;           // e.g., 'rgba(16,185,129,0.10)'
  dotFill: string;        // e.g., '#34d399'
  dotStroke?: string;     // e.g., '#212121'
  dashed?: boolean;
}

export interface ComparisonRadarChartProps {
  data: RadarDataPoint[];
  /** Config for the primary dataset (solid polygon) */
  primary?: Partial<RadarDatasetConfig>;
  /** Config for the secondary dataset (dashed polygon) */
  secondary?: Partial<RadarDatasetConfig>;
  size?: number;
  className?: string;
}

// ============================================================================
// Default dataset configs
// ============================================================================

const DEFAULT_PRIMARY: RadarDatasetConfig = {
  label: 'Candidate',
  stroke: '#10b981',
  fill: 'rgba(16,185,129,0.10)',
  dotFill: '#34d399',
  dotStroke: '#212121',
  dashed: false,
};

const DEFAULT_SECONDARY: RadarDatasetConfig = {
  label: 'Benchmark',
  stroke: 'rgba(255,255,255,0.25)',
  fill: 'rgba(255,255,255,0.04)',
  dotFill: 'rgba(176,176,176,0.8)',
  dashed: true,
};

// ============================================================================
// Geometry helpers
// ============================================================================

function polarToXY(cx: number, cy: number, radius: number, angle: number): [number, number] {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

function buildPolygon(values: number[], cx: number, cy: number, maxRadius: number, startAngle: number): string {
  const n = values.length;
  if (n === 0) return '';
  return values
    .map((v, i) => {
      const angle = startAngle + (2 * Math.PI * i) / n;
      const safe = Number.isFinite(v) ? v : 0;
      const r = (safe / 100) * maxRadius;
      const [x, y] = polarToXY(cx, cy, r, angle);
      return `${x},${y}`;
    })
    .join(' ');
}

// ============================================================================
// Constants
// ============================================================================

const GRID_LEVELS = [0, 25, 50, 75, 100];

// ============================================================================
// ComparisonRadarChart — generic pure SVG radar with hover tooltips
// ============================================================================

export function ComparisonRadarChart({
  data,
  primary: primaryOverride,
  secondary: secondaryOverride,
  size = 340,
  className,
}: ComparisonRadarChartProps) {
  const pri = { ...DEFAULT_PRIMARY, ...primaryOverride };
  const sec = { ...DEFAULT_SECONDARY, ...secondaryOverride };

  const n = data.length;
  if (n < 3) return null;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.40;
  const labelOffset = maxRadius + 20;
  const startAngle = -Math.PI / 2;

  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const angles = useMemo(
    () => Array.from({ length: n }, (_, i) => startAngle + (2 * Math.PI * i) / n),
    [n, startAngle],
  );

  const primaryPolygon = useMemo(
    () => buildPolygon(data.map((d) => d.primary), cx, cy, maxRadius, startAngle),
    [data, cx, cy, maxRadius, startAngle],
  );

  const secondaryPolygon = useMemo(
    () => buildPolygon(data.map((d) => d.secondary), cx, cy, maxRadius, startAngle),
    [data, cx, cy, maxRadius, startAngle],
  );

  const primaryDots = useMemo(
    () => data.map((d, i) => {
      const val = Number.isFinite(d.primary) ? d.primary : 0;
      return polarToXY(cx, cy, (val / 100) * maxRadius, angles[i]);
    }),
    [data, cx, cy, maxRadius, angles],
  );

  const secondaryDots = useMemo(
    () => data.map((d, i) => {
      const val = Number.isFinite(d.secondary) ? d.secondary : 0;
      return polarToXY(cx, cy, (val / 100) * maxRadius, angles[i]);
    }),
    [data, cx, cy, maxRadius, angles],
  );

  const labels = useMemo(
    () =>
      data.map((d, i) => {
        const [x, y] = polarToXY(cx, cy, labelOffset, angles[i]);
        let anchor: 'start' | 'middle' | 'end' = 'middle';
        if (x < cx - 10) anchor = 'end';
        else if (x > cx + 10) anchor = 'start';
        const maxLen = 48;
        const text = d.label.length > maxLen ? d.label.slice(0, maxLen - 1) + '…' : d.label;
        return { x, y, text, anchor, fullLabel: d.label };
      }),
    [data, cx, cy, labelOffset, angles],
  );

  // Handle hover on invisible hit areas at each axis vertex
  function handleDotHover(index: number, event: React.MouseEvent<SVGElement>) {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setTooltipPos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    setHovered(index);
  }

  const pad = 30;
  const viewSize = size + pad * 2;

  return (
    <div ref={containerRef} className={cn('relative flex flex-col items-center', className)}>
      <svg
        width="100%"
        viewBox={`${-pad} ${-pad} ${viewSize} ${viewSize + 20}`}
        className="max-w-full max-h-[400px]"
        role="img"
        aria-label={`Radar chart comparing ${pri.label} to ${sec.label}`}
      >
        {/* ---- Grid rings ---- */}
        {GRID_LEVELS.map((level) => {
          const r = (level / 100) * maxRadius;
          const ring = Array.from({ length: n }, (_, i) => {
            const [x, y] = polarToXY(cx, cy, r, angles[i]);
            return `${x},${y}`;
          }).join(' ');
          return <polygon key={`ring-${level}`} points={ring} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />;
        })}

        {/* ---- Grid level labels ---- */}
        {GRID_LEVELS.filter((l) => l > 0).map((level) => {
          const r = (level / 100) * maxRadius;
          const [, y] = polarToXY(cx, cy, r, startAngle);
          return (
            <text key={`gl-${level}`} x={cx + 6} y={y + 3} fontSize={9} fill="rgba(255,255,255,0.35)" fontFamily="Inter, system-ui, sans-serif">
              {level}
            </text>
          );
        })}

        {/* ---- Axis lines ---- */}
        {angles.map((angle, i) => {
          const [x, y] = polarToXY(cx, cy, maxRadius, angle);
          return <line key={`ax-${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />;
        })}

        {/* ---- Secondary polygon (benchmark — dashed) ---- */}
        <polygon
          points={secondaryPolygon}
          fill={sec.fill}
          stroke={sec.stroke}
          strokeWidth={1.5}
          strokeDasharray={sec.dashed ? '4 3' : undefined}
        />

        {/* ---- Primary polygon (candidate — solid) ---- */}
        <polygon
          points={primaryPolygon}
          fill={pri.fill}
          stroke={pri.stroke}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* ---- Secondary dots ---- */}
        {secondaryDots.map(([x, y], i) => (
          <circle key={`sd-${i}`} cx={x} cy={y} r={3} fill={sec.dotFill} stroke="none" />
        ))}

        {/* ---- Primary dots ---- */}
        {primaryDots.map(([x, y], i) => (
          <circle key={`pd-${i}`} cx={x} cy={y} r={3.5} fill={pri.dotFill} stroke={pri.dotStroke ?? 'none'} strokeWidth={1.5} />
        ))}

        {/* ---- Invisible hit areas for hover (larger radius for easy targeting) ---- */}
        {primaryDots.map(([x, y], i) => (
          <circle
            key={`hit-${i}`}
            cx={x}
            cy={y}
            r={14}
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={(e) => handleDotHover(i, e)}
            onMouseMove={(e) => handleDotHover(i, e)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}

        {/* ---- Axis labels ---- */}
        {labels.map((l, i) => (
          <text
            key={`al-${i}`}
            x={l.x}
            y={l.y}
            textAnchor={l.anchor}
            dominantBaseline="central"
            fontSize={10}
            fill={hovered === i ? 'rgba(255,255,255,1)' : 'rgba(176,176,176,0.9)'}
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight={hovered === i ? 600 : 400}
            className="transition-all duration-150"
            style={{ pointerEvents: 'none' }}
          >
            {hovered === i ? l.fullLabel : l.text}
          </text>
        ))}

        {/* ---- Legend ---- */}
        <g transform={`translate(${cx}, ${size + 6})`}>
          {/* Secondary */}
          <line x1={-70} y1={0} x2={-58} y2={0} stroke={sec.stroke} strokeWidth={1.5} strokeDasharray={sec.dashed ? '4 3' : undefined} />
          <rect x={-54} y={-4} width={8} height={8} rx={1} fill={sec.fill} stroke={sec.stroke} strokeWidth={0.8} />
          <text x={-42} y={1} fontSize={10} fill="rgba(176,176,176,0.9)" dominantBaseline="central" fontFamily="Inter, system-ui, sans-serif">
            {sec.label}
          </text>
          {/* Primary */}
          <line x1={20} y1={0} x2={32} y2={0} stroke={pri.stroke} strokeWidth={2} />
          <rect x={36} y={-4} width={8} height={8} rx={1} fill={pri.fill} stroke={pri.stroke} strokeWidth={0.8} />
          <text x={48} y={1} fontSize={10} fill="rgba(176,176,176,0.9)" dominantBaseline="central" fontFamily="Inter, system-ui, sans-serif">
            {pri.label}
          </text>
        </g>
      </svg>

      {/* ---- HTML tooltip (positioned over SVG) ---- */}
      {hovered !== null && data[hovered] && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 8,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs whitespace-nowrap">
            <div className="font-semibold text-foreground mb-1">{data[hovered].label}</div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: pri.dotFill }} />
              {pri.label}: <span className="font-semibold tabular-nums" style={{ color: pri.stroke }}>{data[hovered].primary}%</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sec.dotFill }} />
              {sec.label}: <span className="font-semibold tabular-nums">{data[hovered].secondary}%</span>
            </div>
            <div className="text-muted-foreground mt-1 pt-1 border-t border-border">
              Gap: <span className="font-semibold tabular-nums" style={{ color: pri.stroke }}>
                {data[hovered].primary - data[hovered].secondary >= 0 ? '+' : ''}
                {data[hovered].primary - data[hovered].secondary}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
