import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
} from 'recharts'

export interface SparklineProps extends React.HTMLAttributes<HTMLSpanElement> {
  data: number[]
  type?: 'line' | 'area' | 'bar'
  color?: string
  height?: number
  width?: number | string
  showEndDot?: boolean
  strokeWidth?: number
  trend?: 'up' | 'down' | 'neutral'
  animated?: boolean
  /** Accessible name. A sparkline conveys a trend, which is invisible to AT
   *  without one; defaults to a summary of the series. */
  ariaLabel?: string
}

const Sparkline = React.forwardRef<HTMLSpanElement, SparklineProps>(
  (
    {
      data,
      type = 'line',
      color,
      height = 32,
      width = '100%',
      showEndDot = false,
      strokeWidth = 2,
      trend,
      animated = true,
      ariaLabel,
      className,
      ...props
    },
    ref
  ) => {
    // `aria-label` on a plain <div> is ignored by most AT — it needs a role.
    // Default the name to something useful rather than leaving the trend
    // entirely invisible.
    const accessibleLabel =
      ariaLabel ??
      (data && data.length
        ? `Mini graf, ${data.length} bodov, od ${data[0].toLocaleString('sk-SK')} po ${data[data.length - 1].toLocaleString('sk-SK')}`
        : 'Mini graf bez dát')
    // Koreň je <span> (dá sa vložiť do vety v <p>). Recharts kreslí <div>, preto sa graf vykreslí až po hydratácii:
    // statické HTML má iba prázdny span s rozmermi, parser tak nerozbije <p> a hydratácia sedí.
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => setMounted(true), [])
    // Unique ID per instance prevents gradient collision when multiple sparklines render on the same page
    const uid = React.useId().replace(/:/g, '')

    // Determine color based on trend or explicit color.
    // Must run before the empty-data early return — hooks cannot be called
    // conditionally, otherwise an empty→populated data transition crashes with
    // "Rendered more hooks than during the previous render".
    const resolvedColor = React.useMemo(() => {
      if (color) return color
      // up = ink, down = alarmová červená, neutral = sivá (žltá čiara na bielom bola nečitateľná)
      if (trend === 'up') return 'hsl(var(--foreground))'
      if (trend === 'down') return 'hsl(var(--destructive))'
      return 'hsl(var(--muted-foreground))'
    }, [color, trend])

    if (!data || data.length === 0) {
      return (
        <span
          ref={ref}
          role="img"
          aria-label={ariaLabel ?? 'Mini graf bez dát'}
          className={cn('inline-block border-b-2 border-dashed border-foreground/30', className)}
          style={{ width, height }}
          {...props}
        />
      )
    }

    // Convert data array to format recharts expects
    const chartData = data.map((value, index) => ({ value, index }))

    const strokeColor = 'hsl(var(--foreground))'
    const lastIndex = data.length - 1

    /**
     * Custom dot renderer that only draws a circle on the final data point.
     * Used directly on the primary series — no duplicate series needed.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const endDotRenderer = (dotProps: any) => {
      const { cx, cy, index } = dotProps
      if (!showEndDot || index !== lastIndex) return null
      return (
        <circle
          key="end-dot"
          cx={cx}
          cy={cy}
          r={4}
          fill={resolvedColor}
          stroke={strokeColor}
          strokeWidth={2}
        />
      )
    }

    if (type === 'bar') {
      return (
        <span
          ref={ref}
          role="img"
          aria-label={accessibleLabel}
          className={cn('inline-block align-middle', className)}
          style={{ width, height }}
          {...props}
        >
          {mounted && (<ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Bar
                dataKey="value"
                fill={resolvedColor}
                stroke={strokeColor}
                strokeWidth={1}
                isAnimationActive={animated}
                animationDuration={300}
              />
            </BarChart>
          </ResponsiveContainer>)}
        </span>
      )
    }

    if (type === 'area') {
      return (
        <span
          ref={ref}
          role="img"
          aria-label={accessibleLabel}
          className={cn('inline-block align-middle', className)}
          style={{ width, height }}
          {...props}
        >
          {mounted && (<ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`sparkline-gradient-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={resolvedColor} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={resolvedColor} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={resolvedColor}
                strokeWidth={strokeWidth}
                fill={`url(#sparkline-gradient-${uid})`}
                isAnimationActive={animated}
                animationDuration={300}
                dot={endDotRenderer}
                activeDot={false}
              />
            </AreaChart>
          </ResponsiveContainer>)}
        </span>
      )
    }

    // Default: line
    return (
      <span
        ref={ref}
        role="img"
        aria-label={accessibleLabel}
        className={cn('inline-block align-middle', className)}
        style={{ width, height }}
        {...props}
      >
        {mounted && (<ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={resolvedColor}
              strokeWidth={strokeWidth}
              dot={endDotRenderer}
              activeDot={false}
              isAnimationActive={animated}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>)}
      </span>
    )
  }
)
Sparkline.displayName = 'Sparkline'

export { Sparkline }
