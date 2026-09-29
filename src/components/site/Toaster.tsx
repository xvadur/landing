import { Toaster as Sonner } from 'sonner';

/** sonner toasty v tokenoch. Ostrov: <Toaster client:idle />. Volanie: import { toast } from 'sonner'. */
export default function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      offset={20}
      duration={2800}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex w-[min(92vw,420px)] items-center gap-3 rounded-lg border-3 border-ink px-4 py-3 font-sans font-bold shadow-brutal',
          default: 'bg-yellow text-ink',
          title: 'font-display text-base font-extrabold uppercase tracking-wide',
          description: 'text-sm font-medium',
          /* V5.3 bez pastelov: success žltá, info biela, warning biela s alarmovým okrajom, error stamp (text paper) */
          success: 'bg-yellow text-ink',
          error: 'bg-stamp text-paper',
          info: 'bg-white text-ink',
          loading: 'bg-white text-ink',
          warning: 'bg-white text-ink border-l-[12px] border-l-stamp',
        },
      }}
    />
  );
}
