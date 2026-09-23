---
title: "Krav 1 — JWT-autentisering"
description: "Registrering, inloggning och skyddade routes med JSON Web Tokens."
---

**Gemensamt krav.** Gäller båda projekten.

Användare ska kunna registrera sig och logga in. Inloggad användare ser och
redigerar bara sitt eget innehåll. Routes som kräver inloggning ska vara
skyddade.

---

## Vad en JWT är

En signerad textsträng som servern ger ut vid lyckad inloggning. Den innehåller
vem användaren är, och en signatur som bevisar att servern skrivit den.

```
eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjY2ZiIsImVtYWlsIjoiYUBiLnNlIn0.k4_mT...
   header              payload (base64)                      signatur
```

**Payloaden är inte krypterad.** Vem som helst kan läsa den — testa att klistra
in en token på jwt.io. Det som skyddas är att den inte går att *ändra* utan att
signaturen går sönder.

Lägg därför aldrig något känsligt i payloaden. Användar-id och e-post räcker.

---

## Flödet

```
1. POST /api/auth/register  → lösenordet hashas, användaren sparas
2. POST /api/auth/login     → lösenordet jämförs, token skapas och returneras
3. GET  /api/documents      → klienten skickar token i Authorization-headern
                              middleware verifierar den innan routen körs
```

---

## Backend

### Hasha lösenordet — aldrig spara det i klartext

```js
import bcrypt from 'bcryptjs'

// Vid registrering
const hash = await bcrypt.hash(password, 10)
await db.collection('users').insertOne({ email, password: hash })

// Vid login
const user = await db.collection('users').findOne({ email })
const ok = user && await bcrypt.compare(password, user.password)

if (!ok) {
  // Samma svar oavsett om e-posten eller lösenordet var fel —
  // annars avslöjar ni vilka e-postadresser som finns
  return res.status(401).json({ error: 'Fel e-post eller lösenord' })
}
```

### Skapa token

```js
import jwt from 'jsonwebtoken'

const token = jwt.sign(
  { id: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '2h' }
)

res.json({ token })
```

`JWT_SECRET` ska ligga i `.env` och som GitHub Secret — **aldrig i koden**.
Läcker den kan vem som helst skriva giltiga tokens.

### Middleware som skyddar routes

```js
// middleware/auth.js
import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Ingen token' })
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  }
  catch (error) {
    return res.status(401).json({ error: 'Ogiltig token' })
  }
}
```

Använd den på de routes som ska skyddas:

```js
router.get('/documents', requireAuth, async (req, res) => { ... })
```

### Bara eget innehåll

Det här är den del som oftast missas. Det räcker inte att kräva inloggning —
ni måste också filtrera på **vem** som är inloggad:

```js
// Rätt: bara användarens egna dokument
const docs = await db.collection('documents')
  .find({ owner: req.user.id })
  .toArray()

// Fel: alla dokument, så fort man har en giltig token
const docs = await db.collection('documents').find({}).toArray()
```

Samma sak vid uppdatering och radering — kontrollera ägarskapet, annars kan en
inloggad användare ändra någon annans data genom att gissa ett id.

```js
const result = await db.collection('documents').updateOne(
  { _id: new ObjectId(req.params.id), owner: req.user.id },   // ← båda villkoren
  { $set: req.body }
)

if (result.matchedCount === 0) {
  return res.status(404).json({ error: 'Hittades inte' })
}
```

---

## Frontend

Spara token efter login och skicka med den i varje anrop:

```js
// Efter lyckad login
localStorage.setItem('token', data.token)

// I API-anropen
const res = await fetch(`${BASE_URL}/api/documents`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
```

En `AuthContext` gör att alla komponenter kommer åt inloggningsläget utan att
skicka props genom hela trädet. Se referensapparna nedan.

**Skyddade routes i React** — skicka vidare till login om token saknas:

```jsx
function ProtectedRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}
```

Observera att detta bara döljer gränssnittet. **Den riktiga säkerheten ligger i
backend** — någon kan alltid anropa ert API direkt med curl.

---

## Per projekt

**Texteditor:** dokument får ett `owner`-fält. Listan visar bara egna dokument.
Vill ni kombinera med delning senare blir fältet en array av användare i stället.

**Bokningssystem:** bokningar får ett `user`-fält. Användaren ser sina egna
bokningar, men *resurserna* är gemensamma och ska synas för alla. Tänk igenom
vilka routes som ska skyddas och vilka som ska vara öppna.

---

## Referensrepon

| Repo | Fil | Vad ni hittar |
|------|-----|---------------|
| `auth_mongo` | `models/auth.js`, `route/auth.js` | Komplett register/login, minsta möjliga exempel |
| `auth_mongo` | `test/app.js` | Tester för autentiseringen |
| `coed-backend` | `middleware/auth.js` | Middleware-mönstret |
| `coed-backend` | `controllers/authController.js` | Register, login, hashning |
| `coed-frontend` | `src/context/AuthContext.jsx` | Inloggningsläge i React |
| `coed-frontend` | `src/components/auth/ProtectedRoute.jsx` | Skyddade routes |
| `resource-booking-backend` | `middleware/auth.js`, `controllers/authController.js` | Samma mönster, bokningsdomänen |
| `resource-booking-frontend` | `src/context/AuthContext.jsx`, `src/api/auth.js` | Klientsidan |

Börja med `auth_mongo` — det är minst och gjort för att läsas.

---

## Vanliga fallgropar

| Problem | Orsak |
|---------|-------|
| Token fungerar men alla ser allas data | Ni glömde filtrera på `req.user.id` |
| `jwt malformed` | Headern saknar `Bearer ` framför token |
| Fungerar lokalt, inte deployat | `JWT_SECRET` saknas som GitHub Secret |
| Alla loggas ut vid omstart | `JWT_SECRET` genereras slumpmässigt vid start — lägg den i `.env` |
| Lösenord syns i databasen | Ni sparade `password` i stället för hashen |

---

## Vad som redovisas

Beskriv i redovisningen vilka routes som är skyddade, hur ägarskapet kontrolleras,
och var `JWT_SECRET` hanteras. Visa gärna ett anrop utan token som ger 401.
