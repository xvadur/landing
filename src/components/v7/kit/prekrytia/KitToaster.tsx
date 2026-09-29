/** Toaster katalógu s vlastným id (inak by sa každé hlásenie ukázalo aj v site Toasteri z Base.astro).
 *  BoldKit sonner.tsx tak, ako je: unstyled + triedy z tokenov, bez ThemeProvider. */
import { Toaster } from '@/components/ui/sonner';
import { KIT_TOASTER } from './spolocne';

export default function KitToaster() {
  return <Toaster id={KIT_TOASTER} position="bottom-right" />;
}
