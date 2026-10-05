---
title: "Inlämning"
description: "Vad som ska lämnas in, och var."
sidebar:
  order: 5
---

## Inlämning

Läs igenom [Om projektet](/projektet/oversikt/), [Baseline](/projektet/baseline/),
[Arbetssätt](/projektet/arbetssatt/), kraven under [Kraven](/krav/oversikt/) och
[Bedömning och poäng](/projektet/bedomning/) innan ni lämnar in — det är dessa
sidor som avgör vad som förväntas och hur det bedöms.

Lämna in följande i uppgiften **3. Projekt** på Canvas:

### Länkar och repon
- Länkar till GitHub-repona och driftsatta applikationer (frontend och backend).
  Läraren ska sedan tidigare vara inbjuden till dessa med Write-behörighet.
- Länk till den avslutande **Pull Requesten från `dev` till `main`** — se
  [nedan](#den-avslutande-och-sista-pull-requesten) för vad den ska innehålla.

:::note[Resource-booking: README]
Om ni valt resource-booking ska backendens README även beskriva hur ni använder brokern — se [Dokumentera i README](/projektet/broker/#dokumentera-i-readme). Det gäller inte texteditor.
:::

### Den avslutande och sista Pull Requesten

En Pull Request består av två delar, och det är viktigt att hålla dessa isär:

| | |
| --- | --- |
| **Diffen** | Allt som skiljer `dev` från `main` — alltså **hela projektet**. Den blir stor, och det ska den vara. Det här är en release. |
| **Beskrivningen** | Den fria texten på PR:en. **Det är här er redovisning står** — kraven som rubriker, vilka kodfiler som är berörda och länken till videon. Vad som ska ingå per krav står under [Bedömning och poäng](/projektet/bedomning/#redovisningen-är-en-del-av-bedömningen). |

**Förvillkor:** innan ni öppnar den ska *alla* krav vara mergade till `dev`, och `dev` ska vara driftsatt och fungera. Den sista Pull Requesten är en avslutning och inlämning — inga krav ska implementeras i den. Dom ska redan finnas i dev-branchen.

**Merga den inte själva.** Öppna den, länka den i Canvas-inlämningen och låt den ligga. Lärare bedömer och reviewar den och **mergar den** som en del av bedömningen. Uppstår oklarheter och frågor som lämnas som kommentarer direkt i PR:en. Så, håll koll på eventuella kommentarer från lärare i er PR.

**Efter deadline - pusha inget till `dev`.** En Pull Request uppdateras automatiskt när branchen ändras, så en push efter deadline ändrar det som ska bedömas. Commit-datumen syns i PR:ens Commits-flik.

*En liten notis här;*
*lärare kommer att bedöma/granska/rätta utifrån er dev-branch - sedan sker en merge av PR mot main.*
*Tänk alltså på att gör PR från dev mot main.*
*Om något, mot all förmodan, skulle gå fel när lärare mergar till main så är det ändå ok - eftersom rättningen gjorts på dev.*

**Exempel på PR-beskrivning (kortat):**

```markdown
## Krav 1 — JWT-autentisering
Implementerat i `backend/middleware/auth.js` och `backend/routes/auth.js`.
Verifierar JWT i en middleware som körs före varje skyddad route.
Valde bort refresh-tokens — token förnyas genom ny inloggning.

## Krav 2 — WebSockets
Implementerat i `backend/sockets/document.js`.
...

Video: https://youtu.be/xxxxxxx
```

### Redovisningsvideo
Spela in en gemensam video där båda i paret syns (t.ex. via Zoom, som en
olistad YouTube-video eller via Canvas Studio):
- Visa och förklara koden för varje krav ni implementerat, ett i taget.
- Visa gärna upp något ni är extra stolta över.
- Håll er till max 10 minuter — det viktiga är att ni får med allt, inte längden.
- Länka till videon både i PR-beskrivningen och i uppgiften på Canvas.

### Deadline
Deadline är **1/11 kl 23:59**.

:::note[Inlämningen görs på Canvas]
Själva inlämningen görs i uppgiften [3. Projekt](https://bth.instructure.com/courses/7250/assignments/68576) på Canvas. Där finns även bedömningsmatrisen.
:::
