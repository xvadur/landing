import * as React from 'react'
import { Download, Image, FileText, Maximize } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  downloadCSV,
  exportPNG,
  exportSVG,
  toggleFullscreen,
} from '@/lib/chart-export'

export interface ChartToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Rows fed to the chart — enables the CSV export button when provided. */
  data?: Array<Record<string, unknown>>
  /** Base filename (no extension) for exports. Default 'chart'. */
  filename?: string
  /** Show the PNG export button. Default true. */
  png?: boolean
  /** Show the SVG export button. Default true (no-ops for canvas engines). */
  svg?: boolean
  /** Show the fullscreen toggle. Default true. */
  fullscreen?: boolean
}

/**
 * Wraps a chart and overlays a brutalist export toolbar (PNG / SVG / CSV /
 * fullscreen). Framework-agnostic under the hood — works with any chart that
 * renders an <svg> (Recharts) or <canvas> into the wrapped container.
 *
 *   <ChartToolbar data={rows} filename="sales">
 *     <ChartContainer config={config}>…</ChartContainer>
 *   </ChartToolbar>
 */
export const ChartToolbar = React.forwardRef<HTMLDivElement, ChartToolbarProps>(
  (
    { data, filename = 'chart', png = true, svg = true, fullscreen = true, className, children, ...props },
    ref
  ) => {
    const innerRef = React.useRef<HTMLDivElement | null>(null)
    React.useImperativeHandle(ref, () => innerRef.current as HTMLDivElement)

    const withContainer = (fn: (el: HTMLElement) => void) => () => {
      const el = innerRef.current
      if (el) fn(el)
    }

    return (
      <div ref={innerRef} className={cn('relative', className)} {...props}>
        <div data-chart-export-controls className="absolute right-2 top-2 z-10 flex gap-2">
          {png && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="relative h-9 w-9 before:absolute before:-inset-[7px] before:content-['']"
              aria-label="Stiahnuť graf ako PNG"
              title="PNG"
              onClick={withContainer((el) => void exportPNG(el, `${filename}.png`))}
            >
              <Image />
            </Button>
          )}
          {svg && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="relative h-9 w-9 before:absolute before:-inset-[7px] before:content-['']"
              aria-label="Stiahnuť graf ako SVG"
              title="SVG"
              onClick={withContainer((el) => exportSVG(el, `${filename}.svg`))}
            >
              <Download />
            </Button>
          )}
          {data && data.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="relative h-9 w-9 before:absolute before:-inset-[7px] before:content-['']"
              aria-label="Stiahnuť dáta grafu ako CSV"
              title="CSV"
              onClick={() => downloadCSV(data, `${filename}.csv`)}
            >
              <FileText />
            </Button>
          )}
          {fullscreen && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="relative h-9 w-9 before:absolute before:-inset-[7px] before:content-['']"
              aria-label="Celá obrazovka"
              title="Celá obrazovka"
              onClick={withContainer(toggleFullscreen)}
            >
              <Maximize />
            </Button>
          )}
        </div>
        {children}
      </div>
    )
  }
)
ChartToolbar.displayName = 'ChartToolbar'
