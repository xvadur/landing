import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const gaugeChartVariants = cva(
  'relative flex items-center justify-center',
  {
    variants: {
      size: {
        sm: '',
        md: '',
        lg: '',
      },
      variant: {
        semicircle: '',
        full: '',
        meter: '',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'semicircle',
    },
  }
)

export interface GaugeChartZone {
  /** Lower bound, in the same units as `value` (i.e. between `min` and `max`). */
  from: number
  /** Upper bound, in the same units as `value`. */
  to: number
  color: string
  label?: string
}

export interface GaugeChartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof gaugeChartVariants> {
  value: number
  min?: number
  max?: number
  zones?: GaugeChartZone[]
  label?: string
  valueFormatter?: (value: number) => string
  showTicks?: boolean
  animated?: boolean
}

const DEFAULT_ZONES: GaugeChartZone[] = [
  { from: 0, to: 33, color: 'hsl(var(--destructive))', label: 'Nízke' },
  { from: 33, to: 66, color: 'hsl(var(--warning))', label: 'Stredné' },
  { from: 66, to: 100, color: 'hsl(var(--primary))', label: 'Vysoké' },
]

/**
 * Variant arc configs (angles in SVG space: 0°=east, increasing = clockwise, y points down):
 *   semicircle — 180° sweep, arc from left (180°) over the top (270°) to right (360°), open at bottom
 *   full       — 360° sweep (full ring) starting at the top
 *   meter      — same top semicircle as semicircle but with denser tick marks (every 10%)
 */
const VARIANT_ARC_CONFIG = {
  semicircle: { arcStartDeg: 180, sweepDeg: 180 },
  full:       { arcStartDeg: -90, sweepDeg: 360 }, // full 360° sweep
  meter:      { arcStartDeg: 180, sweepDeg: 180 },
} as const

type Variant = 'semicircle' | 'full' | 'meter'

const GaugeChart = React.forwardRef<HTMLDivElement, GaugeChartProps>(
  (
    {
      value,
      min = 0,
      max = 100,
      zones = DEFAULT_ZONES,
      label,
      valueFormatter = (v) => `${v}`,
      showTicks = true,
      animated = true,
      size,
      variant,
      className,
      ...props
    },
    ref
  ) => {
    const resolvedVariant: Variant = (variant as Variant) || 'semicircle'
    const arcConfig = VARIANT_ARC_CONFIG[resolvedVariant]

    const normalizedValue = Math.max(min, Math.min(max, value))
    const toPercent = (v: number) => (max === min ? 0 : ((v - min) / (max - min)) * 100)
    const percentage = toPercent(normalizedValue)
    // Zone bounds are in data units, so they need the same mapping as `value`.
    // They used to be fed to a 0–100 dial scale raw, so with min=0 max=200 a
    // zone of {from: 0, to: 100} painted the first *half of the dial* instead
    // of the first half of the range, and picked the wrong current colour.
    const zonesPct = zones.map((z) => ({
      ...z,
      fromPct: toPercent(z.from),
      toPct: toPercent(z.to),
    }))

    // SVG dimensions — full variant needs a taller canvas to show the bottom arc
    const sizeConfig = {
      sm: {
        width: 140,
        height: resolvedVariant === 'full' ? 140 : 90,
        radius: 45,
        strokeWidth: 10,
        fontSize: 14,
        labelSize: 9,
      },
      md: {
        width: 180,
        height: resolvedVariant === 'full' ? 180 : 115,
        radius: 58,
        strokeWidth: 12,
        fontSize: 18,
        labelSize: 11,
      },
      lg: {
        width: 240,
        height: resolvedVariant === 'full' ? 240 : 150,
        radius: 76,
        strokeWidth: 14,
        fontSize: 22,
        labelSize: 13,
      },
    }

    const currentSize = size || 'md'
    const config = sizeConfig[currentSize]

    // For full variant, center is the geometric center of the SVG
    // For semicircle/meter, center is pushed up so the arc+needle fits in the half-height canvas
    const centerX = config.width / 2
    const centerY =
      resolvedVariant === 'full'
        ? config.height / 2
        : config.radius + config.strokeWidth + 5

    const isMeter = resolvedVariant === 'meter'

    // Hodnota a popis ležia pod čapom ručičky (predtým centerY + 20 → prekryv s čapom a orezanie pri sm).
    // full: v dolnej polovici kruhu, semicircle/meter: pod stredom; výška SVG sa dopočíta.
    const valueY =
      resolvedVariant === 'full'
        ? centerY + config.radius * 0.5
        : centerY + 12 + config.fontSize
    const labelY = valueY + config.labelSize + 4
    const minMaxY = centerY + config.strokeWidth / 2 + config.labelSize + 4
    const svgHeight =
      resolvedVariant === 'full'
        ? config.height
        : Math.ceil(Math.max(label ? labelY : valueY, minMaxY) + 6)

    const needleLength = config.radius - 8

    // Convert a percentage (0–100) along the arc to an SVG angle in radians
    const percentToAngleRad = (pct: number) => {
      const deg = arcConfig.arcStartDeg + (pct * arcConfig.sweepDeg) / 100
      return deg * (Math.PI / 180)
    }

    // Create an SVG arc path segment between two percentages on the gauge track
    const createArcPath = (startPercent: number, endPercent: number, radius: number) => {
      const startAngle = percentToAngleRad(startPercent)
      const endAngle = percentToAngleRad(endPercent)

      const startX = centerX + radius * Math.cos(startAngle)
      const startY = centerY + radius * Math.sin(startAngle)

      // A full 360° arc is degenerate in SVG (start === end point); split into two half-arcs
      if (resolvedVariant === 'full' && Math.abs(endPercent - startPercent) >= 100) {
        const midAngle = startAngle + Math.PI
        const midX = centerX + radius * Math.cos(midAngle)
        const midY = centerY + radius * Math.sin(midAngle)
        return `M ${startX} ${startY} A ${radius} ${radius} 0 1 1 ${midX} ${midY} A ${radius} ${radius} 0 1 1 ${startX} ${startY}`
      }

      const endX = centerX + radius * Math.cos(endAngle)
      const endY = centerY + radius * Math.sin(endAngle)

      const sweepDelta = endPercent - startPercent
      const sweepAngle = (sweepDelta / 100) * arcConfig.sweepDeg
      const largeArcFlag = sweepAngle > 180 ? 1 : 0

      return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`
    }

    // Needle angle: percentage along the sweep, converted to an absolute SVG rotation
    // The needle points upward (the line is drawn rightward then rotated)
    const needleAngle = arcConfig.arcStartDeg + (percentage * arcConfig.sweepDeg) / 100

    const currentZoneColor =
      zonesPct.find((z) => percentage >= z.fromPct && percentage <= z.toPct)?.color ||
      'hsl(var(--primary))'

    // Tick marks: semicircle/full use 5 ticks at 0/25/50/75/100 %
    // meter variant gets denser ticks at every 10%
    const tickPercentages =
      resolvedVariant === 'meter'
        ? [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
        : [0, 25, 50, 75, 100]

    return (
      <div
        ref={ref}
        // A gauge is exactly what role="meter" describes, and every value it
        // needs is already computed here. Without this the chart shipped as an
        // unlabelled decorative blob with no value exposed to assistive tech.
        role="meter"
        aria-valuenow={normalizedValue}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={valueFormatter(normalizedValue)}
        aria-label={label ?? 'Budík'}
        className={cn(gaugeChartVariants({ size, variant }), className)}
        style={{ maxWidth: config.width }}
        {...props}
      >
        <svg
          className="h-auto w-full"
          viewBox={`0 0 ${config.width} ${svgHeight}`}
        >
          {/* Background track */}
          <path
            d={createArcPath(0, 100, config.radius)}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
          />

          {/* Zone arcs */}
          {zonesPct.map((zone) => (
            <path
              key={`${zone.from}-${zone.to}-${zone.color}`}
              d={createArcPath(zone.fromPct, zone.toPct, config.radius)}
              fill="none"
              stroke={zone.color}
              strokeWidth={config.strokeWidth}
              strokeLinecap="butt"
              className="transition duration-300"
            />
          ))}

          {/* Outer border */}
          <path
            d={createArcPath(0, 100, config.radius + config.strokeWidth / 2 + 2)}
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Inner border */}
          <path
            d={createArcPath(0, 100, config.radius - config.strokeWidth / 2 - 2)}
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Tick marks */}
          {showTicks &&
            tickPercentages.map((tick) => {
              const angle = percentToAngleRad(tick)
              const innerR = config.radius - config.strokeWidth / 2 - 6
              const outerR = config.radius + config.strokeWidth / 2 + 6
              const x1 = centerX + innerR * Math.cos(angle)
              const y1 = centerY + innerR * Math.sin(angle)
              const x2 = centerX + outerR * Math.cos(angle)
              const y2 = centerY + outerR * Math.sin(angle)

              return (
                <line
                  key={tick}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />
              )
            })}

          {/* Meter variant: filled progress arc using stroke-dasharray animation */}
          {isMeter && (
            <path
              d={createArcPath(0, 100, config.radius)}
              fill="none"
              stroke={currentZoneColor}
              strokeWidth={config.strokeWidth + 4}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${percentage} 100`}
              style={{ transition: animated ? 'stroke-dasharray 0.5s ease-out' : 'none' }}
            />
          )}

          {/* Needle (hidden for meter variant) */}
          {!isMeter && (
            <g
              style={{
                transform: `rotate(${needleAngle}deg)`,
                transformOrigin: `${centerX}px ${centerY}px`,
                transition: animated ? 'transform 0.5s ease-out' : 'none',
                // tvrdý tieň bez rozmazania (zákon: tiene bez blur)
                filter: 'drop-shadow(2px 2px 0 hsl(var(--shadow-color)))',
              }}
            >
              {/* Needle body */}
              <line
                x1={centerX}
                y1={centerY}
                x2={centerX + needleLength}
                y2={centerY}
                stroke="hsl(var(--foreground))"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Needle tip */}
              <circle
                cx={centerX + needleLength}
                cy={centerY}
                r="3"
                fill="hsl(var(--primary))"
                stroke="hsl(var(--foreground))"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* Center pivot (hidden for meter variant) */}
          {!isMeter && (
            <>
              <circle
                cx={centerX}
                cy={centerY}
                r="6"
                fill="hsl(var(--foreground))"
              />
              <circle
                cx={centerX}
                cy={centerY}
                r="3"
                fill="hsl(var(--background))"
              />
            </>
          )}

          {/* Value display */}
          <text
            x={centerX}
            y={valueY}
            textAnchor="middle"
            fill="hsl(var(--foreground))"
            fontWeight="900"
            fontSize={config.fontSize}
            fontFamily="ui-monospace, monospace"
          >
            {valueFormatter(normalizedValue)}
          </text>

          {/* Label */}
          {label && (
            <text
              x={centerX}
              y={labelY}
              textAnchor="middle"
              fill="hsl(var(--muted-foreground))"
              fontWeight="700"
              fontSize={config.labelSize}
              style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {label}
            </text>
          )}

          {/* Min/Max labels — only for semicircle and meter (full variant has no clear endpoints) */}
          {resolvedVariant !== 'full' && (
            <>
              <text
                x={centerX - config.radius}
                y={minMaxY}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontWeight="600"
                fontSize={config.labelSize}
              >
                {min}
              </text>
              <text
                x={centerX + config.radius}
                y={minMaxY}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontWeight="600"
                fontSize={config.labelSize}
              >
                {max}
              </text>
            </>
          )}
        </svg>
      </div>
    )
  }
)
GaugeChart.displayName = 'GaugeChart'

export { GaugeChart, gaugeChartVariants }
