import { useCallback, useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { ArrowRightIcon } from '@phosphor-icons/react';
import { COMMAND_ITEMS } from '@/data/nav';

/** ⌘K / Ctrl K paleta (cmdk): DOMOV, HRY, KVÍZ, SKÓRE WEBU, TEXTY, MAKLÉRI, KONZULTÁCIA.
 *  Otvára sa aj klikom na [data-commandk] a udalosťou document.dispatchEvent(new CustomEvent('xvadur:commandk')).
 *  Ostrov: <CommandK client:idle />. */
export default function CommandK() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onEvent = () => setOpen(true);
    const onClick = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest('[data-commandk]')) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('xvadur:commandk', onEvent);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('xvadur:commandk', onEvent);
      document.removeEventListener('click', onClick);
    };
  }, []);

  const go = useCallback((href: string) => {
    setOpen(false);
    window.location.assign(href);
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Príkazová paleta"
      overlayClassName="fixed inset-0 z-[100] bg-overlay"
      contentClassName="fixed left-1/2 top-[12vh] z-[101] w-[min(92vw,560px)] -translate-x-1/2 outline-none"
      loop
    >
      <div className="brutal overflow-hidden shadow-brutal-xl">
        <div className="flex items-center gap-3 border-b-3 border-ink bg-yellow px-4">
          <span className="eyebrow">Kam?</span>
          <Command.Input
            autoFocus
            placeholder="Hry, kvíz, texty, konzultácia…"
            className="h-14 w-full bg-transparent font-display text-xl font-extrabold uppercase outline-none placeholder:font-sans placeholder:text-base placeholder:font-medium placeholder:normal-case placeholder:text-ink/60"
          />
          <kbd className="hidden rounded-sm border-2 border-ink bg-white px-1.5 font-mono text-xs sm:block">ESC</kbd>
        </div>
        <Command.List className="max-h-[50vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center font-sans">Nič také tu nie je.</Command.Empty>
          <Command.Group heading="Stránky" className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2">
            {COMMAND_ITEMS.map((item) => (
              <Command.Item
                key={item.href}
                value={`${item.label} ${item.href}`}
                onSelect={() => go(item.href)}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border-3 border-transparent px-3 py-3 font-display text-lg font-extrabold uppercase data-[selected=true]:border-ink data-[selected=true]:bg-yellow data-[selected=true]:shadow-brutal-sm"
              >
                <span>{item.label}</span>
                <span className="flex items-center gap-2 font-mono text-xs font-medium normal-case tracking-wide text-ink/70">
                  {item.href}
                  <ArrowRightIcon weight="bold" size={16} aria-hidden="true" />
                </span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
