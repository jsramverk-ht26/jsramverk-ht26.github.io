---
title: "Kraven — översikt"
description: "De sex kraven i kortform, med länk till den utförliga beskrivningen av varje."
sidebar:
  order: 1
---

**Läs igenom kraven innan ni börjar.** Ni väljer minst 3 krav att implementera.

Kraven finns beskrivna på sidan [Krav i projektet](/krav/oversikt/).

:::note[Bokningssystem: brokern]
Brokern **ska användas** av alla som valt resource-booking: all bokning går via den. Se [Brokern — bokningar i resource-booking](/projektet/broker/). Texteditor-grupper berörs inte.
:::

Tänk på att:
- Krav 3 (Kommentarer) bygger på Krav 2 (WebSockets) — väljer ni Krav 3 måste Krav 2 också vara implementerat.
- Krav 4 är projektspecifikt: Krav 4.1 gäller texteditor och Krav 4.2 bokningssystem — läs beskrivningen för ert projektalternativ.
- Ni väljer själva vilka tre (eller fler) krav ni vill fokusera på. Planera detta tidigt.


## Krav 1 – JWT-autentisering

*[→ Utförlig beskrivning med kodexempel](/krav/krav-1-jwt-autentisering/)*

Användare kan registrera sig och logga in. Skyddade routes kräver giltig JWT. En inloggad användare kan bara se och redigera eget innehåll.

Resurs: `auth_mongo` i jsramverk-ht26.


## Krav 2 – WebSockets: realtid

*[→ Utförlig beskrivning med kodexempel](/krav/krav-2-websockets/)*

Använd Socket.io för att synkronisera innehåll i realtid utan att sidan laddas om.
- **Texteditor:** Två användare redigerar samma dokument samtidigt. Ändringar synkroniseras direkt.
- **Bokningssystem:** Bokningskalendern uppdateras hos alla inloggade användare när en bokning görs eller avbokas.


## Krav 3 – Kommentarer

*[→ Utförlig beskrivning med kodexempel](/krav/krav-3-kommentarer/)*

Bygger på Krav 2 — Socket.io ska vara implementerat.
- **Texteditor:** Kommentera specifika rader i ett dokument.
- **Bokningssystem:** Lägg till kommentarer eller noteringar på en bokning.


## Krav 4 – Projektspecifikt

*[→ Utförlig beskrivning med kodexempel](/krav/krav-4-projektspecifikt/)*
- **Krav 4.1, texteditor:** Lägg till code-mode per dokument. Editorn byts ut mot Monaco Editor med JavaScript-stöd. Dokumenttypen sparas i databasen.
- **Krav 4.2, bokningssystem:** Implementera bokningslogiken — avgör om tider krockar, vad som är ledigt en given dag, och vem som får avboka vad. Logiken ska ligga i separata moduler och täckas av tester. Bokningarna görs mot [brokern](/projektet/broker/).


## Krav 5 – Notifieringar

*[→ Utförlig beskrivning med kodexempel](/krav/krav-5-notifieringar/)*

Integrera med en extern notifieringstjänst. Välj kanal: e-post (Mailgun, Sendgrid eller liknande) eller t e x webhook (Discord, Slack, Telegram eller liknande).
- **Texteditor:** Notis när ett dokument delas med en annan användare eller när någon kommenterar.
- **Bokningssystem:** Notis vid ny bokning eller avbokning.


## Krav 6 – Fördjupad testning

*[→ Utförlig beskrivning med kodexempel](/krav/krav-6-fordjupad-testning/)*

Testa de features ni implementerat i projektet. Beskriv i redovisningstexten vad ni testat och varför ni känner förtroende för koden.


## Referensimplementationer

Var i referensapparna varje krav är implementerat står på [kravsiten](/). Referensappar finns i jsramverk-ht26-organisationen — använd dem som inspiration och jämförelse:
- **Texteditor:** `coed-backend` + `coed-frontend`
- **Bokningssystem:** `resource-booking-backend` + `resource-booking-frontend`
- **JWT-autentisering:** `auth_mongo`
