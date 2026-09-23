---
title: "Krav 6 — Fördjupad testning"
description: "Testa det ni byggt: enhetstester, integrationstester och felvägar."
---

**Gemensamt krav.** Gäller båda projekten.

Bygger direkt vidare på vecka 4. Skillnaden: då testade ni att API:t svarar.
Nu ska ni testa **de features ni faktiskt byggt**.

---

## Vad "fördjupad" betyder

Inte fler tester av samma sort. Tio ytterligare CRUD-tester ger ingenting.

Fördjupad testning betyder att ni testar det som är **svårt eller riskabelt**
i just er applikation:

- Logik med kantfall — krockar, behörighet, tillstånd
- Felvägarna, inte bara lyckade anrop
- De delar där en bugg skulle göra mest skada

Ett bra test är ett som skulle ha fångat en bugg ni faktiskt kunde ha gjort.

---

## Tre nivåer

| Nivå | Vad | Verktyg | Hastighet |
|------|-----|---------|-----------|
| **Enhet** | En funktion isolerat | Vitest | millisekunder |
| **Integration** | Route + databas | Vitest + Supertest | sekunder |
| **E2E** | Hela systemet via webbläsaren | Cypress | långsamt |

Lägg tyngdpunkten på enhets- och integrationsnivå. E2E är dyrt att underhålla
och går sönder av kosmetiska ändringar.

---

## Enhetstester — ren logik

Har ni brutit ut logiken i egna funktioner, som `domain/overlap.js` i
bokningsprojektet, blir testerna både snabba och lätta att skriva:

```js
import { describe, it, expect } from 'vitest'
import { overlappar } from '../domain/overlap.js'

describe('overlappar', () => {
  it('två bokningar som korsar varandra krockar', () => {
    expect(overlappar(
      { start: 10, end: 12 },
      { start: 11, end: 13 }
    )).toBe(true)
  })

  it('kant i kant krockar INTE', () => {
    expect(overlappar(
      { start: 10, end: 12 },
      { start: 12, end: 14 }
    )).toBe(false)
  })

  it('en bokning helt inuti en annan krockar', () => {
    expect(overlappar(
      { start: 10, end: 16 },
      { start: 12, end: 13 }
    )).toBe(true)
  })
})
```

Det mellersta testet är det värdefulla — det fångar `<=` mot `<`, vilket är den
klassiska buggen i overlap-kod.

**Går logiken inte att testa så här** ligger den förmodligen inbakad i en route
och borde brytas ut. Att testerna blir svåra är ofta ett tecken på att koden
behöver struktureras om.

---

## Integrationstester — testa felvägarna

Ni har redan mönstret från vecka 4. Det nya är att testa vad som händer när det
**inte** går bra:

```js
describe('POST /api/bookings', () => {
  it('skapar en bokning på en ledig tid', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ resource_id: resursId, start: '2026-10-01T10:00Z', end: '2026-10-01T11:00Z' })
      .expect(201)

    expect(res.body).toHaveProperty('_id')
  })

  it('vägrar boka en tid som redan är tagen', async () => {
    // Boka först
    await request(app).post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ resource_id: resursId, start: '2026-10-01T10:00Z', end: '2026-10-01T11:00Z' })

    // Försök boka överlappande
    const res = await request(app).post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ resource_id: resursId, start: '2026-10-01T10:30Z', end: '2026-10-01T11:30Z' })
      .expect(409)

    expect(res.body.error).toMatch(/bokad/i)
  })

  it('kräver inloggning', async () => {
    await request(app).post('/api/bookings').send({ ... }).expect(401)
  })

  it('låter inte en användare radera någon annans bokning', async () => {
    await request(app)
      .delete(`/api/bookings/${annansBokningId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
  })
})
```

De två sista är de viktigaste. **Ett API som inte testas för behörighet har ofta
hål i den.**

---

## Testa krav 1 — autentisering

```js
it('ger 401 utan token', async () => {
  await request(app).get('/api/documents').expect(401)
})

it('ger 401 med påhittad token', async () => {
  await request(app).get('/api/documents')
    .set('Authorization', 'Bearer inte-en-riktig-token')
    .expect(401)
})

it('visar bara användarens egna dokument', async () => {
  const res = await request(app).get('/api/documents')
    .set('Authorization', `Bearer ${tokenA}`)
    .expect(200)

  expect(res.body.every(d => d.owner === användareA)).toBe(true)
})
```

---

## Testa krav 2 — WebSockets

Går att testa, men kräver att ni startar servern och ansluter en riktig klient:

```js
import { io as Client } from 'socket.io-client'

it('skickar uppdatering till andra i rummet', async () => {
  const a = Client(`http://localhost:${port}`)
  const b = Client(`http://localhost:${port}`)

  await new Promise(r => { a.on('connect', r) })
  await new Promise(r => { b.on('connect', r) })

  a.emit('join', 'doc:1')
  b.emit('join', 'doc:1')

  const mottaget = new Promise(r => b.on('uppdatering', r))
  a.emit('redigera', { doc: '1', text: 'hej' })

  expect(await mottaget).toBe('hej')

  a.disconnect()
  b.disconnect()
})
```

Glöm inte att koppla ner klienterna — annars avslutas aldrig testkörningen.
Sätt en timeout så ett uteblivet meddelande ger ett tydligt fel i stället för
att hänga.

---

## Testa krav 5 — notifieringar

Mocka tjänsten. Ni vill inte skicka riktiga notiser i CI:

```js
vi.mock('../services/notify.js', () => ({ notifiera: vi.fn() }))

it('notifierar när en bokning skapas', async () => {
  await request(app).post('/api/bookings').send({ ... }).expect(201)
  expect(notifiera).toHaveBeenCalledOnce()
})

it('skapar bokningen även om notifieringen fallerar', async () => {
  notifiera.mockRejectedValueOnce(new Error('nätverksfel'))
  await request(app).post('/api/bookings').send({ ... }).expect(201)
})
```

Det andra testet är det intressanta — det verifierar att notifieringen inte kan
fälla huvudfunktionen.

---

## Frontend-tester

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('visar felmeddelande vid tom inmatning', async () => {
  render(<LoginForm />)

  await userEvent.click(screen.getByRole('button', { name: /logga in/i }))

  expect(screen.getByText(/fyll i/i)).toBeInTheDocument()
})
```

Testa **beteende**, inte implementation. `getByRole` och `getByText` speglar hur
en användare hittar saker; `getByTestId` gör det inte.

---

## Täckning — med måtta

```bash
npx vitest run --coverage
```

Användbart för att hitta kod ingen testat. Men jaga inte en siffra: 100 % täckning
med meningslösa tester är sämre än 60 % med tester som fångar riktiga fel.

Nämn gärna täckningen i redovisningen, men motivera *vad* ni valt att testa.

---

## Referensrepon

| Repo | Fil | Vad ni hittar |
|------|-----|---------------|
| `deploy-example-backend` | `tests/courses.test.js` | Grundmönstret från vecka 4 |
| `resource-booking-backend` | `tests/domain.test.js` | **Läs den här** — enhetstester av ren logik |
| `resource-booking-backend` | `tests/bookings.test.js` | Integrationstester inkl. krockar |
| `resource-booking-backend` | `tests/helpers/db.js` | Hur testdatabasen sätts upp |
| `coed-backend` | `tests/auth.test.js` | Tester av autentisering |
| `coed-backend` | `tests/helpers/testApp.js` | Återanvändbar testuppsättning |
| `auth_mongo` | `test/app.js` | Samma koncept i Mocha/Chai |
| `react-jsramverk-testing` | `src/` | Frontend: Vitest + Testing Library |

Obs: `react-jsramverk-testing` innehåller också Cypress standardexempel under
`cypress/e2e/2-advanced-examples/`. Det är biblioteksdemo, inte kursmaterial —
den egna koden är texteditor-komponenten.

---

## Vanliga fallgropar

| Problem | Orsak |
|---------|-------|
| Testkörningen avslutas aldrig | `closeDB()` eller `socket.disconnect()` saknas |
| Tester lyckas var för sig men inte ihop | De delar tillstånd — rensa mellan testerna |
| Tester mot produktionsdatabasen | `MONGODB_URI` överskrivs inte i `beforeAll` |
| Grönt lokalt, rött i CI | Tidszon, tidsberoende eller en fil som inte är committad |
| Slumpmässiga fel | Tester som beror på ordning eller på `Date.now()` |

---

## Vad som redovisas

Beskriv **vad** ni testat och **varför just det**. Ett resonemang om vilka
delar som var mest riskabla, och hur ni täckt dem, väger tyngre än antalet
tester. Nämn gärna vad ni medvetet valt bort och varför.
