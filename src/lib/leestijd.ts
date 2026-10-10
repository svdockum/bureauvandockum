// Leestijd in hele minuten, op 200 woorden per minuut (rustig lezen, B1-niveau).
export function leestijd(tekst: string): number {
  const woorden = tekst.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  return Math.max(1, Math.ceil(woorden / 200));
}
