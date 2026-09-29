import * as React from 'react'
import * as RechartsPrimitive from 'recharts'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn, sanitizeCssValue } from '@/lib/utils'

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const

// ---------------------------------------------------------------------------
// Chart annotation vocabulary (shared, unified across React/Recharts and
// Vue/echarts — identical shape so the same annotation objects author in both).
// ---------------------------------------------------------------------------

export interface ChartReferenceLineSpec {
  axis: 'x' | 'y'
  value: number | string
  label?: string
  color?: string
  dash?: boolean
}

export interface ChartCalloutSpec {
  x: number | string
  y: number
  text: string
  placement?: 'top' | 'right' | 'bottom' | 'left'
}

export interface ChartArrowSpec {
  from: { x: number | string; y: number }
  to: { x: number | string; y: number }
  label?: string
}

export type ChartAnnotation =
  | ({ kind: 'referenceLine' } & ChartReferenceLineSpec)
  | ({ kind: 'callout' } & ChartCalloutSpec)
  | ({ kind: 'arrow' } & ChartArrowSpec)

// Neubrutalism color palettes for charts
export const CHART_PALETTES = {
  // Iba tokeny (V5.3): ink, žltá, stamp, biela, sivá. Hot (accent) nie je séria — patrí CTA a X.
  // `vibrant` a `pastel` ostávajú kvôli API, ale mapujú sa na tokeny (žiadne pastely ani pevné HSL mimo tokenov).
  bold: [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--destructive))',
    'hsl(var(--info))',
    'hsl(var(--chart-5))',
    'hsl(var(--muted))',
  ],
  vibrant: [
    'hsl(var(--destructive))',
    'hsl(var(--secondary))',
    'hsl(var(--primary))',
    'hsl(var(--info))',
    'hsl(var(--chart-5))',
    'hsl(var(--muted))',
  ],
  pastel: [
    'hsl(var(--secondary))',
    'hsl(var(--info))',
    'hsl(var(--muted))',
    'hsl(var(--secondary) / 0.5)',
    'hsl(var(--chart-5) / 0.5)',
    'hsl(var(--background))',
  ],
  monochrome: [
    'hsl(var(--foreground))',
    'hsl(var(--foreground) / 0.7)',
    'hsl(var(--foreground) / 0.5)',
    'hsl(var(--foreground) / 0.35)',
    'hsl(var(--foreground) / 0.2)',
    'hsl(var(--foreground) / 0.1)',
  ],
} as const

export type ChartPalette = keyof typeof CHART_PALETTES

// Helper to get colors from a palette
export function getChartColor(palette: ChartPalette, index: number): string {
  const colors = CHART_PALETTES[palette]
  return colors[index % colors.length]
}

// Generate ChartConfig from palette
export function createChartConfig(
  keys: string[],
  labels: string[],
  palette: ChartPalette = 'bold'
): ChartConfig {
  const config: ChartConfig = {}
  keys.forEach((key, index) => {
    config[key] = {
      label: labels[index] || key,
      color: getChartColor(palette, index),
    }
  })
  return config
}

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }

  return context
}

// Plochy (stĺpce, výseky, oblasti) dostanú ink obrys 3 px a plnú výplň. Čiary (Line) si nechávajú farbu zo série
// (config / stroke) a iba hrúbku 3 px — predtým ink prebil každú cestu a farba série sa ignorovala.
const chartContainerVariants = cva(
  'flex aspect-video justify-center overflow-hidden text-xs [&_.recharts-cartesian-axis-tick_text]:fill-foreground [&_.recharts-cartesian-grid_line[stroke="#ccc"]]:stroke-muted-foreground/30 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-muted-foreground [&_.recharts-polar-grid_[stroke="#ccc"]]:stroke-foreground [&_.recharts-reference-line_[stroke="#ccc"]]:stroke-foreground [&_.recharts-dot[stroke="#fff"]]:stroke-transparent [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke="#fff"]]:stroke-foreground [&_.recharts-surface]:outline-hidden [&_path:is(.recharts-rectangle:not(.recharts-tooltip-cursor),.recharts-sector,.recharts-area-area)]:[fill-opacity:1] [&_path:is(.recharts-rectangle:not(.recharts-tooltip-cursor),.recharts-sector,.recharts-area-curve)]:[stroke:hsl(var(--foreground))] [&_path:is(.recharts-rectangle:not(.recharts-tooltip-cursor),.recharts-sector,.recharts-area-curve,.recharts-line-curve)]:[stroke-width:3]',
  {
    variants: {
      variant: {
        default: 'border-3 border-foreground bg-background p-4 shadow-[4px_4px_0px_hsl(var(--shadow-color))]',
        elevated: 'border-3 border-foreground bg-background p-4 shadow-[6px_6px_0px_hsl(var(--shadow-color))] hover:shadow-[8px_8px_0px_hsl(var(--shadow-color))] hover:translate-x-[-2px] hover:translate-y-[-2px] transition',
        flat: 'border-3 border-foreground bg-background p-4',
        filled: 'border-3 border-foreground bg-muted/30 p-4 shadow-[4px_4px_0px_hsl(var(--shadow-color))]',
        minimal: 'bg-background p-4',
        /* hot patrí iba CTA a X → accent kontajner = žltá plocha s ink tieňom */
        accent: 'border-3 border-foreground bg-secondary/20 p-4 shadow-[6px_6px_0px_hsl(var(--shadow-color))]',
        primary: 'border-3 border-foreground bg-primary/10 p-4 shadow-[4px_4px_0px_hsl(var(--primary))]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface ChartContainerProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof chartContainerVariants> {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children']
  /** Render a brutalist placeholder instead of the chart while data is pending. */
  loading?: boolean
  /** Announced while `loading` is true. */
  loadingLabel?: string
  /** Accessible label for the chart (required for screen readers) */
  'aria-label'?: string
  /** ID of element that labels this chart */
  'aria-labelledby'?: string
}

function ChartContainer({
  id,
  className,
  children,
  config,
  variant,
  loading = false,
  loadingLabel,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  ...props
}: ChartContainerProps) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        // While loading there is no image to describe — ChartLoading owns the
        // announcement via role="status", so don't nest it inside a role="img".
        role={loading ? undefined : 'img'}
        aria-label={loading ? undefined : ariaLabel}
        aria-labelledby={loading ? undefined : ariaLabelledby}
        data-slot="chart"
        data-chart={chartId}
        aria-busy={loading || undefined}
        className={cn(chartContainerVariants({ variant }), className)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {loading ? (
          <ChartLoading label={loadingLabel} />
        ) : (
          <RechartsPrimitive.ResponsiveContainer>
            {children}
          </RechartsPrimitive.ResponsiveContainer>
        )}
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, configItem]) => configItem.theme || configItem.color
  )

  if (!colorConfig.length) {
    return null
  }

  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '')

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${safeId}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${sanitizeCssValue(key)}: ${sanitizeCssValue(color)};` : null
  })
  .join('\n')}
}
`
          )
          .join('\n'),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

interface ChartTooltipContentProps extends React.ComponentProps<'div'> {
  active?: boolean
  payload?: Array<{
    name?: string
    value?: number
    dataKey?: string
    color?: string
    payload?: Record<string, unknown>
    fill?: string
  }>
  label?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: 'line' | 'dot' | 'dashed'
  nameKey?: string
  labelKey?: string
  labelFormatter?: (label: unknown, payload: unknown[]) => React.ReactNode
  formatter?: (
    value: unknown,
    name: unknown,
    item: unknown,
    index: number,
    payload: unknown
  ) => React.ReactNode
  labelClassName?: string
  color?: string
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || 'value'}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === 'string'
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn('font-bold uppercase tracking-wide', labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return <div className={cn('font-bold', labelClassName)}>{value}</div>
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== 'dot'

  return (
    <div
      className={cn(
        'grid min-w-[8rem] items-start gap-1.5 border-3 border-foreground bg-background px-2.5 py-1.5 text-xs shadow-[4px_4px_0px_hsl(var(--shadow-color))]',
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || 'value'}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)
          const indicatorColor = color || (item.payload as Record<string, string>)?.fill || item.color

          return (
            <div
              key={item.dataKey || index}
              className={cn(
                'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
                indicator === 'dot' && 'items-center'
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn('shrink-0 border-2 border-foreground', {
                          'h-2.5 w-2.5': indicator === 'dot',
                          'w-1': indicator === 'line',
                          'w-0 border-[1.5px] border-dashed bg-transparent':
                            indicator === 'dashed',
                          'my-0.5': nestLabel && indicator === 'dashed',
                        })}
                        style={{
                          backgroundColor: indicatorColor,
                        }}
                      />
                    )
                  )}
                  <div
                    className={cn(
                      'flex flex-1 justify-between gap-3 leading-none',
                      nestLabel ? 'items-end' : 'items-center'
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value !== undefined && Number.isFinite(Number(item.value)) && (
                      <span className="font-mono font-bold tabular-nums text-foreground">
                        {Number(item.value).toLocaleString('sk-SK')}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

interface ChartLegendContentProps extends React.ComponentProps<'div'> {
  payload?: Array<{
    value?: string
    dataKey?: string
    color?: string
  }>
  verticalAlign?: 'top' | 'bottom'
  hideIcon?: boolean
  nameKey?: string
}

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: ChartLegendContentProps) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-4 font-bold uppercase tracking-wide',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className
      )}
    >
      {payload.map((item, index) => {
        const key = `${nameKey || item.dataKey || 'value'}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            key={item.dataKey ?? item.value ?? index}
            className={cn(
              'flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-foreground'
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-3 w-3 shrink-0 border-2 border-foreground"
                style={{
                  // farba zo série v configu (nie zo stroke: pri radare / plochách s ink obrysom boli všetky štvorčeky čierne)
                  backgroundColor: itemConfig ? `var(--color-${key}, ${item.color})` : item.color,
                }}
              />
            )}
            <span className="text-sm">{itemConfig?.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined
  }

  const payloadPayload =
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === 'string'
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

// ──────────────────────────────────────────────────────────────────
// ChartEmpty — fallback display when a chart receives no data.
// Originally lived in src/components/ui/chart/empty.tsx, merged here so
// that synced chart-X files can do `import { ChartEmpty } from './chart'`
// without needing the split-file structure on the consumer side.
// ──────────────────────────────────────────────────────────────────

export interface ChartEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: React.ReactNode
}

const ChartEmpty = React.forwardRef<HTMLDivElement, ChartEmptyProps>(
  ({ message = 'Žiadne dáta', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(
          'flex min-h-[120px] w-full items-center justify-center border-3 border-dashed border-foreground/40 bg-muted/20 p-6 text-xs font-bold uppercase tracking-wide text-muted-foreground',
          className
        )}
        {...props}
      >
        {message}
      </div>
    )
  }
)
ChartEmpty.displayName = 'ChartEmpty'

// ──────────────────────────────────────────────────────────────────
// ChartLoading — brutalist placeholder while chart data is pending.
// Originally lived in src/components/ui/chart/loading.tsx, merged here for
// the same reason as ChartEmpty above.
// ──────────────────────────────────────────────────────────────────

/** Static silhouette — a chart-shaped placeholder, not real data. */
const BAR_HEIGHTS = ['45%', '70%', '35%', '85%', '55%', '75%', '40%']

export interface ChartLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Announced to screen readers while the chart is pending. */
  label?: string
  /** Number of placeholder bars. Defaults to 7. */
  bars?: number
}

const ChartLoading = React.forwardRef<HTMLDivElement, ChartLoadingProps>(
  ({ label = 'Graf sa načítava', bars = BAR_HEIGHTS.length, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={cn(
          'flex min-h-[120px] w-full items-end justify-center gap-2 p-6',
          className
        )}
        {...props}
      >
        <span className="sr-only">{label}</span>
        {Array.from({ length: bars }, (_, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="bk-skeleton-stamp w-full max-w-10 border-2 border-foreground/20 bg-muted"
            style={{
              height: BAR_HEIGHTS[i % BAR_HEIGHTS.length],
              animationDelay: `${i * 90}ms`,
            }}
          />
        ))}
      </div>
    )
  }
)
ChartLoading.displayName = 'ChartLoading'

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartEmpty,
  ChartLoading,
  chartContainerVariants,
  // Needed to write a custom tooltip/legend against this bundle. The src
  // barrel (src/components/ui/chart/index.ts) exports all of these; omitting
  // them here left installed charts with a strictly smaller API than the docs.
  ChartContext,
  useChart,
  THEMES,
  getPayloadConfigFromPayload,
}
export type { ChartContextProps, ChartTooltipContentProps, ChartLegendContentProps }

/* ---------------------------------------------------------------------------
   Chart annotations (reference lines, callouts, arrows).
   Kept in this bundle so an installed chart has the same annotation API the
   docs describe — previously these shipped nowhere and were unusable.
   --------------------------------------------------------------------------- */

/**
 * Unified chart annotations for Recharts. Recharts only renders its own
 * component types when they are DIRECT children of a chart, so a wrapper
 * component around <RechartsPrimitive.ReferenceLine> would be silently dropped. Instead these are
 * element factories that return real Recharts elements; drop the result into a
 * Cartesian chart's children via {renderChartAnnotations([...])}.
 *
 * Reference lines require a Cartesian chart (Area/Bar/Line/Composed). Callouts
 * and arrows are data-anchored via RechartsPrimitive.ReferenceDot and also work only where those
 * coordinates exist.
 */

const FOREGROUND = 'hsl(var(--foreground))'
const DASH = '6 4'

// Brutalist bordered label box rendered inside a RechartsPrimitive.ReferenceDot label slot.
// Recharts passes the resolved pixel viewBox as `viewBox`.
function CalloutLabel({
  viewBox,
  text,
  placement = 'top',
}: {
  viewBox?: { x?: number; y?: number }
  text: string
  placement?: ChartCalloutSpec['placement']
}) {
  const cx = viewBox?.x ?? 0
  const cy = viewBox?.y ?? 0
  const padX = 8
  const width = text.length * 7 + padX * 2
  const height = 22
  const offset = 14
  const dx = placement === 'left' ? -width - offset : placement === 'right' ? offset : -width / 2
  const dy = placement === 'bottom' ? offset : -height - offset
  return (
    <g>
      <line x1={cx} y1={cy} x2={cx + dx + width / 2} y2={cy + dy + height} stroke={FOREGROUND} strokeWidth={2} />
      <rect
        x={cx + dx}
        y={cy + dy}
        width={width}
        height={height}
        fill="hsl(var(--background))"
        stroke={FOREGROUND}
        strokeWidth={2}
      />
      <text
        x={cx + dx + width / 2}
        y={cy + dy + height / 2 + 4}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={FOREGROUND}
        style={{ textTransform: 'uppercase' }}
      >
        {text}
      </text>
    </g>
  )
}

export function referenceLineElement(
  spec: ChartReferenceLineSpec,
  key?: React.Key
): React.ReactElement<React.ComponentProps<typeof RechartsPrimitive.ReferenceLine>> {
  const axisProp = spec.axis === 'x' ? { x: spec.value } : { y: spec.value }
  return (
    <RechartsPrimitive.ReferenceLine
      key={key}
      {...axisProp}
      stroke={spec.color ?? FOREGROUND}
      strokeWidth={3}
      strokeDasharray={spec.dash ? DASH : undefined}
      label={
        spec.label
          ? { value: spec.label, position: 'insideTopRight', fontWeight: 700, fontSize: 11 }
          : undefined
      }
      ifOverflow="extendDomain"
    />
  )
}

export function calloutElement(
  spec: ChartCalloutSpec,
  key?: React.Key
): React.ReactElement<React.ComponentProps<typeof RechartsPrimitive.ReferenceDot>> {
  return (
    <RechartsPrimitive.ReferenceDot
      key={key}
      x={spec.x}
      y={spec.y}
      r={0}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      label={(props: any) => (
        <CalloutLabel viewBox={props?.viewBox} text={spec.text} placement={spec.placement} />
      )}
    />
  )
}

export function arrowElements(spec: ChartArrowSpec, key?: React.Key): React.ReactElement[] {
  const k = key ?? 'arrow'
  return [
    <RechartsPrimitive.ReferenceLine
      key={`${k}-line`}
      segment={[
        { x: spec.from.x, y: spec.from.y },
        { x: spec.to.x, y: spec.to.y },
      ]}
      stroke={FOREGROUND}
      strokeWidth={3}
      label={
        spec.label
          ? { value: spec.label, position: 'center', fontWeight: 700, fontSize: 11 }
          : undefined
      }
      ifOverflow="extendDomain"
    />,
    // Endpoint marker approximating an arrowhead.
    <RechartsPrimitive.ReferenceDot
      key={`${k}-head`}
      x={spec.to.x}
      y={spec.to.y}
      r={5}
      fill={FOREGROUND}
      stroke={FOREGROUND}
    />,
  ]
}

export function renderChartAnnotations(annotations: ChartAnnotation[]): React.ReactElement[] {
  const out: React.ReactElement[] = []
  annotations.forEach((a, i) => {
    if (a.kind === 'referenceLine') out.push(referenceLineElement(a, `ann-${i}`))
    else if (a.kind === 'callout') out.push(calloutElement(a, `ann-${i}`))
    else out.push(...arrowElements(a, `ann-${i}`))
  })
  return out
}
