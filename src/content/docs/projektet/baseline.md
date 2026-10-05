---
title: "Baseline"
description: "Miniminivån som ska finnas i applikationen när projektet lämnas in."
sidebar:
  order: 2
---

Den här sidan beskriver "miniminivån" som förväntas finnas i er applikation när projektet är avslutat och inlämning sker.
Det är grunden som de valfria projektkraven (Krav 1–6) byggs ovanpå.

Tänk på det som basen för er applikation — oavsett vilka krav ni väljer ska grundfunktionaliteten fungera.

Det lämpar sig väl att redan från start ha med denna baseline i det arbete ni gör.

### Gemensamt för båda projekten
- Backend i Express med MongoDB som databas (native driver)
- Fristående frontend som SPA i valt JavaScript-ramverk, byggt med Vite
- Frontend driftsatt via GitHub Pages, backend som Docker-container på VPS
- GitHub Actions-pipeline med automatisk deploy till VPS vid merge till main (`deploy.yml`)
- Arbete enligt GitHub Flow — feature branches, pull requests, code reviews
- README i båda repona med: gruppmedlemmar, teknikval, instruktioner för lokal körning
- Enhetstester för backend-routes och CI-pipeline via GitHub Actions (`ci.yml`)

### Texteditor

Applikationen ska som minimum kunna:
- Lista dokument
- Öppna och läsa ett befintligt dokument
- Skapa ett nytt dokument
- Redigera och spara innehållet i ett dokument

### Bokningssystem

Applikationen ska som minimum kunna:
- Lista tillgängliga resurser med namn, typ och beskrivning
- Visa en resurs och dess bokningar
- Skapa en bokning med valfri start- och sluttid
- Ta bort en bokning

Resurser finns fördefinierade i databasen via seed-data — ingen admin-vy krävs för att lägga till resurser.

:::note[Resource-booking: det här är nytt i projektet]
Under projektet (vecka 6–10) hämtas resurserna och bokningarna görs via en **broker**, inte bara mot seed-data. Tänk på det när ni planerar er databas och era routes. Se [Brokern — bokningar i resource-booking](/projektet/broker/).
:::
