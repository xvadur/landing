/** V7 základ: ukážka BoldKitu v tokenoch xvadur.com. Iba kontrola vzhľadu (/v7-kit, noindex), dáta sú ukážkové. */
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { GaugeChart } from '@/components/ui/gauge-chart';
import { Sparkline } from '@/components/ui/sparkline';
import { Sticker, Stamp } from '@/components/ui/sticker';
import { LayeredCard, LayeredCardContent, LayeredCardHeader, LayeredCardTitle } from '@/components/ui/layered-card';
import {
  Timeline,
  TimelineItem,
  TimelineDot,
  TimelineContent,
  TimelineTitle,
  TimelineDescription,
} from '@/components/ui/timeline';
import { Marquee, MarqueeItem, MarqueeSeparator } from '@/components/ui/marquee';
import { Star5Shape, CrossShape } from '@/components/ui/shapes';
import { MathCurveBackground } from '@/components/ui/math-curve-background';
import { HeatmapChart } from '@/components/ui/heatmap-chart';

const cesta = [
  { t: 'Nemocnica', d: 'Osem rokov zmien.', s: 'completed' as const },
  { t: 'AI', d: 'Prvý agent za večer.', s: 'completed' as const },
  { t: 'XVADUR', d: 'Systémy, ktoré nesú prácu.', s: 'current' as const },
];
const dni = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];
const hodiny = ['ráno', 'poobede', 'večer', 'noc'];
const heat = dni.flatMap((d, i) => hodiny.map((h, j) => ({ row: h, col: d, value: ((i + 1) * (j + 2)) % 9 })));

export default function KitUkazka() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
      <header className="flex flex-wrap items-center gap-4">
        <h1 className="font-display text-display-md uppercase">V7 · BoldKit v tokenoch</h1>
        <Badge>ukážkové dáta</Badge>
        <Badge variant="accent">hot iba CTA</Badge>
        <Badge variant="destructive">alarm</Badge>
      </header>

      <section className="flex flex-wrap gap-4">
        <Button>Primárne</Button>
        <Button variant="accent">Objednať vyšetrenie</Button>
        <Button variant="secondary">Sekundárne</Button>
        <Button variant="outline">Obrys</Button>
        <Button variant="accent" animation="wiggle">Podpis</Button>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <StatCard title="Slová v Korpuse" value="ukážka" change="+12 %" trend="up" color="secondary" />
        <Card>
          <CardHeader>
            <CardTitle>Vitálne funkcie</CardTitle>
            <CardDescription>gauge + sparkline</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <GaugeChart value={72} max={100} label="tep" />
            <Sparkline data={[3, 5, 4, 8, 6, 9, 7, 11]} type="area" trend="up" ariaLabel="ukážkový trend" />
          </CardContent>
        </Card>
        <LayeredCard layers="triple" color="secondary">
          <LayeredCardHeader>
            <LayeredCardTitle>Anamnéza</LayeredCardTitle>
          </LayeredCardHeader>
          <LayeredCardContent>Vrstvená karta, tri vrstvy papiera.</LayeredCardContent>
        </LayeredCard>
      </section>

      <section className="grid items-start gap-6 md:grid-cols-2">
        <Timeline>
          {cesta.map((c) => (
            <TimelineItem key={c.t} status={c.s}>
              <TimelineDot status={c.s} />
              <TimelineContent>
                <TimelineTitle>{c.t}</TimelineTitle>
                <TimelineDescription>{c.d}</TimelineDescription>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
        <div className="flex flex-wrap items-center gap-6">
          <Sticker rotation="slight">ADAM · SESTRA</Sticker>
          <Stamp>OVERENÉ</Stamp>
          <Star5Shape size={72} filled color="var(--color-yellow)" />
          <CrossShape size={72} filled color="var(--color-stamp)" />
        </div>
      </section>

      <HeatmapChart data={heat} rows={hodiny} cols={dni} showLabels ariaLabel="ukážková heatmapa" />

      <MathCurveBackground className="h-48 border-3 border-ink bg-white" headColor="var(--color-hot)">
        <div className="flex h-48 items-center justify-center font-display text-display-sm uppercase">EKG pozadie</div>
      </MathCurveBackground>

      <Marquee bordered speed="normal">
        <MarqueeItem>VYŠETRENIE</MarqueeItem>
        <MarqueeSeparator />
        <MarqueeItem>DIAGNÓZA</MarqueeItem>
        <MarqueeSeparator />
        <MarqueeItem>LIEČBA</MarqueeItem>
        <MarqueeSeparator />
        <MarqueeItem>PACIENTI</MarqueeItem>
      </Marquee>
    </div>
  );
}
