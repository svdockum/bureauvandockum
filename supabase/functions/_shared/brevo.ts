export type Mail = { aan: { email: string; naam?: string }; onderwerp: string; html: string; tekst: string; antwoordAan?: string };

export function brevoBody(mail: Mail, afzender: string) {
  return {
    sender: { name: 'Bureau van Dockum', email: afzender },
    to: [{ email: mail.aan.email, ...(mail.aan.naam ? { name: mail.aan.naam } : {}) }],
    subject: mail.onderwerp,
    htmlContent: mail.html,
    textContent: mail.tekst,
    ...(mail.antwoordAan ? { replyTo: { email: mail.antwoordAan } } : {}),
  };
}

export async function stuurViaBrevo(mail: Mail, cfg: { apiKey: string; afzender: string }, doeFetch: typeof fetch = fetch): Promise<void> {
  const res = await doeFetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': cfg.apiKey, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(brevoBody(mail, cfg.afzender)),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
}
