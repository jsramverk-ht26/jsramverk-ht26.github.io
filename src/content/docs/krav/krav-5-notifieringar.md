---
title: "Krav 5 — Notifieringar via extern tjänst"
description: "Notifieringar via extern tjänst — ntfy.sh, Discord eller e-post."
---

**Gemensamt krav.** Gäller båda projekten.

Applikationen ska skicka en notifiering när något händer — via en **extern
tjänst eller ett externt API**. Kanalen väljer ni själva: push, e-post,
Discord, Slack eller något annat.

- **Texteditor:** notis när ett dokument delas eller får en kommentar
- **Bokningssystem:** notis när en bokning skapas eller avbokas

Det här kravet finns **inte** implementerat i referensapparna — ni bygger det
från grunden. Koden är liten; det intressanta är tänket runtomkring.

### ⚠️ Det här kravet är avsiktligt löst hållet

Ni bestämmer själva **vilken kanal** ni notifierar genom och **vad som utlöser**
en notifiering. Det finns inget facit.

Priset för den friheten är att redovisningsbördan flyttas till er. En lösning
som skickar ett Discord-meddelande vid ny bokning är fullt godkänd — men bara
om ni förklarar varför Discord, vad som triggar, hur ni hanterar att tjänsten
kan vara nere, och vad ni valde bort.

Samma lösning utan den beskrivningen går inte att bedöma som mer än "något
finns där". **Ju friare kravet är, desto mer hänger bedömningen på hur ni
beskriver det ni gjort.**

---

### Mönstret, oavsett kanal

Alla alternativ nedan har samma form: ett HTTP-anrop från **er server** till en
annan tjänst.

```
Användare → er backend → extern tjänst → användarens telefon/inkorg
```

Anropet går från servern, inte från webbläsaren. Därför slipper ni CORS här —
CORS är en webbläsarregel, och er server är ingen webbläsare.

#### Tre regler att följa

**1. Notifieringen får aldrig fälla huvudanropet.**

```js
// Fel: misslyckas notifieringen går bokningen förlorad
await sparaBokning(data)
await notifiera(`Ny bokning: ${data.resurs}`)
res.status(201).json(bokning)

// Rätt: bokningen är viktigare än notisen
await sparaBokning(data)

try {
  await notifiera(`Ny bokning: ${data.resurs}`)
}
catch (error) {
  console.error('Notifiering misslyckades:', error.message)
}

res.status(201).json(bokning)
```

**2. Konfiguration i `.env`, aldrig i koden.** Ämnesnamn, webhook-URL:er och
API-nycklar ska läsas från miljövariabler och läggas som GitHub Secrets.

**3. Notifieringen ska inte sinka svaret.** Behöver ni inte invänta resultatet
kan ni låta anropet gå utan `await` — men fånga felet ändå, annars får ni en
ohanterad promise-rejection som kraschar Node.

---

## Alternativ 1: ntfy.sh — enklast

Push till mobil eller webbläsare. **Ingen registrering, inget konto, ingen
API-nyckel.** Ni väljer ett ämnesnamn och börjar skicka.

### Prova direkt i terminalen

```bash
curl -d "Hej från terminalen" ntfy.sh/dv1677-mitt-unika-amne-x7k2
```

Öppna `https://ntfy.sh/dv1677-mitt-unika-amne-x7k2` i webbläsaren eller
prenumerera i ntfy-appen (iOS/Android) — meddelandet dyker upp direkt.

### I koden

```js
// notify.js — hela integrationen
export async function notifiera(meddelande, rubrik = 'DV1677') {
  const topic = process.env.NTFY_TOPIC

  if (!topic) {
    console.warn('NTFY_TOPIC saknas — hoppar över notifiering')
    return
  }

  await fetch(`https://ntfy.sh/${topic}`, {
    method: 'POST',
    headers: {
      'Title': rubrik,
      'Priority': 'default',
      'Tags': 'calendar'        // emoji i notisen
    },
    body: meddelande
  })
}
```

```js
// .env
NTFY_TOPIC=dv1677-grupp8-a9f3k2mq
```

### ⚠️ Ämnesnamnet *är* hemligheten

ntfy har ingen inloggning på publika ämnen. Vem som helst som känner till eller
gissar ämnesnamnet kan både läsa era notiser och skicka egna.

Välj därför något långt och slumpmässigt — inte `bokningar` eller `dv1677`.
Behandla det som ett lösenord: i `.env`, som GitHub Secret, aldrig i en commit.

Det här är i sig en bra sak att skriva om i redovisningen — att känna igen när
något är "security through obscurity" och vad det innebär.

---

## Alternativ 2: Discord webhook

Nästan lika enkelt, och praktiskt om gruppen redan har en Discord-server.

### Skapa webhooken

Serverinställningar → Integrationer → Webhooks → Ny webhook → kopiera URL:en.

### I koden

```js
export async function notifieraDiscord(meddelande) {
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: meddelande })
  })
}
```

Vill ni ha det snyggare stöder Discord "embeds":

```js
body: JSON.stringify({
  embeds: [{
    title: 'Ny bokning',
    description: `${resurs.namn}\n${start} – ${slut}`,
    color: 0x00b0f4,
    timestamp: new Date().toISOString()
  }]
})
```

Webhook-URL:en innehåller en token och ger full rätt att posta i kanalen.
Den ska aldrig hamna i ett publikt repo — och absolut aldrig i en
`VITE_`-variabel, som bakas in i frontend-bygget och är läsbar för alla.

---

## Alternativ 3: E-post

Mer realistiskt för en riktig produkt, men högre tröskel: konto krävs, och
avsändardomänen måste oftast verifieras innan något kommer fram.

### Resend — minst friktion av e-posttjänsterna

```bash
npm install resend
```

```js
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function skickaMail(till, ämne, text) {
  await resend.emails.send({
    from: 'DV1677 <onboarding@resend.dev>',   // testavsändare, kräver ingen domän
    to: till,
    subject: ämne,
    text
  })
}
```

Resends testavsändare `onboarding@resend.dev` fungerar utan egen domän, men kan
bara skicka till den adress ni registrerat kontot med. Det räcker för att
demonstrera kravet.

Mailgun och SendGrid fungerar likartat men kräver mer uppsättning. **Räkna med
att e-post tar längst tid av alternativen** — välj det bara om ni har marginal.

---

### Per projekt

#### Texteditor

```js
// När ett dokument delas
await notifiera(
  `${req.user.email} delade "${dokument.title}" med dig`,
  'Dokument delat'
)

// När någon kommenterar
await notifiera(
  `Ny kommentar på "${dokument.title}" rad ${kommentar.line}`,
  'Ny kommentar'
)
```

Kombinerar ni med krav 1 och 3 blir det naturligt: notifiera **dokumentets
ägare**, inte den som skrev kommentaren.

#### Bokningssystem

```js
// Ny bokning
await notifiera(
  `${resurs.namn}\n${formatera(bokning.start)} – ${formatera(bokning.end)}`,
  'Bokning bekräftad'
)

// Avbokning
await notifiera(
  `Avbokad: ${resurs.namn} ${formatera(bokning.start)}`,
  'Bokning avbokad'
)
```

En påminnelse innan bokningen börjar är en naturlig utbyggnad, men kräver
schemaläggning (`node-cron` eller liknande) — bra om ni vill sträcka er.

---

### Struktur

Lägg notifieringarna i en egen modul med ett enda gränssnitt utåt. Då kan ni
byta kanal utan att röra routes:

```js
// services/notify.js
const KANAL = process.env.NOTIFY_CHANNEL || 'ntfy'

export async function notifiera(meddelande, rubrik) {
  try {
    if (KANAL === 'discord') return await notifieraDiscord(meddelande)
    if (KANAL === 'mail')    return await skickaMail(..., rubrik, meddelande)
    return await notifieraNtfy(meddelande, rubrik)
  }
  catch (error) {
    console.error('Notifiering misslyckades:', error.message)
  }
}
```

Det gör också testningen enklare — modulen går att mocka.

---

### Testa notifieringar

Ni vill inte skicka riktiga notiser varje gång testerna körs.

```js
import { vi } from 'vitest'

vi.mock('../services/notify.js', () => ({
  notifiera: vi.fn()
}))

it('notifierar när en bokning skapas', async () => {
  await request(app).post('/api/bookings').send({ ... }).expect(201)
  expect(notifiera).toHaveBeenCalledOnce()
})
```

Att verifiera att notifieringen **anropas** är det intressanta — inte att den
kommer fram.

---

### Referensrepon

Inget — kravet finns inte implementerat i referensapparna. Det är medvetet:
här bygger ni något eget.

Att luta sig mot ändå:
- `deploy-example-backend` — mönstret för `.env` och GitHub Secrets
- ntfy.sh dokumentation: https://docs.ntfy.sh

---

### Vanliga fallgropar

| Problem | Orsak |
|---------|-------|
| Bokningen misslyckas när notistjänsten är nere | Ingen `try/catch` runt notifieringen |
| `UnhandledPromiseRejection` kraschar servern | Anrop utan `await` och utan `.catch()` |
| Notiser kommer inte fram i produktion | Miljövariabeln saknas som GitHub Secret |
| Någon annan skickar notiser till er | Ämnesnamnet är för lätt att gissa |
| E-posten kommer aldrig fram | Avsändardomänen är inte verifierad |
| Webhook-URL:en läckte | Den låg i koden eller i en `VITE_`-variabel |

---

### Vad som redovisas

Beskriv vilken tjänst ni valt och varför, hur konfigurationen hanteras, och hur
ni ser till att ett misslyckat notifieringsanrop inte påverkar
huvudfunktionaliteten. Visa gärna en notis live.
