/** Slovenské tisícové medzery („2 034", „275 333", „1 500 €") majú v dátach obyčajnú medzeru (U+0020) a v texte
 *  sa cez ňu lámu riadky. Pred výpisom ich domov nahradí pevnou (U+00A0) — len medzi číslicami a pred jednotkou €. */
export function nbsp(s: string): string {
  return s.replace(/(\d) (?=\d)/g, '$1 ').replace(/(\d) €/g, '$1 €');
}
