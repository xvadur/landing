/** V7-01 · pás alarmov pod horným pásom: BoldKit Marquee (čisté CSS, bez hydratácie). Overené fakty + výzva. */
import { Marquee, MarqueeItem, MarqueeSeparator } from '@/components/ui/marquee';

export default function Alarmy({ polozky }: { polozky: string[] }) {
  return (
    <Marquee speed="slow" pauseOnHover bordered={false} repeat={2} className="m01-alarmy bg-ink text-paper [--bk-marquee-gap:1.5rem]">
      {polozky.map((a) => (
        <span key={a} className="flex items-center gap-6">
          <MarqueeItem className="px-0 py-0 font-mono text-xs font-bold tracking-[0.12em] text-paper">{a}</MarqueeItem>
          <MarqueeSeparator className="text-base text-yellow">✚</MarqueeSeparator>
        </span>
      ))}
    </Marquee>
  );
}
