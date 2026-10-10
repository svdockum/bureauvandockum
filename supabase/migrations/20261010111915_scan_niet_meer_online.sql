-- De scan wordt niet meer online betaald maar vrijblijvend aangevraagd (formulier → gesprek).
-- Het product blijft bestaan voor de geschiedenis, maar is niet meer te bestellen.
update public.producten set actief = false where slug = 'snelle-scan';
