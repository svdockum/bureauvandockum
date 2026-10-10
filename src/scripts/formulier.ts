// Controleert het formulier vóór verzenden en toont een foutoverzicht.
// Zonder JavaScript doen de browser (required) en de server de controle.
type Veld = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function isVeld(el: Element): el is Veld {
  return el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement;
}

// Zelfde regels als de server, zodat wat hier goed is ook daar goed gaat.
function fouttekst(veld: Veld): string | null {
  const standaard = veld.dataset.fout ?? 'Dit veld is niet goed ingevuld.';
  if (!veld.validity.valid) return standaard;
  if (veld instanceof HTMLSelectElement) return null;
  const waarde = veld.value.trim();
  if (veld.required && veld.type !== 'checkbox' && veld.type !== 'radio' && waarde === '') return standaard;
  if (waarde === '') return null;
  const minCijfers = Number(veld.dataset.minCijfers);
  if (minCijfers > 0 && (waarde.match(/\d/g) ?? []).length < minCijfers) return standaard;
  const patroon = veld.dataset.patroon;
  if (patroon && !new RegExp(patroon).test(waarde)) return veld.dataset.foutPatroon ?? standaard;
  return null;
}

function zetFout(veld: Veld, tekst: string | null): void {
  const melding = document.getElementById(`${veld.id}-fout`);
  if (melding) {
    melding.textContent = tekst ?? '';
    melding.hidden = !tekst;
  }
  if (tekst) veld.setAttribute('aria-invalid', 'true');
  else veld.removeAttribute('aria-invalid');
}

export function koppelFormulier(form: HTMLFormElement): void {
  const overzicht = form.querySelector<HTMLElement>('.foutoverzicht');
  const lijst = overzicht?.querySelector('ul');
  if (!overzicht || !lijst) return;
  form.noValidate = true;

  form.addEventListener('submit', (e) => {
    const fouten: { veld: Veld; tekst: string }[] = [];
    for (const el of Array.from(form.elements)) {
      if (!isVeld(el) || !el.id || el.closest('[aria-hidden="true"]')) continue;
      const tekst = fouttekst(el);
      zetFout(el, tekst);
      if (tekst) fouten.push({ veld: el, tekst });
    }
    if (fouten.length === 0) {
      overzicht.hidden = true;
      return;
    }
    e.preventDefault();
    lijst.replaceChildren(...fouten.map(({ veld, tekst }) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${veld.id}`;
      a.textContent = tekst;
      a.addEventListener('click', (klik) => { klik.preventDefault(); veld.focus(); });
      li.append(a);
      return li;
    }));
    overzicht.hidden = false;
    overzicht.focus();
  });
}

for (const form of document.querySelectorAll<HTMLFormElement>('form[data-controleer]')) koppelFormulier(form);
