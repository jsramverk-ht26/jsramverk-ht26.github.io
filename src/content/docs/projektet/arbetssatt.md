---
title: "Arbetssätt"
description: "Branch-strategi, driftsättning under projektet och den avslutande Pull Requesten."
sidebar:
  order: 3
---

## Arbetssätt

Under projektdelen arbetar grupperna självständigt. Det finns inga schemalagda genomgångar, men det erbjuds synk-möten med lärare om behov finns — självklart finns det möjlighet att kontakt lärare via mail eller t ex Discord under hela projektperioden.


## **INSTRUKTIONER FÖR BRANCHES OCH SISTA PR I PROJEKTET**

### Branch-strategi

Ni arbetar med två brancher under projektet:

| | |
| --- | --- |
| `main` | Den släppta versionen - release. Här ligger det ni lämnade in i vecka 5. **Rör inte `main` under projektet** — commita INTE direkt dit. Gör ni det uppstår konflikter i den avslutande mergen vilket inte blir bra vid bedömninen av era projekt; låter ni bli blir den konfliktfri. |
| `dev` | Det ni arbetar i. Härifrån driftssätts era applikationer under projektet. |

För att förtydliga:
1. Skapa `dev` från `main` när projektet startar.
2. Skapa en **feature branch per krav**, namngiven efter kravet — till exempel `feature/krav-2-websockets`. Då blir listan av Pull Requests självförklarande, och varje krav går att granska för sig.
3. Gör en Pull Request från feature branchen till `dev` och merga den **när kravet fungerar och är beskrivet** — inte i slutet. Annars sitter ni med sex parallella brancher i vecka 10.
4. Vid inlämningen: en sista Pull Request från `dev` till `main`. Se nästa avsnitt.

### Driftssättning/deploy under projektet - VIKTIGT

Era workflows är i nuläget ställda att driftssätta från `main (enligt deploy.yml)`.
Arbetar ni i `dev` innebär det att era driftsatta applikationer står stilla på senaste inlämningen ni gjort, dvs från kursvvecka 5 — och att länkarna ni lämnar in inte innehåller de krav ni byggt.

Lägg därför till `dev` som ***trigger*** i både backendens och frontendens `deploy.yml`:

```yaml
on:
  push:
    branches: [main, dev]
```

Då gäller: **`dev` är det som körs och demonstreras, `main` är släppet.**
Detta för att ni ska hantera flödet precis som i yrkeslivet mellan test- och produktionsmiljö.
En slags praxis att gör någon form av uppdelning på det här sättet.

### Den avslutande och sista Pull Requesten

En Pull Request består av två delar, och det är viktigt att hålla dessa isär:

| | |
| --- | --- |
| **Diffen** | Allt som skiljer `dev` från `main` — alltså **hela projektet**. Den blir stor, och det ska den vara. Det här är en release. |
| **Beskrivningen** | Den fria texten på PR:en. **Det är här er redovisning står** — kraven som rubriker, permalänkar till koden och länken till videon. Vad som ska ingå per krav står under "Bedömning och poäng" längre ner på den här sidan. |

**Förvillkor:** innan ni öppnar den ska *alla* krav vara mergade till `dev`, och `dev` ska vara driftsatt och fungera. Den sista Pull Requesten är en avslutning och inlämning — inga krav ska implementeras i den. Dom ska redan finnas i dev-branchen.

**Merga den inte själva.** Öppna den, länka den i Canvas-inlämningen och låt den ligga. Lärare bedömer och reviewar den och **mergar den** som en del av bedömningen. Uppstår oklarheter och frågor som lämnas som kommentarer direkt i PR:en. Så, håll koll på eventuella kommentarer från lärare i er PR

**Efter deadline - pusha inget till `dev`.** En Pull Request uppdateras automatiskt när branchen ändras, så en push efter deadline ändrar det som ska bedömas. Commit-datumen syns i PR:ens Commits-flik.

*En liten notis här;*
*lärare kommer att bedöma/granska/rätta utifrån er dev-branch - sedan sker en merge av PR mot main.*
*Tänk alltså på att gör PR från dev mot main.*
*Om något, mot all förmodan, skulle gå fel när lärare mergar till main så är det ändå ok - eftersom rättningen gjorts på dev.*
