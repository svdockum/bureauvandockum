import { describe, it, expect } from 'vitest';
import { doorsturen, isUuid, leesToegestaneOrigins, origineToegestaan } from '../../supabase/functions/_shared/http.ts';

const verzoek = (origin?: string) =>
  new Request('https://x.supabase.co/functions/v1/terugbellen', { method: 'POST', headers: origin ? { origin } : {} });

describe('origins', () => {
  const lijst = leesToegestaneOrigins('https://bureauvandockum.nl/', 'http://127.0.0.1:4321, https://preview.vercel.app');
  it('neemt de site en de extra origins op', () => {
    expect(lijst).toEqual(['https://bureauvandockum.nl', 'http://127.0.0.1:4321', 'https://preview.vercel.app']);
  });
  it('laat een post van de eigen site door', () => expect(origineToegestaan(verzoek('https://bureauvandockum.nl'), lijst)).toBe(true));
  it('weigert een post van een andere site', () => expect(origineToegestaan(verzoek('https://kwaad.example'), lijst)).toBe(false));
  it('weigert een post zonder Origin', () => expect(origineToegestaan(verzoek(), lijst)).toBe(false));
});

describe('doorsturen en isUuid', () => {
  it('stuurt door met 303', () => {
    const r = doorsturen('https://bureauvandockum.nl/terugbellen/verzonden/');
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe('https://bureauvandockum.nl/terugbellen/verzonden/');
  });
  it('herkent een uuid', () => {
    expect(isUuid('3f1c2a7e-9b4d-4c3a-8f2e-1d2c3b4a5f6e')).toBe(true);
    expect(isUuid('1 or 1=1')).toBe(false);
    expect(isUuid(null)).toBe(false);
  });
});
