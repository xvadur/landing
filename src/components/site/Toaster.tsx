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
            'flex w-[min(92vw,420px)] items-center gap-3 rounded-lg border-3 border-ink px-4 py-3 font-sans font-bold text-ink shadow-brutal',
          default: 'bg-yellow',
          title: 'font-display text-base font-extrabold uppercase tracking-wide',
          description: 'text-sm font-medium',
          success: 'bg-lime',
          error: 'bg-hot text-ink',
          info: 'bg-sky',
          warning: 'bg-pink',
        },
      }}
    />
  );
}
