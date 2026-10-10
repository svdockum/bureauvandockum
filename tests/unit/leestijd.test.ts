import { describe, it, expect } from 'vitest';
import { leestijd } from '../../src/lib/leestijd';

describe('leestijd', () => {
  it('rekent 200 woorden per minuut, naar boven afgerond', () => {
    expect(leestijd(Array(401).fill('woord').join(' '))).toBe(3);
  });
  it('geeft minimaal één minuut', () => {
    expect(leestijd('kort')).toBe(1);
    expect(leestijd('')).toBe(1);
  });
  it('telt Markdown-tekens niet als woorden', () => {
    expect(leestijd('## Kop\n\n- **een** _twee_\n\n---')).toBe(1);
  });
});
