---
title: "Krav 2 — WebSockets och realtid"
description: "Realtid med Socket.io — serveruppsättning, rum och klientsida i React."
---

**Gemensamt krav.** Gäller båda projekten, men med olika innehåll.

- **Texteditor:** flera användare redigerar samma dokument och ser varandras
  ändringar direkt
- **Bokningssystem:** bokningskalendern uppdateras hos alla när någon bokar
  eller avbokar

---

## Varför inte bara HTTP

HTTP är enkelriktat: klienten frågar, servern svarar. Vill ni veta om något
ändrats måste ni fråga igen.

```js
// Polling — fungerar, men är slöseri
setInterval(() => hämtaBokningar(), 2000)
```

Med en WebSocket är förbindelsen öppen åt båda håll. Servern kan skicka när
något händer, utan att bli tillfrågad.

**Socket.io** är ett bibliotek ovanpå WebSockets som lägger till rum,
återanslutning och fallback. Det är det vi använder i kursen.

---

## Serversidan

### Ni startar ingen andra server

Det här är den vanligaste missuppfattningen, så vi tar den först.

Socket.io körs i **samma process, på samma port, bakom samma domän** som ert
API. Ni öppnar ingen ny port i brandväggen, lägger inte till något i Caddy och
startar ingen andra container. Efteråt svarar `https://dv1677-<er-vps>.nplab.bth.se`
både på `/api/...` som förut och på WebSocket-anslutningar.

På serversidan ändras **`server.js`** — och senare några rader i `app.js`, när
API:t ska kunna skicka meddelanden. Inget annat.

| Fil | Vad som händer |
|-----|----------------|
| `server.js` | Ersätts — skapar HTTP-servern explicit och startar Socket.io |
| `app.js` | Tre rader middleware, så att routes kan nå `io` |
| `routes.js` | `req.io.to(...).emit(...)` där något ska skickas |
| *(klienten)* | `socket.io-client` i en `useEffect` |

### Varför filen måste ändras

`app.listen(3000)` ser ut som att Express startar servern, men det gör den
inte — den skapar en `http.Server` åt er i bakgrunden och startar den.

Socket.io behöver komma åt just den servern för att kunna haka på. Eftersom
Express gömmer den måste ni skapa den själva i stället. Ni **lägger alltså inte
till en server, ni gör den befintliga synlig.**

### `server.js` — före och efter

```js
// FÖRE (som ni skrev den i vecka 4)
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

```js
// EFTER — hela filen ersätts
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';

const PORT = process.env.PORT || 3000;

// Samma server som app.listen() skapade åt er — nu synlig
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*' }        // ← Socket.io har EGEN cors-konfiguration
});

io.on('connection', (socket) => {
  console.log('ansluten:', socket.id);

  socket.on('join', (rum) => {
    socket.join(rum);
  });

  socket.on('disconnect', () => {
    console.log('frånkopplad:', socket.id);
  });
});

// Notera: httpServer.listen, INTE app.listen
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

⚠️ **Behåll inte `app.listen()` kvar.** Har ni både den och `httpServer.listen()`
försöker två servrar ta samma port och ni får `EADDRINUSE: address already in
use`. Det är rätt fel att få — det betyder att ni verkligen bara ska ha en server.

### `app.js` rörs inte — och det är poängen

Hela ändringen ligger i `server.js`. `app.js` exporterar fortfarande bara
Express-appen, vilket betyder att **era tester från vecka 4 fortsätter fungera
oförändrat**:

```js
import app from '../app.js'    // ← vet fortfarande ingenting om Socket.io
request(app).get('/api/courses').expect(200)
```

Det är nu uppdelningen `app.js` / `server.js` betalar sig. Hade allt legat i en
fil hade testerna startat en socket-server vid varje körning.

### Socket.io har egen CORS

⚠️ **`app.use(cors())` i Express räcker inte.** Socket.io sätter upp egna
anslutningar vid sidan av Express och har en separat `cors`-inställning — den i
`new Server(...)` ovan. Glöms den fungerar allt lokalt men inte när frontenden
ligger på GitHub Pages.

Två olika CORS-inställningar i samma fil är förvirrande men korrekt: en för
HTTP-anropen, en för socket-anslutningen.

### Rum — skicka bara till dem det berör

Utan rum går varje meddelande till alla anslutna. Med rum går det bara till dem
som tittar på samma dokument eller resurs.

```js
socket.on('join', (dokumentId) => {
  socket.join(`doc:${dokumentId}`)
})

// Skicka till alla i rummet UTOM avsändaren
socket.to(`doc:${dokumentId}`).emit('uppdatering', data)

// Skicka till alla i rummet INKLUSIVE avsändaren
io.to(`doc:${dokumentId}`).emit('uppdatering', data)
```

Skillnaden mellan `socket.to()` och `io.to()` är en vanlig källa till buggar —
den ena ger eko tillbaka till den som skrev, den andra inte.

---

## Hur `io` når era routes

Nu kommer frågan som alla fastnar på.

De flesta meddelanden ska inte skickas när någon ansluter, utan **när något
händer i API:t** — en bokning skapas, ett dokument sparas. Den koden ligger i
`routes.js` eller i en controller. Men `io` skapades i `server.js`, och
`routes.js` kan inte se den.

Det går att lösa på flera sätt. **Använd det här**, eftersom det är vad båda
referensapparna gör:

### 1. Häng på `io` i varje request — i `app.js`

```js
// app.js
const app = express();

// Måste ligga FÖRE app.use('/api', routes)
app.use((req, res, next) => {
  req.io = app.get('io');
  next();
});

app.use(express.json());
app.use('/api', routes);
```

### 2. Lägg in instansen — i `server.js`

```js
// server.js, efter att io skapats
const io = new Server(httpServer, { cors: { origin: '*' } });

app.set('io', io);        // ← gör io åtkomlig för middlewaren i app.js
```

### 3. Använd den — i routen

```js
// routes.js
router.post('/bookings', async (req, res) => {
  const db = await connectDB();
  const result = await db.collection('bookings').insertOne(req.body);

  // Skicka till alla som tittar på den här resursen
  req.io.to(`resource:${req.body.resource_id}`).emit('booking:created', {
    _id: result.insertedId,
    ...req.body
  });

  res.status(201).json({ _id: result.insertedId });
});
```

### Varför just så

`app.set()` / `app.get()` är Express egen inbyggda lagring för sådant här — ni
behöver ingen extra fil och ingen global variabel. Och eftersom `req.io` finns
på varje request slipper ni skicka runt instansen som argument genom flera lager.

⚠️ **Testerna.** `app.js` importeras av testerna utan att `server.js` körts, så
`app.get('io')` är `undefined` där. Anropar en route `req.io.emit(...)` kraschar
testet. Antingen gör ni anropet villkorligt:

```js
req.io?.to(rum).emit('booking:created', data);
```

…eller så sätter ni en attrapp i testfilen. Det första är enklast och fullt
godtagbart — det säger "finns ingen socket-server, hoppa över".

### I referensapparna

Samma mönster, med skillnaden att de inte delat upp `app.js` och `server.js` —
allt ligger i `server.js` och middlewaren sätter `req.io = io` direkt.

| Repo | Fil | Rad |
|------|-----|-----|
| `resource-booking-backend` | `server.js` | 43 — `req.io = io` |
| `resource-booking-backend` | `controllers/bookingController.js` | 42 — `req.io.emit(...)` |
| `coed-backend` | `server.js` | 67 — `req.io = io` |

---

## Klientsidan i React

```bash
npm install socket.io-client
```

```jsx
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

function Dokument({ id }) {
  const [text, setText] = useState('')

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL)

    socket.emit('join', id)

    socket.on('uppdatering', (ny) => setText(ny))

    // ⚠️ Utan den här raden öppnas en ny socket varje gång komponenten
    // renderas om, och de gamla stängs aldrig.
    return () => socket.disconnect()
  }, [id])

  return <textarea value={text} onChange={...} />
}
```

Tre saker som går fel:

**1. Ingen uppstädning.** Returfunktionen i `useEffect` måste stänga socketen.
Annars har ni efter en stunds klickande tjugo öppna anslutningar som alla tar
emot samma meddelanden — och texten börjar hoppa.

**2. Socketen i state.** Lägg den inte i `useState`. Den behöver inte orsaka
omrendering. En `useRef` eller en lokal variabel i effekten räcker.

**3. Beroendelistan.** Har ni `[]` när ni borde ha `[id]` byter ni aldrig rum
när användaren öppnar ett annat dokument.

---

## Per projekt

### Texteditor — realtidsredigering

Rummet är dokumentet. När någon skriver skickas ändringen till alla andra som
har dokumentet öppet.

```js
// klient: skicka vid varje ändring
socket.emit('redigera', { doc: id, text: nyText })
```

```js
// server.js — INNE i io.on('connection', ...), bredvid 'join'
socket.on('redigera', ({ doc, text }) => {
  socket.to(`doc:${doc}`).emit('uppdatering', text)
})
```

Här behövs inget `req.io`: meddelandet kommer in via socketen och går ut via
socketen, utan att passera någon route. Det är först när **API:t** ska utlösa ett
meddelande som ni behöver mönstret från avsnittet ovan.

Enklaste varianten skickar hela texten. Det fungerar bra för kursens storlekar
och är lätt att förstå. Vill ni gå längre finns operational transformation och
CRDT — men det är forskningsnivå, och inget vi kräver.

**Spara till databasen med fördröjning**, inte vid varje tangenttryckning:

```js
// debounce — spara först när användaren pausat
clearTimeout(timer)
timer = setTimeout(() => sparaTillDb(text), 1000)
```

### Bokningssystem — realtidskalender

Rummet är resursen. När en bokning skapas eller tas bort får alla som tittar på
den resursen veta det.

Det här är fallet som kräver `req.io` — meddelandet utlöses av ett vanligt
POST-anrop, inte av socketen:

```js
// routes.js — i routen som skapar bokningen, efter att den sparats
const booking = await db.collection('bookings').insertOne(data)

req.io?.to(`resource:${data.resource_id}`).emit('booking:created', {
  _id: booking.insertedId,
  ...data
})
```

**Emitta efter att databasen svarat, aldrig före.** Skickar ni först och sparar
sedan kommer alla andra att se en bokning som kanske aldrig blev av.

Klienten lägger till bokningen i sin lista utan att hämta om allt:

```jsx
socket.on('booking:created', (b) => {
  setBokningar(prev => [...prev, b])
})
```

Poängen blir tydlig om två personer försöker boka samma tid samtidigt — den ena
ser den andras bokning dyka upp innan hen hinner klicka.

---

## Referensrepon

| Repo | Fil | Vad ni hittar |
|------|-----|---------------|
| `jsramverk-socket-server` | `app.mjs` | Minsta möjliga Socket.io-server. Börja här. |
| `coed-backend` | `socket/collaboration.js` | Realtidsredigering, rum per dokument |
| `coed-frontend` | `src/hooks/useCollaboration.js` | Klientsidan som en egen hook |
| `resource-booking-backend` | `socket/bookings.js` | Events för bokningar |
| `resource-booking-frontend` | `src/hooks/useSocket.js` | Återanvändbar socket-hook |

Att lägga socket-logiken i en egen hook, som båda referensapparna gör, är värt
att härma — det håller komponenterna läsbara och uppstädningen på ett ställe.

---

## Vanliga fallgropar

| Problem | Orsak |
|---------|-------|
| `EADDRINUSE` vid start | Både `app.listen()` och `httpServer.listen()` är kvar |
| `Cannot read properties of undefined (reading 'to')` | `req.io` saknas — middlewaren i `app.js` ligger efter `app.use('/api', routes)`, eller `app.set('io', io)` är inte gjort |
| Testerna kraschar efter socket-ändringen | `app.get('io')` är `undefined` i testerna — använd `req.io?.` |
| Fungerar lokalt, inte deployat | Socket.io:s egen `cors`-konfiguration saknas |
| Meddelanden kommer flera gånger | Socketen städas inte i `useEffect`-returen |
| Alla ser allas ändringar | Ni använder `io.emit()` i stället för rum |
| Egen text hoppar/dubbleras | `io.to()` där det borde vara `socket.to()` |

**Om ni kör nginx i stället för Caddy:** nginx släpper inte igenom uppgraderingen
till WebSocket utan att bli tillsagd, och anslutningen faller tillbaka till
polling eller dör. Lägg till i er `location`-block:

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

**Caddy behöver ingen konfiguration för det här** — `reverse_proxy` hanterar
uppgraderingen automatiskt. Kör ni Caddy och anslutningen ändå inte fungerar,
leta någon annanstans.

---

## Vad som redovisas

Beskriv vilka events ni definierat, hur rummen är uppdelade, och hur ni hanterar
uppstädning på klienten. Visa gärna två webbläsarfönster sida vid sida.
