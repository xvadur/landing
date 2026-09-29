/** V7-01 · motto na monitore príjmu. Trvalo čitateľné; každé 4 s (len v obraze, bez reduced motion) ním prebehne vlna
 *  šumu zo stredu (React Bits DecryptedText, zámok V5.3). Čítačka dostane iba pôvodný text. Ostrov: client:visible. */
import * as React from 'react';
import DecryptedText from '@/components/vendor/reactbits/DecryptedText';
import { MOTTO_1, MOTTO_2 } from '@/components/hero/hero-data';
import { useRedukovane } from './klient';

export default function Motto({ className = '' }: { className?: string }) {
  const ref = React.useRef<HTMLParagraphElement>(null);
  const reduced = useRedukovane();
  const [tik, setTik] = React.useState(0);
  const [vidno, setVidno] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVidno(!!e?.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    if (reduced || !vidno) return;
    const t = window.setInterval(() => setTik((n) => n + 1), 4000);
    return () => window.clearInterval(t);
  }, [reduced, vidno]);

  return (
    <p ref={ref} lang="en" className={className}>
      {[MOTTO_1, MOTTO_2].map((r, i) => (
        <DecryptedText
          key={`${r}-${tik}`}
          text={r}
          animateOn="view"
          initialEncrypted={tik > 0}
          sequential
          revealDirection="center"
          speed={28}
          characters="X×.:ABCDEFGHIJKLMNOPRSTUVWYZ"
          parentClassName={i === 0 ? 'block sm:inline' : 'block sm:inline sm:ml-[0.25em]'}
          className={i === 0 ? 'text-yellow' : 'text-paper'}
          encryptedClassName="text-stamp"
        />
      ))}
    </p>
  );
}
