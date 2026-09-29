import * as React from 'react'
import { cn } from '@/lib/utils'

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content to display in the marquee */
  children: React.ReactNode
  /** Direction of the marquee animation */
  direction?: 'left' | 'right'
  /** Speed of the animation: 'slow' | 'normal' | 'fast' */
  speed?: 'slow' | 'normal' | 'fast'
  /** Pause animation on hover */
  pauseOnHover?: boolean
  /** Show neubrutalism border styling */
  bordered?: boolean
  /** Number of times to repeat the content (for seamless loop) */
  repeat?: number
}

/* násobok --marquee-duration (token, default 40s) na jednu stopu; keyframes bk-marquee sú v motion.css */
const speedFactor = {
  slow: 4,
  normal: 2,
  fast: 0.8,
}

const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  (
    {
      className,
      children,
      direction = 'left',
      speed = 'normal',
      pauseOnHover = true,
      bordered = true,
      repeat = 4,
      style,
      ...props
    },
    ref
  ) => {
    // Dve rovnaké stopy s medzerou --bk-marquee-gap medzi sebou aj medzi kópiami; každá sa posunie o
    // -100 % - medzera, takže koniec cyklu sedí presne na začiatku (bez skoku o pol medzery).
    // Smer doprava = animation-direction reverse.
    const animationDirection = direction === 'right' ? 'reverse' : undefined
    const trackStyle = { animationDirection } as React.CSSProperties

    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-(--bk-marquee-gap) overflow-hidden [--bk-marquee-gap:2rem]',
          bordered && 'border-3 border-foreground bg-background',
          pauseOnHover && '[&:hover_.bk-marquee-track]:[animation-play-state:paused] [&:focus-within_.bk-marquee-track]:[animation-play-state:paused]',
          className
        )}
        style={{ '--bk-marquee-speed': speedFactor[speed], ...style } as React.CSSProperties}
        {...props}
      >
        <div
          className="marquee-content bk-marquee-track flex shrink-0 items-center gap-(--bk-marquee-gap) py-3"
          style={trackStyle}
        >
          {Array.from({ length: repeat }).map((_, i) => (
            <React.Fragment key={i}>{children}</React.Fragment>
          ))}
        </div>
        {/* Visual duplicate. `inert` as well as aria-hidden, or anything
            focusable inside it is a tab stop within an aria-hidden subtree
            (axe `aria-hidden-focus`). */}
        <div
          className="marquee-content bk-marquee-track flex shrink-0 items-center gap-(--bk-marquee-gap) py-3"
          style={trackStyle}
          aria-hidden="true"
          inert
        >
          {Array.from({ length: repeat }).map((_, i) => (
            <React.Fragment key={i}>{children}</React.Fragment>
          ))}
        </div>
      </div>
    )
  }
)
Marquee.displayName = 'Marquee'

interface MarqueeItemProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

const MarqueeItem = React.forwardRef<HTMLSpanElement, MarqueeItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 whitespace-nowrap px-4 text-lg font-bold uppercase tracking-wide',
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)
MarqueeItem.displayName = 'MarqueeItem'

interface MarqueeSeparatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Separator character or element */
  children?: React.ReactNode
}

const MarqueeSeparator = React.forwardRef<HTMLSpanElement, MarqueeSeparatorProps>(
  ({ className, children = '/', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('text-2xl font-black text-muted-foreground', className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)
MarqueeSeparator.displayName = 'MarqueeSeparator'

export { Marquee, MarqueeItem, MarqueeSeparator }
