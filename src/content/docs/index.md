---
title: Projektet
description: Allt om projektet i DV1677 — de två alternativen, baseline, arbetssätt, de sex kraven och hur projektet bedöms.
---

Här finns **all information om projektet** i DV1677 — JavaScript-baserade
webbramverk. Projektet löper under kursens sista fem veckor, vecka 6–10, och
det är det som avgör ert slutbetyg.

## Vad som finns här

### Om projektet

[**Om projektet**](/projektet/oversikt/) — de två alternativen, texteditor och
bokningssystem, med bakgrunden till vart och ett och vad ni faktiskt bygger.

[**Baseline**](/projektet/baseline/) — miniminivån som ska fungera oavsett
vilka krav ni väljer. Det är grunden kraven byggs ovanpå.

[**Arbetssätt**](/projektet/arbetssatt/) — branch-strategin med `dev`, hur
driftsättningen måste ställas om under projektet, och hur den avslutande Pull
Requesten fungerar. **Läs det här innan ni börjar koda** — särskilt
deploy-avsnittet, som annars gör att era driftsatta appar står stilla hela
projektet.

[**Brokern**](/projektet/broker/) — gäller **resource-booking**: all bokning går via en broker mot riktiga, isolerade resurser. Förklaring, API-referens och kodexempel.

### Kraven

[**Kraven — översikt**](/krav/oversikt/) — de sex kraven i kortform. Ni väljer
**minst tre**.

Varje krav har sedan en egen sida med förklaringar, kodexempel för **båda**
projektalternativen, vanliga fallgropar och vad som måste redovisas:

| # | Krav | |
|---|------|---|
| 1 | [JWT-autentisering](/krav/krav-1-jwt-autentisering/) | Registrering, inloggning, skyddade routes |
| 2 | [WebSockets och realtid](/krav/krav-2-websockets/) | Socket.io, rum, klientsida i React |
| 3 | [Kommentarer](/krav/krav-3-kommentarer/) | Kräver krav 2 |
| 4 | [Projektspecifikt](/krav/krav-4-projektspecifikt/) | Krav 4.1: Monaco (texteditor). Krav 4.2: bokningslogik (bokningssystem) |
| 5 | [Notifieringar](/krav/krav-5-notifieringar/) | ntfy.sh, Discord eller e-post |
| 6 | [Fördjupad testning](/krav/krav-6-fordjupad-testning/) | Bygger vidare på vecka 4 |

### Bedömning

[**Bedömning och poäng**](/projektet/bedomning/) — hur projektet poängsätts,
vad varje krav kan ge, och varför redovisningen påverkar poängen.

[**Inlämning**](/projektet/inlamning/) — vad som ska lämnas in och var.

## Canvas gäller före den här siten

:::caution[Vid motstridiga uppgifter]
Canvas är kursens formella plattform. **Står något olika här och där är det
Canvas som gäller** — säg till om ni hittar en skillnad, så rättar vi den.
:::

Själva **inlämningen görs på Canvas**, i uppgiften
[3. Projekt](https://bth.instructure.com/courses/7250/assignments/68576).
Där finns också deadline och bedömningsmatrisen.

## Repon

Referensimplementationer och startrepon ligger i
[jsramverk-ht26](https://github.com/jsramverk-ht26) på GitHub.

| | Texteditor | Bokningssystem |
|---|---|---|
| Startrepo | [ssr-editor-ht26](https://github.com/jsramverk-ht26/ssr-editor-ht26) | [resource-booking-ht26](https://github.com/jsramverk-ht26/resource-booking-ht26) |
| Referens, backend | [coed-backend](https://github.com/jsramverk-ht26/coed-backend) | [resource-booking-backend](https://github.com/jsramverk-ht26/resource-booking-backend) |
| Referens, frontend | [coed-frontend](https://github.com/jsramverk-ht26/coed-frontend) | [resource-booking-frontend](https://github.com/jsramverk-ht26/resource-booking-frontend) |

JWT-autentisering finns dessutom som eget exempel i
[auth_mongo](https://github.com/jsramverk-ht26/auth_mongo).
