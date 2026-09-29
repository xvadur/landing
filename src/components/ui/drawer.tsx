import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { cn } from '@/lib/utils'

/* vaul pri dismissible={false} ignoruje aj <DrawerClose> (zatvára sa iba zmenou `open`). Drawer preto drží stav sám
   (alebo prepúšťa kontrolovaný `open`) a DrawerClose ho pri nezatvárateľnej zásuvke zavrie cez kontext.
   shouldScaleBackground je predvolene vypnuté: web nemá [data-vaul-drawer-wrapper] a vaul by inak farbil body. */
const DrawerCloseContext = React.createContext<{ dismissible: boolean; close: () => void } | null>(null)

const Drawer = ({
  shouldScaleBackground = false,
  dismissible = true,
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => {
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen ?? false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : innerOpen
  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) setInnerOpen(value)
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange]
  )
  const ctx = React.useMemo(() => ({ dismissible, close: () => setOpen(false) }), [dismissible, setOpen])
  return (
    <DrawerCloseContext.Provider value={ctx}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <DrawerPrimitive.Root
        shouldScaleBackground={shouldScaleBackground}
        dismissible={dismissible}
        open={open}
        onOpenChange={setOpen}
        {...(props as any)}
      />
    </DrawerCloseContext.Provider>
  )
}
Drawer.displayName = 'Drawer'

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Close>
>(({ onClick, ...props }, ref) => {
  const ctx = React.useContext(DrawerCloseContext)
  return (
    <DrawerPrimitive.Close
      ref={ref}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented && ctx && !ctx.dismissible) ctx.close()
      }}
      {...props}
    />
  )
})
DrawerClose.displayName = 'DrawerClose'

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-overlay', className)}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col border-3 border-b-0 border-foreground bg-background shadow-[0px_-8px_0px_hsl(var(--shadow-color))]',
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] bg-foreground" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = 'DrawerContent'

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('grid gap-1.5 p-4 text-center sm:text-left', className)}
    {...props}
  />
)
DrawerHeader.displayName = 'DrawerHeader'

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('mt-auto flex flex-col gap-2 p-4', className)}
    {...props}
  />
)
DrawerFooter.displayName = 'DrawerFooter'

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn('text-lg font-bold uppercase tracking-wide leading-none', className)}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
