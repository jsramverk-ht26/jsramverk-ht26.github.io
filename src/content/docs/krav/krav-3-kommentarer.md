---
title: "Krav 3 — Kommentarer"
description: "Kommentarer på dokument respektive bokningar. Bygger på krav 2."
---

**Gemensamt krav. Förutsätter krav 2 (WebSockets).**

Kommentarer ska dyka upp hos alla som tittar på samma sak, utan omladdning.
Väljer ni krav 3 måste ni alltså också välja krav 2 — annars finns inte
mekanismen som gör kommentarerna realtidsuppdaterade.

- **Texteditor:** kommentarer kopplade till rader i ett dokument
- **Bokningssystem:** kommentarer eller noteringar på en bokning

---

## Datamodellen är det svåra

Själva CRUD-delen är enkel. Det som kräver eftertanke är hur kommentaren binds
till rätt sak, och vad som händer när den saken ändras.

### Texteditor — kommentar på rad

```js
{
  _id: ObjectId,
  documentId: ObjectId,      // vilket dokument
  line: 42,                  // vilken rad
  text: "Den här funktionen saknar felhantering",
  author: ObjectId,          // vem (om krav 1 är valt)
  createdAt: ISODate,
  resolved: false
}
```

**Det verkliga problemet:** radnummer flyttar sig. Skriver någon in fem nya
rader ovanför, pekar kommentaren plötsligt på fel ställe.

Tre sätt att hantera det, i stigande svårighetsgrad:

1. **Acceptera driften.** Enklast, och fullt rimligt i kursen. Beskriv
   begränsningen i redovisningen — att veta om sina begränsningar är också
   kunskap.
2. **Flytta kommentarerna** när rader läggs till eller tas bort ovanför. Kräver
   att ni vet var ändringen skedde.
3. **Ankra i texten** i stället för i radnumret — spara ett textutdrag och leta
   upp det igen. Robustare, men kan misslyckas om texten ändras.

Välj medvetet och motivera valet.

### Bokningssystem — kommentar på bokning

```js
{
  _id: ObjectId,
  bookingId: ObjectId,
  text: "Behöver projektor",
  author: ObjectId,
  createdAt: ISODate
}
```

Enklare, eftersom en bokning inte ändrar form. Här är frågan i stället:
**vad händer med kommentarerna när bokningen tas bort?**

```js
// Städa upp — annars blir kommentarerna föräldralösa och ligger kvar för alltid
await db.collection('comments').deleteMany({ bookingId: new ObjectId(id) })
await db.collection('bookings').deleteOne({ _id: new ObjectId(id) })
```

---

## Routes

```js
// Hämta kommentarer för ett dokument / en bokning
router.get('/documents/:id/comments', requireAuth, async (req, res) => {
  const comments = await db.collection('comments')
    .find({ documentId: new ObjectId(req.params.id) })
    .sort({ createdAt: 1 })
    .toArray()

  res.json(comments)
})

// Skapa
router.post('/documents/:id/comments', requireAuth, async (req, res) => {
  const comment = {
    documentId: new ObjectId(req.params.id),
    line: req.body.line,
    text: req.body.text,
    author: req.user.id,
    createdAt: new Date()
  }

  const result = await db.collection('comments').insertOne(comment)

  // Realtid: tala om för alla som har dokumentet öppet
  io.to(`doc:${req.params.id}`).emit('comment:created', {
    _id: result.insertedId,
    ...comment
  })

  res.status(201).json({ _id: result.insertedId, ...comment })
})
```

Lägg märke till att `emit` sker **efter** att kommentaren sparats. Skickar ni
före riskerar ni att visa en kommentar som aldrig hamnade i databasen.

---

## Klientsidan

```jsx
useEffect(() => {
  const socket = io(import.meta.env.VITE_API_URL)
  socket.emit('join', `doc:${documentId}`)

  socket.on('comment:created', (kommentar) => {
    setKommentarer(prev => [...prev, kommentar])
  })

  socket.on('comment:deleted', (id) => {
    setKommentarer(prev => prev.filter(k => k._id !== id))
  })

  return () => socket.disconnect()
}, [documentId])
```

**Undvik dubbletter.** Den som skrev kommentaren lägger ofta till den lokalt
direkt för att gränssnittet ska kännas snabbt — och får den sedan en gång till
via socketen. Antingen använder ni `socket.to()` på servern så avsändaren inte
får eko, eller så filtrerar ni på `_id` i klienten.

---

## Behörighet

Om krav 1 också är valt: bara den som skrivit en kommentar ska kunna ta bort
den. Eventuellt också dokumentets eller bokningens ägare.

```js
const comment = await db.collection('comments').findOne({ _id: new ObjectId(id) })

if (comment.author.toString() !== req.user.id) {
  return res.status(403).json({ error: 'Inte din kommentar' })
}
```

Skillnaden mellan 401 och 403 är värd att få rätt: **401** betyder "jag vet inte
vem du är", **403** betyder "jag vet vem du är, och du får inte".

---

## Referensrepon

| Repo | Fil | Vad ni hittar |
|------|-----|---------------|
| `coed-backend` | `controllers/commentController.js` | CRUD för radkommentarer |
| `coed-backend` | `routes/comments.js` | Route-uppsättningen |
| `coed-backend` | `tests/comments.test.js` | Hur de testas |
| `coed-frontend` | `src/components/comments/CommentPanel.jsx` | Panelen som visar dem |
| `coed-frontend` | `src/api/commentService.js` | API-anropen |
| `resource-booking-backend` | `controllers/commentController.js`, `routes/comments.js` | Samma sak, bokningsdomänen |
| `resource-booking-frontend` | `src/api/comments.js` | Klientsidan |

---

## Vanliga fallgropar

| Problem | Orsak |
|---------|-------|
| Kommentaren syns två gånger hos avsändaren | Lokalt tillägg + eko från socketen |
| Kommentarer pekar på fel rad efter redigering | Radnummer flyttar sig — se ovan |
| Kommentarer ligger kvar efter raderat dokument | Ingen uppstädning |
| `Cast to ObjectId failed` | Ni jämför en sträng med ett ObjectId — använd `new ObjectId(...)` |
| Alla kan radera allas kommentarer | Ägarkontrollen saknas |

---

## Vad som redovisas

Beskriv datamodellen, hur kommentaren binds till sitt objekt, och hur ni löst
realtidsuppdateringen. Är ni medvetna om en begränsning — som att radnummer
driver — så skriv det. Det räknas som styrka, inte svaghet.
