---
title: "Krav 4 — Projektspecifikt"
description: "Krav 4.1: code-mode med Monaco (texteditor). Krav 4.2: bokningslogik (bokningssystem)."
---

Det enda kravet som ser olika ut beroende på vilket projekt ni valt.

- **Krav 4.1, texteditor:** code-mode — dokument kan vara kod, med syntaxfärgning
- **Krav 4.2, bokningssystem:** bokningslogik — krockar, tillgänglighet, regler

---

## Krav 4.1 – Texteditor: code-mode med Monaco

Ett dokument ska kunna vara antingen text eller kod. Är det kod ska editorn ge
syntaxfärgning, radnummer och indentering — precis som VS Code, eftersom Monaco
*är* editorn från VS Code.

### Installation

```bash
npm install @monaco-editor/react
```

Använd wrappern, inte `monaco-editor` direkt. Den råa versionen kräver att ni
själva konfigurerar web workers i Vite, vilket är den enskilt vanligaste
anledningen till att folk fastnar flera timmar.

### Minsta möjliga användning

```jsx
import Editor from '@monaco-editor/react'

function CodeEditor({ value, onChange, language }) {
  return (
    <Editor
      height="60vh"
      language={language}          // 'javascript', 'python', 'json', ...
      value={value}
      onChange={onChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14
      }}
    />
  )
}
```

### Dokumenttypen sparas i databasen

```js
{
  _id: ObjectId,
  title: "min-fil.js",
  content: "function hej() { ... }",
  type: "code",            // "text" eller "code"
  language: "javascript",  // bara relevant när type === "code"
  owner: ObjectId
}
```

Växlingen mellan lägen är en `PUT` som uppdaterar `type`:

```js
router.put('/documents/:id/type', requireAuth, async (req, res) => {
  const { type, language } = req.body

  if (!['text', 'code'].includes(type)) {
    return res.status(400).json({ error: 'Ogiltig typ' })
  }

  await db.collection('documents').updateOne(
    { _id: new ObjectId(req.params.id), owner: req.user.id },
    { $set: { type, language: type === 'code' ? language : null } }
  )

  res.json({ message: 'Typ uppdaterad' })
})
```

Rendera sedan olika komponenter beroende på typ:

```jsx
{dokument.type === 'code'
  ? <CodeEditor value={...} language={dokument.language} onChange={...} />
  : <textarea value={...} onChange={...} />}
```

### Om ni också valt krav 2

Monaco och realtidsredigering går att kombinera, men var medvetna om att
`onChange` fyras av vid varje tangenttryckning. Strypa flödet:

```js
// Skicka inte vid varje tecken
const timer = useRef()

function handleChange(value) {
  clearTimeout(timer.current)
  timer.current = setTimeout(() => socket.emit('redigera', value), 300)
}
```

Utan detta skickar ni hundratals meddelanden i minuten.

### Referens

| Repo | Vad |
|------|-----|
| `coed-frontend` | Använder `@monaco-editor/react` ^4.6.0 — se `package.json` och `src/pages/EditorPage.jsx` |

---

## Krav 4.2 – Bokningssystem: bokningslogik

:::note
Glöm inte brokern — bokningarna ska göras mot den. Se [Brokern — bokningar i resource-booking](/projektet/broker/).
:::

Tre delar, i stigande svårighetsgrad: krockar, tillgänglighet, regler.

### 1. Krockar (overlap)

Två bokningar på samma resurs får inte överlappa i tid. Villkoret är kortare än
man tror, och lätt att skriva fel:

```
Två intervall överlappar om:   start_a < slut_b   OCH   start_b < slut_a
```

Notera att det är **strikt mindre än**. Använder ni `<=` räknas en bokning som
slutar 10:00 som krockande med en som börjar 10:00, vilket sällan är önskat.

```js
export function overlappar(a, b) {
  return a.start < b.end && b.start < a.end
}
```

I MongoDB, som en fråga:

```js
const krock = await db.collection('bookings').findOne({
  resource_id: resursId,
  start: { $lt: nySlut },
  end:   { $gt: nyStart }
})

if (krock) {
  return res.status(409).json({
    error: 'Tiden är redan bokad',
    krockarMed: krock._id
  })
}
```

**409 Conflict** är rätt statuskod här — inte 400. Förfrågan är välformad, den
går bara inte att genomföra i nuvarande läge.

⚠️ Kontrollen och insättningen sker inte i samma ögonblick. Två samtidiga
bokningar kan båda passera kontrollen. I kursen räcker det att ni är medvetna om
det och nämner det; lösningen är ett unikt index eller en transaktion.

### 2. Tillgänglighet (availability)

Vilka tider är lediga för en resurs en viss dag? Utgå från öppettiderna och dra
bort det som är bokat.

```js
export function ledigaTider(bokningar, dagStart, dagSlut) {
  const sorterade = [...bokningar].sort((a, b) => a.start - b.start)
  const luckor = []
  let markör = dagStart

  for (const b of sorterade) {
    if (b.start > markör) {
      luckor.push({ start: markör, end: b.start })
    }
    markör = b.end > markör ? b.end : markör
  }

  if (markör < dagSlut) {
    luckor.push({ start: markör, end: dagSlut })
  }

  return luckor
}
```

Testa den här funktionen ordentligt — den har många kantfall: inga bokningar,
en bokning som täcker hela dagen, bokningar som ligger kant i kant, bokningar
som överlappar varandra.

### 3. Regler (policy)

Verksamhetsregler ovanpå. Exempel:

```js
export function kontrolleraRegler(bokning, användarensBokningar) {
  const timmar = (bokning.end - bokning.start) / 3600000

  if (timmar > 4) {
    return { ok: false, fel: 'Max 4 timmar per bokning' }
  }

  if (bokning.start < Date.now()) {
    return { ok: false, fel: 'Kan inte boka bakåt i tiden' }
  }

  if (användarensBokningar.length >= 3) {
    return { ok: false, fel: 'Max 3 aktiva bokningar' }
  }

  return { ok: true }
}
```

Håll reglerna i rena funktioner utan databasanrop. Då går de att testa utan att
starta något — vilket kopplar direkt till krav 6.

### Referens

| Repo | Fil | Vad |
|------|-----|-----|
| `resource-booking-backend` | `domain/overlap.js` | Krockdetektering |
| `resource-booking-backend` | `domain/availability.js` | Lediga tider |
| `resource-booking-backend` | `domain/policy.js` | Verksamhetsreglerna |
| `resource-booking-backend` | `tests/domain.test.js` | **Läs den här** — visar hur ren logik testas |
| `resource-booking-backend` | `controllers/bookingController.js` | Hur delarna kopplas ihop |

Att logiken ligger i en egen `domain/`-katalog, skild från routes och databas,
är ett mönster värt att härma. Det gör den testbar och läsbar.

---

### Vanliga fallgropar

| Problem | Orsak |
|---------|-------|
| Monaco visar tom ruta | Ni använder `monaco-editor` direkt i stället för wrappern |
| Bokningar som slutar när nästa börjar räknas som krock | `<=` i stället för `<` |
| Två användare bokar samma tid | Kontroll och insättning är inte atomära — nämn det |
| Tidsjämförelser blir fel | Blandning av strängar och `Date` — bestäm ett format och håll er till det |
| Tidszoner spökar | Spara i UTC, formatera vid visning |

---

### Vad som redovisas

**Krav 4.1 (editor):** hur dokumenttypen sparas och hur editorn växlas. Nämn eventuell
samverkan med realtidsredigering.

**Krav 4.2 (bokning):** visa overlap-villkoret och motivera valet av statuskoder. Beskriv
vilka regler ni implementerat och varför.
