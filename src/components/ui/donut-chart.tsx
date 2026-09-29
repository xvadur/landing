import * as React from 'react'
import { cn } from '@/lib/utils'
import { Pie, PieChart, Cell, Label } from 'recharts'
import { ChartContainer } from './chart'
import { ChartEmpty } from './chart'
import { ChartTooltip, ChartTooltipContent } from './chart'
import type { ChartConfig } from './chart'

export interface DonutChartData {
  name: string
  value: number
  fill?: string
}

export interface DonutChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: DonutChartData[]
  config: ChartConfig
  innerRadius?: string | number
  outerRadius?: string | number
  centerContent?: React.ReactNode
  showLabels?: 'none' | 'inside' | 'outside'
  variant?: 'default' | 'separated'
  showTooltip?: boolean
  animated?: boolean
  emptyState?: React.ReactNode
}

interface DonutLabelProps {
  x?: number
  y?: number
  cx?: number
  cy?: number
  midAngle?: number
  innerRadius?: number
  outerRadius?: number
  percent?: number
  name?: string
  index?: number
  textAnchor?: 'start' | 'middle' | 'end' | 'inherit'
}

const DonutChart = React.forwardRef<HTMLDivElement, DonutChartProps>(
  (
    {
      data,
      config,
      innerRadius = '60%',
      outerRadius = '80%',
      centerContent,
      showLabels = 'none',
      variant = 'default',
      showTooltip = true,
      animated = true,
      emptyState,
      className,
      ...props
    },
    ref
  ) => {
    if (!data || data.length === 0) {
      return <ChartEmpty ref={ref} message={emptyState} className={className} {...props} />
    }

    const paddingAngle = variant === 'separated' ? 4 : 0

    return (
      <ChartContainer
        ref={ref}
        config={config}
        className={cn('aspect-square max-h-[300px]', className)}
        {...props}
      >
        <PieChart>
          {showTooltip && (
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
          )}
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            strokeWidth={3}
            stroke="hsl(var(--foreground))"
            isAnimationActive={animated}
            animationDuration={400}
            label={
              showLabels === 'outside'
                ? (p: DonutLabelProps) => (
                    <text x={p.x} y={p.y} textAnchor={p.textAnchor} dominantBaseline="central" fill="hsl(var(--foreground))" className="text-xs font-bold">
                      {`${p.name ?? ''}: ${((p.percent ?? 0) * 100).toFixed(0)} %`}
                    </text>
                  )
                : showLabels === 'inside'
                ? (p: DonutLabelProps) => {
                    // v strede prstenca; text ink, na tmavom výseku papier (predtým farba výseku = nečitateľné)
                    const r = ((p.innerRadius ?? 0) + (p.outerRadius ?? 0)) / 2
                    const a = (-(p.midAngle ?? 0) * Math.PI) / 180
                    const slice = data[p.index ?? 0]?.fill || `hsl(var(--chart-${((p.index ?? 0) % 5) + 1}))`
                    const dark = /--(primary|foreground|destructive|chart-1|chart-3|color-ink|color-stamp)\)/.test(slice)
                    return (
                      <text
                        x={(p.cx ?? 0) + r * Math.cos(a)}
                        y={(p.cy ?? 0) + r * Math.sin(a)}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={dark ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))'}
                        className="text-xs font-bold"
                      >
                        {`${((p.percent ?? 0) * 100).toFixed(0)} %`}
                      </text>
                    )
                  }
                : false
            }
            labelLine={showLabels === 'outside'}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill || `hsl(var(--chart-${(index % 5) + 1}))`}
              />
            ))}
            {centerContent && (
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    const pieView = viewBox as { cx: number; cy: number; innerRadius?: number; outerRadius?: number }
                    const ir = pieView.innerRadius ?? (typeof innerRadius === 'number' ? innerRadius : 60)
                    const fwHalf = Math.max(40, ir * 0.85)
                    const fhHalf = Math.max(25, ir * 0.55)
                    return (
                      <foreignObject
                        x={(pieView.cx || 0) - fwHalf}
                        y={(pieView.cy || 0) - fhHalf}
                        width={fwHalf * 2}
                        height={fhHalf * 2}
                      >
                        <div className="flex h-full w-full items-center justify-center">
                          {centerContent}
                        </div>
                      </foreignObject>
                    )
                  }
                  return null
                }}
              />
            )}
          </Pie>
        </PieChart>
      </ChartContainer>
    )
  }
)
DonutChart.displayName = 'DonutChart'

// Helper component for common center content pattern
export interface DonutChartCenterProps {
  value: string | number
  label?: string
  className?: string
}

const DonutChartCenter = React.forwardRef<HTMLDivElement, DonutChartCenterProps>(
  ({ value, label, className }, ref) => {
    return (
      <div ref={ref} className={cn('text-center', className)}>
        <div className="text-2xl font-black">{value}</div>
        {label && (
          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
        )}
      </div>
    )
  }
)
DonutChartCenter.displayName = 'DonutChartCenter'

export { DonutChart, DonutChartCenter }
