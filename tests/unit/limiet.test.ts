import { describe, it, expect } from 'vitest';
import { afzenderSleutel, binnenLimiet, type LimietDeps } from '../../supabase/functions/_shared/limiet.ts';

function geheugen() {
  const rijen: { sleutel: string; op: Date }[] = [];
  let nu = new Date('2026-10-10T12:00:00Z');
  const deps: LimietDeps = {
    async tel(sleutel, sinds) { return rijen.filter((r) => r.sleutel === sleutel && r.op >= sinds).length; },
    async registreer(sleutel) { rijen.push({ sleutel, op: nu }); },
  };
  return { rijen, deps, zetNu: (d: Date) => { nu = d; }, nu: () => nu };
}

describe('binnenLimiet', () => {
  it('laat vijf verzoeken toe en weigert het zesde', async () => {
    const g = geheugen();
    for (let i = 0; i < 5; i++) expect(await binnenLimiet('a', g.deps, g.nu())).toBe(true);
    expect(await binnenLimiet('a', g.deps, g.nu())).toBe(false);
    expect(g.rijen).toHaveLength(5);
  });
  it('telt verzoeken ouder dan een uur niet mee', async () => {
    const g = geheugen();
    for (let i = 0; i < 5; i++) await binnenLimiet('a', g.deps, g.nu());
    const later = new Date(g.nu().getTime() + 61 * 60 * 1000);
    g.zetNu(later);
    expect(await binnenLimiet('a', g.deps, later)).toBe(true);
  });
  it('telt per afzender apart', async () => {
    const g = geheugen();
    for (let i = 0; i < 5; i++) await binnenLimiet('a', g.deps, g.nu());
    expect(await binnenLimiet('b', g.deps, g.nu())).toBe(true);
  });
});

describe('afzenderSleutel', () => {
  const req = (h: Record<string, string>) => new Request('https://x.nl', { headers: h });
  it('geeft een hash zonder het IP-adres', async () => {
    const s = await afzenderSleutel('terugbellen', req({ 'x-forwarded-for': '10.0.0.1, 203.0.113.7' }));
    expect(s).toMatch(/^[0-9a-f]{64}$/);
    expect(s).not.toContain('203.0');
  });
  it('is stabiel voor dezelfde invoer en verschilt per functie of IP', async () => {
    const a = await afzenderSleutel('terugbellen', req({ 'x-forwarded-for': '203.0.113.7' }));
    expect(await afzenderSleutel('terugbellen', req({ 'x-forwarded-for': '203.0.113.7' }))).toBe(a);
    expect(await afzenderSleutel('scan-aanvragen', req({ 'x-forwarded-for': '203.0.113.7' }))).not.toBe(a);
    expect(await afzenderSleutel('terugbellen', req({ 'x-forwarded-for': '203.0.113.8' }))).not.toBe(a);
  });
  it('negeert een zelf meegestuurd eerste X-Forwarded-For-adres', async () => {
    const echt = await afzenderSleutel('t', req({ 'x-forwarded-for': '203.0.113.7' }));
    expect(await afzenderSleutel('t', req({ 'x-forwarded-for': '6.6.6.6, 203.0.113.7' }))).toBe(echt);
    expect(await afzenderSleutel('t', req({ 'x-forwarded-for': '7.7.7.7, 203.0.113.7' }))).toBe(echt);
  });
  it('geeft cf-connecting-ip voorrang boven X-Forwarded-For', async () => {
    const cf = await afzenderSleutel('t', req({ 'cf-connecting-ip': '198.51.100.1' }));
    expect(await afzenderSleutel('t', req({ 'cf-connecting-ip': '198.51.100.1', 'x-forwarded-for': '6.6.6.6, 10.0.0.1' }))).toBe(cf);
    expect(cf).toBe(await afzenderSleutel('t', req({ 'x-forwarded-for': '198.51.100.1' })));
  });
  it('valt zonder adres terug op onbekend', async () => {
    expect(await afzenderSleutel('t', req({}))).toMatch(/^[0-9a-f]{64}$/);
  });
});
