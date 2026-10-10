// Controleert het formulier vóór verzenden en toont een foutoverzicht.
// Zonder JavaScript doen de browser (required) en de server de controle.
type Veld = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function isVeld(el: Element): el is Veld {
  return el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement;
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
      const tekst = el.validity.valid ? null : (el.dataset.fout ?? 'Dit veld is niet goed ingevuld.');
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
