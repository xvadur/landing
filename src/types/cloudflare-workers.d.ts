/** Minimálna deklarácia pre `cloudflare:workers` (workerd runtime; @cloudflare/workers-types v repe nie je). */
declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>;
}
