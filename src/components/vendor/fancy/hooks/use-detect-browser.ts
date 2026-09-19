// Fancy Components (MIT, (c) Daniel Petho) — https://www.fancycomponents.dev/r/use-detect-browser.json
// Úprava xvadur.com v4: hooky sa volajú vždy (originál mal `return null` pred useState → porušenie pravidiel hookov);
// na serveri vracia '' a po mount-e názov prehliadača.
import { useEffect, useState } from 'react';

export type BrowserName = '' | 'Firefox' | 'Samsung Internet' | 'Opera' | 'IE' | 'Edge' | 'Chrome' | 'Safari' | 'unknown';

export function detectBrowser(ua: string): BrowserName {
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('SamsungBrowser') > -1) return 'Samsung Internet';
  if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
  if (ua.indexOf('Trident') > -1) return 'IE';
  if (ua.indexOf('Edge') > -1) return 'Edge';
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1) return 'Safari';
  return 'unknown';
}

export default function useDetectBrowser(): BrowserName {
  const [browserName, setBrowserName] = useState<BrowserName>('');
  useEffect(() => {
    setBrowserName(detectBrowser(navigator.userAgent));
  }, []);
  return browserName;
}
