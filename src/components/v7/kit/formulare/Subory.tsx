/** Kit · Formuláre: dropzone (+ FileList). Nič sa nenahráva: súbory ostávajú v prehliadači, priebeh je simulovaný. */
import { useEffect, useRef, useState } from 'react';
import { FileText, ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Dropzone, FileList, type FileRejection } from '@/components/ui/dropzone';
import { cn } from '@/lib/utils';
import { Bunka, Kus, Mriezka, Recept, Stav, TOASTER, useKlient } from './Spolocne';

type Polozka = { file: File; progress?: number; uploading?: boolean; error?: string };

const MB = 1024 * 1024;

/** Ukážkové súbory pre FileList (vznikajú v prehliadači, obsah je prázdny text). */
function ukazkoveSubory(): Polozka[] {
  const f = (meno: string, typ: string, velkost: number) => new File([new Uint8Array(velkost)], meno, { type: typ });
  return [
    { file: f('chorobopis-jakub.pdf', 'application/pdf', 182_000) },
    { file: f('ukazka-ulohy.png', 'image/png', 640_000), uploading: true, progress: 62 },
    { file: f('export-crm.csv', 'text/csv', 3_400_000), error: 'Súbor je väčší ako 2 MB.' },
  ];
}

const slovom = (r: FileRejection[]) =>
  r
    .map((x) => `${x.file.name}: ${x.errors.map((e) => (e.code === 'file-too-large' ? 'väčší ako 2 MB' : e.code === 'file-invalid-type' ? 'iný typ' : 'priveľa súborov')).join(', ')}`)
    .join(' · ');

export default function Subory() {
  const klient = useKlient();
  const [polozky, setPolozky] = useState<Polozka[]>([]);
  const [zamietnute, setZamietnute] = useState('');
  const casovac = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (casovac.current) clearInterval(casovac.current);
  }, []);

  function prijmi(files: File[]) {
    setPolozky(files.map((file) => ({ file, uploading: true, progress: 0 })));
    if (casovac.current) clearInterval(casovac.current);
    casovac.current = setInterval(() => {
      setPolozky((xs) => {
        const dalej = xs.map((x) => {
          const p = Math.min(100, (x.progress ?? 0) + 17);
          return { ...x, progress: p, uploading: p < 100 };
        });
        if (dalej.every((x) => !x.uploading)) {
          if (casovac.current) clearInterval(casovac.current);
          toast.success('Príloha pripravená', { toasterId: TOASTER, description: 'Ukážka: nič sa nenahralo, súbor ostal u teba.' });
        }
        return dalej;
      });
    }, 250);
  }

  return (
    <div className="flex flex-col gap-16">
      <Kus
        id="dropzone"
        meno="dropzone"
        veta="Plocha na pustenie súborov: kontrola typu, veľkosti a počtu, render-prop so stavom (isDragging, accepted, rejected), 3 varianty. FileList ukáže priebeh aj chybu."
        pozor={[
          'predvolené texty a hlásky po anglicky („Drag & drop files“, „File is larger…“)',
          'aria-label „File upload area“ → prepíš propom',
          'dragging: bg-primary/10 a tieň primary = sivé, nie žlté',
          'tlačidlo odobrať v FileList 32 px',
        ]}
      >
        <Mriezka>
          <Bunka nazov='variant="default" (predvolený obsah)' stlpec>
            <Dropzone onFilesAccepted={() => {}} aria-label="Pustiť súbory" />
          </Bunka>
          <Bunka nazov='variant="compact" · accept PDF · maxSize 2 MB' stlpec>
            <Dropzone
              variant="compact"
              accept={{ 'application/pdf': ['.pdf'] }}
              maxSize={2 * MB}
              onFilesAccepted={(f) => toast.success(`Prijaté: ${f.map((x) => x.name).join(', ')}`, { toasterId: TOASTER })}
              onFilesRejected={(r) => toast.error('Zamietnuté', { toasterId: TOASTER, description: slovom(r) })}
              aria-label="Pustiť PDF do 2 MB"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <FileText className="size-8" />
                <p className="font-bold">Iba PDF do 2 MB</p>
              </div>
            </Dropzone>
          </Bunka>
          <Bunka nazov='variant="minimal" · disabled' stlpec>
            <Dropzone variant="minimal" onFilesAccepted={() => {}} aria-label="Minimálna plocha" />
            <Dropzone variant="minimal" disabled onFilesAccepted={() => {}} aria-label="Vypnutá plocha">
              <p className="text-sm font-bold">Vypnuté</p>
            </Dropzone>
          </Bunka>
          <Bunka nazov="render-prop: stav naživo · maxFiles 1 · obrázky" stlpec className="sm:col-span-2 lg:col-span-1">
            <Dropzone
              maxFiles={1}
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
              onFilesAccepted={() => {}}
              aria-label="Pustiť jeden obrázok"
              className="bg-white"
            >
              {(s) => (
                <div className="flex flex-col items-center gap-2 text-center">
                  <ImageIcon className={cn('size-8', s.isDragging && 'animate-bounce motion-reduce:animate-none')} />
                  <p className="font-bold">{s.isDragging ? 'Pusti ho' : 'Jeden obrázok'}</p>
                  <p className="font-mono text-xs">
                    prijaté {s.acceptedFiles.length} · zamietnuté {s.rejectedFiles.length}
                  </p>
                </div>
              )}
            </Dropzone>
          </Bunka>
          <Bunka nazov="FileList: hotovo · nahráva · chyba" stlpec className="sm:col-span-2">
            {klient ? <FileList files={ukazkoveSubory()} onRemove={() => {}} className="mt-0" /> : <p className="text-sm">Načítavam ukážku…</p>}
          </Bunka>
        </Mriezka>
        <Recept nazov="príloha k vyšetreniu (nepovinná)" badge="ukážka · nič sa nenahrá">
          <p className="max-w-xl">
            Prílohy si vypýtam len v rozsahu úlohy. Pri citlivom obsahu začneme zdieľanou obrazovkou, redigovanou vzorkou alebo
            syntetickým príkladom.
          </p>
          <Dropzone
            maxFiles={3}
            maxSize={2 * MB}
            accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] }}
            onFilesAccepted={(f) => {
              setZamietnute('');
              prijmi(f);
            }}
            onFilesRejected={(r) => setZamietnute(slovom(r))}
            aria-label="Priložiť ukážku úlohy: PDF alebo obrázok do 2 MB, najviac 3"
            className="bg-white"
          >
            {(s) => (
              <div className="flex flex-col items-center gap-3 text-center">
                <span className={cn('flex size-14 items-center justify-center rounded-lg border-3 border-ink bg-yellow', s.isDragging && 'bg-ink text-paper')}>
                  <Upload className="size-7" />
                </span>
                <p className="font-display text-xl font-extrabold uppercase">{s.isDragging ? 'Pusti to sem' : 'Prilož ukážku úlohy'}</p>
                <p className="text-sm font-bold">PDF alebo obrázok · do 2 MB · najviac 3 · klikni alebo potiahni</p>
              </div>
            )}
          </Dropzone>
          {zamietnute && (
            <p role="alert" className="rounded-lg border-3 border-ink bg-stamp px-4 py-2 font-bold text-paper">
              {zamietnute}
            </p>
          )}
          <FileList files={polozky} onRemove={(f) => setPolozky((xs) => xs.filter((x) => x.file !== f))} />
          <Stav>
            {polozky.length ? `${polozky.length} súbor(y) · ${polozky.map((p) => `${p.progress ?? 0} %`).join(', ')}` : 'zatiaľ nič'}{' '}
          </Stav>
        </Recept>
      </Kus>
    </div>
  );
}
