import * as React from 'react'
import { Toaster as Sonner } from 'sonner'
import { cn } from '@/lib/utils'

type ToasterProps = React.ComponentProps<typeof Sonner>
type ToastClassNames = NonNullable<NonNullable<ToasterProps['toastOptions']>['classNames']>

/* Sonner vkladá vlastné CSS mimo @layer, takže Tailwind 4 utility (v @layer utilities) by prehrali.
   Preto `unstyled: true` a triedy priamo z tokenov (bez group-[.toaster]:…). Web je light only → žiadny useTheme,
   Toaster funguje aj bez ThemeProvider. success = žltá, warning = biela s alarmovým okrajom, error = stamp. */
const BOLDKIT_CLASSNAMES: ToastClassNames = {
  toast:
    'relative flex w-[min(calc(100vw-2rem),356px)] items-center gap-3 border-3 border-foreground p-4 font-sans shadow-[4px_4px_0px_hsl(var(--shadow-color))]',
  content: 'flex flex-1 flex-col gap-0.5',
  title: 'font-display text-base font-extrabold uppercase tracking-wide',
  description: 'text-sm font-medium opacity-80',
  icon: 'shrink-0',
  default: 'bg-card text-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-card text-foreground border-l-[12px] border-l-destructive',
  error: 'bg-destructive text-destructive-foreground',
  info: 'bg-background text-foreground',
  loading: 'bg-background text-foreground',
  actionButton:
    'min-h-11 shrink-0 border-2 border-foreground bg-primary px-3 text-xs font-bold uppercase text-primary-foreground',
  cancelButton:
    'min-h-11 shrink-0 border-2 border-foreground bg-background px-3 text-xs font-bold uppercase text-foreground',
  closeButton:
    'absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center border-2 border-foreground bg-card text-foreground before:absolute before:-inset-2 before:content-[""]',
}

function mergeClassNames(extra?: ToastClassNames): ToastClassNames {
  if (!extra) return BOLDKIT_CLASSNAMES
  const out: ToastClassNames = { ...BOLDKIT_CLASSNAMES }
  for (const key of Object.keys(extra) as (keyof ToastClassNames)[]) {
    out[key] = cn(BOLDKIT_CLASSNAMES[key], extra[key])
  }
  return out
}

const Toaster = ({ toastOptions, theme = 'light', ...props }: ToasterProps) => (
  <Sonner
    theme={theme}
    className="toaster group"
    {...props}
    toastOptions={{
      ...toastOptions,
      unstyled: toastOptions?.unstyled ?? true,
      classNames: mergeClassNames(toastOptions?.classNames),
    }}
  />
)

export { Toaster }
