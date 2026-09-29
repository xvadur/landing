import * as React from 'react'
import { cn } from '@/lib/utils'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface TimePickerProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Button>, 'onChange' | 'value' | 'defaultValue'> {
  value?: Date
  defaultValue?: Date
  onChange?: (date: Date | undefined) => void
  format?: '12h' | '24h'
  minuteStep?: 1 | 5 | 10 | 15 | 30
  showSeconds?: boolean
  minTime?: Date
  maxTime?: Date
  disabled?: boolean
  placeholder?: string
  className?: string
  /** Nadpisy stĺpcov (predvolene slovensky). */
  labels?: Partial<TimePickerLabels>
}

export interface TimePickerLabels {
  hour: string
  minute: string
  second: string
  period: string
  periodShort: string
}

const DEFAULT_LABELS: TimePickerLabels = {
  hour: 'Hodina',
  minute: 'Min',
  second: 'Sek',
  period: 'Časť dňa',
  periodShort: 'AP',
}

const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
  (
    allProps,
    ref
  ) => {
    // Controlled-ness is decided by whether the `value` PROP IS PRESENT,
    // latched on first render — not by whether it is defined. `undefined` is a
    // legal controlled value for an optional date, so the ordinary
    // `useState<Date>()` + `value` pattern used to start uncontrolled and
    // silently flip on the first pick.
    const isControlled = React.useRef('value' in allProps).current

    const {
      value: controlledValue,
      defaultValue,
      onChange,
      format = '24h',
      minuteStep = 1,
      showSeconds = false,
      minTime,
      maxTime,
      disabled = false,
      placeholder = 'Vyber čas',
      className,
      labels: labelsProp,
      ...props
    } = allProps
    const labels = { ...DEFAULT_LABELS, ...labelsProp }
    const listRef = React.useRef<HTMLDivElement>(null)

    const [open, setOpen] = React.useState(false)
    const [uncontrolledValue, setUncontrolledValue] = React.useState<Date | undefined>(defaultValue)

    if (process.env.NODE_ENV !== 'production') {
      if (isControlled !== ('value' in allProps)) {
        console.warn(
          '[TimePicker] Switching between controlled and uncontrolled is not supported. ' +
            'Pass `defaultValue` for uncontrolled use.'
        )
      }
    }
    const selectedTime = isControlled ? controlledValue : uncontrolledValue

    const hours = format === '12h' ? 12 : 24
    const hoursArray = Array.from({ length: hours }, (_, i) => (format === '12h' ? i + 1 : i))
    const minutesArray = Array.from({ length: 60 / minuteStep }, (_, i) => i * minuteStep)
    const secondsArray = Array.from({ length: 60 }, (_, i) => i)

    const getHour = (date: Date) => {
      const h = date.getHours()
      if (format === '12h') {
        return h === 0 ? 12 : h > 12 ? h - 12 : h
      }
      return h
    }

    const getPeriod = (date: Date) => {
      return date.getHours() >= 12 ? 'PM' : 'AM'
    }

    const selectedHour = selectedTime ? getHour(selectedTime) : null
    const selectedMinute = selectedTime ? selectedTime.getMinutes() : null
    const selectedSecond = selectedTime ? selectedTime.getSeconds() : null
    const selectedPeriod = selectedTime ? getPeriod(selectedTime) : 'AM'

    const updateTime = (
      hour?: number,
      minute?: number,
      second?: number,
      period?: 'AM' | 'PM'
    ) => {
      // Bez hodnoty začni na celej hodine: prvý klik na 14 = 14:00 (nie 14:37 z aktuálneho času).
      const newDate = selectedTime ? new Date(selectedTime) : new Date()
      if (!selectedTime) newDate.setMinutes(0, 0, 0)
      else newDate.setMilliseconds(0)

      if (hour !== undefined) {
        let h = hour
        if (format === '12h') {
          const currentPeriod = period ?? selectedPeriod
          if (currentPeriod === 'PM' && hour !== 12) h = hour + 12
          else if (currentPeriod === 'AM' && hour === 12) h = 0
        }
        newDate.setHours(h)
      }

      if (minute !== undefined) {
        newDate.setMinutes(minute)
      }

      if (second !== undefined) {
        newDate.setSeconds(second)
      }

      if (period !== undefined && hour === undefined && selectedTime) {
        let h = selectedTime.getHours()
        if (period === 'PM' && h < 12) h += 12
        else if (period === 'AM' && h >= 12) h -= 12
        newDate.setHours(h)
      }

      // Check min/max time, in seconds so showSeconds isn't ignored.
      const toSeconds = (d: Date) =>
        d.getHours() * 3600 + d.getMinutes() * 60 + (showSeconds ? d.getSeconds() : 0)
      if (minTime && toSeconds(newDate) < toSeconds(minTime)) return
      if (maxTime && toSeconds(newDate) > toSeconds(maxTime)) return

      if (!isControlled) {
        setUncontrolledValue(newDate)
      }
      onChange?.(newDate)
    }

    const formatDisplayTime = (date: Date) => {
      const h = getHour(date)
      const m = date.getMinutes().toString().padStart(2, '0')
      const s = date.getSeconds().toString().padStart(2, '0')
      const period = format === '12h' ? ` ${getPeriod(date)}` : ''
      const hourStr = format === '12h' ? h.toString() : h.toString().padStart(2, '0')

      if (showSeconds) {
        return `${hourStr}:${m}:${s}${period}`
      }
      return `${hourStr}:${m}${period}`
    }

    const isTimeDisabled = (hour: number, minute: number) => {
      let h = hour
      if (format === '12h') {
        if (selectedPeriod === 'PM' && hour !== 12) h = hour + 12
        else if (selectedPeriod === 'AM' && hour === 12) h = 0
      }

      // Compare in seconds, not minutes: with showSeconds the bound was
      // otherwise off by up to 59 seconds in both directions.
      const asSeconds = (d: Date) =>
        d.getHours() * 3600 + d.getMinutes() * 60 + (showSeconds ? d.getSeconds() : 0)
      const timeSeconds =
        h * 3600 + minute * 60 + (showSeconds ? (selectedSecond ?? 0) : 0)

      if (minTime) {
        if (timeSeconds < asSeconds(minTime)) return true
      }

      if (maxTime) {
        if (timeSeconds > asSeconds(maxTime)) return true
      }

      return false
    }

    // Po otvorení posuň každý stĺpec k vybranej (alebo prvej povolenej) hodnote — pri 19:00–19:00 netreba rolovať 00…18.
    React.useEffect(() => {
      if (!open) return
      const raf = requestAnimationFrame(() => {
        listRef.current?.querySelectorAll<HTMLElement>('[role="listbox"]').forEach((list) => {
          const target =
            list.querySelector<HTMLElement>('[aria-selected="true"]') ??
            list.querySelector<HTMLElement>('button:not(:disabled)')
          const viewport = list.closest<HTMLElement>('[data-radix-scroll-area-viewport]')
          if (target && viewport) viewport.scrollTop = Math.max(0, target.offsetTop - 4)
        })
      })
      return () => cancelAnimationFrame(raf)
    }, [open])

    // Calculate number of columns for responsive width
    const columnCount = 2 + (showSeconds ? 1 : 0) + (format === '12h' ? 1 : 0)

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            disabled={disabled}
            {...props}
            className={cn(
              'w-[180px] justify-start text-left font-normal',
              !selectedTime && 'text-muted-foreground',
              className
            )}
          >
            <Clock className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">
              {selectedTime ? formatDisplayTime(selectedTime) : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            'w-auto p-0 overflow-hidden',
            'ease-out animate-in fade-in-0 zoom-in-95 duration-200'
          )}
          align="start"
          sideOffset={4}
        >
          <div
            ref={listRef}
            className={cn(
              'flex',
              // Responsive: stack on very small screens
              // pevná šírka stĺpcov: bez nej sa popover (ScrollArea vo vnútri) roztiahol na celú šírku okna
              'w-max max-w-[calc(100vw-2rem)]'
            )}
            style={{
              // Dynamic width based on column count
              minWidth: `${columnCount * 60}px`,
            }}
          >
            {/* Hours column */}
            <div className="w-20 flex-none border-r-3 border-foreground">
              <div className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground border-b-3 border-foreground bg-muted/30">
                {labels.hour}
              </div>
              <ScrollArea className="h-[200px]">
                <div className="p-1" role="listbox" aria-label={labels.hour}>
                  {hoursArray.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      role="option"
                      aria-selected={selectedHour === hour}
                      // Was styled as disabled but still clickable, and
                      // activating it silently did nothing.
                      disabled={isTimeDisabled(hour, selectedMinute ?? 0)}
                      onClick={() => updateTime(hour)}
                      className={cn(
                        'min-h-11 w-full px-2 py-1.5 text-center text-sm',
                        'transition duration-150 ease-out',
                        'hover:bg-muted hover:scale-105',
                        'focus:outline-none focus:bg-muted',
                        selectedHour === hour && 'bg-primary text-primary-foreground shadow-[2px_2px_0px_hsl(var(--shadow-color))] scale-105',
                        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                      )}
                    >
                      {format === '12h' ? hour : hour.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Minutes column */}
            <div className={cn(
              'w-20 flex-none',
              (showSeconds || format === '12h') && 'border-r-3 border-foreground'
            )}>
              <div className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground border-b-3 border-foreground bg-muted/30">
                {labels.minute}
              </div>
              <ScrollArea className="h-[200px]">
                <div className="p-1" role="listbox" aria-label={labels.minute}>
                  {minutesArray.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      role="option"
                      aria-selected={selectedMinute === minute}
                      // The minute column never consulted isTimeDisabled, so
                      // out-of-range minutes were selectable under minTime/maxTime.
                      disabled={isTimeDisabled(selectedHour ?? 0, minute)}
                      onClick={() => updateTime(undefined, minute)}
                      className={cn(
                        'min-h-11 w-full px-2 py-1.5 text-center text-sm',
                        'transition duration-150 ease-out',
                        'hover:bg-muted hover:scale-105',
                        'focus:outline-none focus:bg-muted',
                        selectedMinute === minute && 'bg-primary text-primary-foreground shadow-[2px_2px_0px_hsl(var(--shadow-color))] scale-105',
                        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                      )}
                    >
                      {minute.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Seconds column */}
            {showSeconds && (
              <div className={cn(
                'w-20 flex-none',
                format === '12h' && 'border-r-3 border-foreground'
              )}>
                <div className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground border-b-3 border-foreground bg-muted/30">
                  {labels.second}
                </div>
                <ScrollArea className="h-[200px]">
                  <div className="p-1" role="listbox" aria-label={labels.second}>
                    {secondsArray.map((second) => (
                      <button
                        key={second}
                        type="button"
                        role="option"
                        aria-selected={selectedSecond === second}
                        onClick={() => updateTime(undefined, undefined, second)}
                        className={cn(
                          'min-h-11 w-full px-2 py-1.5 text-center text-sm',
                          'transition duration-150 ease-out',
                          'hover:bg-muted hover:scale-105',
                          'focus:outline-none focus:bg-muted',
                          selectedSecond === second && 'bg-primary text-primary-foreground shadow-[2px_2px_0px_hsl(var(--shadow-color))] scale-105'
                        )}
                      >
                        {second.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* AM/PM column */}
            {format === '12h' && (
              <div className="w-16 flex-none">
                <div className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground border-b-3 border-foreground bg-muted/30">
                  <span className="hidden sm:inline">{labels.period}</span>
                  <span className="sm:hidden">{labels.periodShort}</span>
                </div>
                <div className="p-1 space-y-1">
                  {(['AM', 'PM'] as const).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => updateTime(undefined, undefined, undefined, period)}
                      className={cn(
                        'w-full px-2 py-3 text-center text-sm font-bold',
                        'transition duration-150 ease-out',
                        'hover:bg-muted hover:scale-105',
                        'focus:outline-none focus:bg-muted',
                        selectedPeriod === period && 'bg-primary text-primary-foreground shadow-[2px_2px_0px_hsl(var(--shadow-color))] scale-105'
                      )}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    )
  }
)
TimePicker.displayName = 'TimePicker'

export { TimePicker }
