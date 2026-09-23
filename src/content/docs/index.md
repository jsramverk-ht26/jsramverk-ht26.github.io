---
title: Projektkraven
description: Fördjupning och kodexempel för de sex kraven i projektet, DV1677 HT26.
---

Det här är fördjupningen till projektets sex krav — förklaringar, kodexempel för
**båda projektalternativen**, och pekare in i referensapparna.

:::note[Canvas gäller före den här sidan]
Reglerna finns på Canvas: vilka krav som finns, hur många ni måste välja,
poängsättningen och deadline. **Står något olika är det Canvas som gäller.**
Den här sidan förklarar bara *hur* man gör.
:::

## Kraven

| # | Krav | Gäller |
|---|------|--------|
| [1](/krav/krav-1-jwt-autentisering/) | JWT-autentisering | Båda |
| [2](/krav/krav-2-websockets/) | WebSockets och realtid | Båda |
| [3](/krav/krav-3-kommentarer/) | Kommentarer | Båda — **kräver krav 2** |
| [4](/krav/krav-4-projektspecifikt/) | Projektspecifikt | Olika per projekt |
| [5](/krav/krav-5-notifieringar/) | Notifieringar | Båda |
| [6](/krav/krav-6-fordjupad-testning/) | Fördjupad testning | Båda |

Ni väljer **minst tre**. Krav 3 förutsätter krav 2 — väljer ni krav 3 räknas de
båda som två av era krav.

## Läs det här först

Varje artikel har samma uppbyggnad:

- **Vad kravet innebär**, och vad det betyder för just ert projekt
- **Kodexempel** för backend och frontend
- **Referensrepon** — var i de färdiga apparna ni hittar samma sak
- **Vanliga fallgropar** — det som faktiskt går fel
- **Vad som redovisas** — vad ni måste beskriva för att kravet ska räknas som uppfyllt

Sista punkten är viktigare än den ser ut. Flera krav är avsiktligt fritt hållna,
och då flyttas bördan till er att beskriva vad ni valde och varför.

## Var finns vad i referensapparna

| Krav | coed (texteditor) | resource-booking (bokning) |
|------|-------------------|----------------------------|
| 1 | `middleware/auth.js`, `controllers/authController.js` | samma filer |
| 2 | `socket/collaboration.js` | `socket/bookings.js` |
| 3 | `controllers/commentController.js` | `controllers/commentController.js` |
| 4 | `src/pages/EditorPage.jsx` (Monaco) | `domain/overlap.js`, `availability.js`, `policy.js` |
| 5 | — | — |
| 6 | `tests/auth.test.js`, `tests/comments.test.js` | `tests/domain.test.js` |

**Krav 5 finns inte implementerat i någon av referensapparna.** Det är medvetet —
här bygger ni något eget, och koden är liten nog att klara utan förlaga.

Repona ligger i [jsramverk-ht26](https://github.com/jsramverk-ht26):
[coed-backend](https://github.com/jsramverk-ht26/coed-backend) ·
[coed-frontend](https://github.com/jsramverk-ht26/coed-frontend) ·
[resource-booking-backend](https://github.com/jsramverk-ht26/resource-booking-backend) ·
[resource-booking-frontend](https://github.com/jsramverk-ht26/resource-booking-frontend) ·
[auth_mongo](https://github.com/jsramverk-ht26/auth_mongo)
