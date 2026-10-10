const TEKENS: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(tekst: string): string {
  return tekst.replace(/[&<>"']/g, (t) => TEKENS[t]);
}
