/** Toastery katalógu (dva, oddelené id od site Toastera v Base.astro, inak by sa každé hlásenie ukázalo dvakrát):
 *   „kit“          = oprava: unstyled + triedy z tokenov. Sonner vkladá vlastné CSS mimo @layer, takže vyhráva nad
 *                    Tailwind 4 utilitami v @layer utilities → štýl BoldKitu (group-[.toaster]:…) sa neprejaví.
 *   „kit-boldkit“  = BoldKit sonner.tsx tak, ako je (dôkaz chyby). Potrebuje ThemeProvider (useTheme inak hádže chybu). */
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/hooks/use-theme';
import { KIT_TOASTER, KIT_TOASTER_BOLDKIT } from './spolocne';

const OPRAVA = {
  unstyled: true,
  classNames: {
    toast:
      'relative flex w-[min(calc(100vw-2rem),356px)] items-center gap-3 border-3 border-ink bg-white p-4 font-sans text-ink shadow-brutal',
    content: 'flex flex-1 flex-col gap-0.5',
    title: 'font-display text-base font-extrabold uppercase tracking-wide',
    description: 'text-sm font-medium',
    icon: 'shrink-0',
    default: 'bg-white',
    success: 'bg-yellow',
    warning: 'bg-white border-l-[12px] border-l-stamp',
    error: 'bg-stamp text-paper',
    info: 'bg-paper',
    loading: 'bg-paper',
    actionButton: 'min-h-11 shrink-0 border-2 border-ink bg-ink px-3 text-xs font-bold uppercase text-paper',
    cancelButton: 'min-h-11 shrink-0 border-2 border-ink bg-paper px-3 text-xs font-bold uppercase text-ink',
    closeButton: 'absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center border-2 border-ink bg-white text-ink',
  },
};

export default function KitToaster() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="xvadur-kit-tema">
      <Toaster id={KIT_TOASTER} position="bottom-right" toastOptions={OPRAVA} />
      <Toaster id={KIT_TOASTER_BOLDKIT} position="bottom-left" />
    </ThemeProvider>
  );
}
