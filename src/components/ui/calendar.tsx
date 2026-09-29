import * as React from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'
import { DayPicker, type ChevronProps } from 'react-day-picker'
import { sk } from 'react-day-picker/locale'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/** Šípka pre navigáciu (vľavo / vpravo) aj pre dropdown mesiacov a rokov (hore / dole). */
function CalendarChevron({ orientation, className }: ChevronProps) {
  const Icon =
    orientation === 'left'
      ? ChevronLeft
      : orientation === 'right'
        ? ChevronRight
        : orientation === 'up'
          ? ChevronUp
          : ChevronDown
  return <Icon className={cn('h-4 w-4 stroke-[3]', className)} />
}

/* Predvolene slovensky (týždeň od pondelka). `locale` a všetky ostatné props DayPickera sa dajú prepísať.
   Dnes = žltá, stred rozsahu = žltá (hot patrí iba CTA a X). Deň 44 px (dotyk). */
function Calendar({
  className,
  classNames,
  components,
  showOutsideDays = true,
  locale = sk,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={locale}
      className={cn(
        'p-3 border-3 border-foreground bg-background shadow-[4px_4px_0px_hsl(var(--shadow-color))]',
        className
      )}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'flex flex-col gap-4',
        month_caption: 'flex justify-center pt-1 relative items-center min-h-9 px-11',
        caption_label: 'flex items-center gap-1 text-sm font-bold uppercase tracking-wide',
        dropdowns: 'flex items-center gap-2',
        dropdown_root:
          'relative inline-flex min-h-9 items-center border-2 border-foreground bg-background px-2 focus-within:ring-2 focus-within:ring-ring',
        dropdown: 'absolute inset-0 w-full cursor-pointer opacity-0',
        nav: 'flex items-center gap-1',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-9 w-9 bg-transparent p-0 absolute left-0 top-0 z-10 hover:translate-x-0 hover:translate-y-0 hover:scale-110 before:absolute before:-inset-[4px] before:content-[""]'
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-9 w-9 bg-transparent p-0 absolute right-0 top-0 z-10 hover:translate-x-0 hover:translate-y-0 hover:scale-110 before:absolute before:-inset-[4px] before:content-[""]'
        ),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday: 'text-muted-foreground w-11 font-bold text-[0.8rem] uppercase',
        week: 'flex w-full mt-1',
        week_number: 'w-11 text-center text-xs text-muted-foreground',
        day: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-11 w-11 p-0 font-medium border-0 normal-case aria-selected:opacity-100'
        ),
        selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground border-2 border-foreground',
        today:
          'bg-secondary text-secondary-foreground border-2 border-foreground aria-selected:bg-primary aria-selected:text-primary-foreground',
        outside: 'text-muted-foreground opacity-50 aria-selected:opacity-30',
        disabled: 'text-muted-foreground opacity-50',
        range_middle: 'aria-selected:bg-secondary aria-selected:text-secondary-foreground',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: CalendarChevron,
        ...components,
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
