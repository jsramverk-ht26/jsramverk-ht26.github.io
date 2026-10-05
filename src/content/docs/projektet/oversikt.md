---
title: "Om projektet"
description: "De två projektalternativen, deras bakgrund och vad ni bygger."
sidebar:
  order: 1
---

## Projektalternativ

Under projektdelen (vecka 6–10) fortsätter varje grupp att arbeta med det projektalternativ ni valt
- **Texteditor** (ssr-editor)— utgår från startrepot `ssr-editor-ht26`. En texteditor med stöd för realtidsredigering, kommentarer och code-mode.
- **Bokningssystem** (resource-booking) — utgår från startrepot `resource-booking-ht26`. Ett bokningssystem för resurser med stöd för realtidsuppdateringar, kommentarer och korrekt bokningslogik.

Båda alternativen följer samma kravstruktur — fem av sex krav är gemensamma. Krav 4 skiljer sig åt beroende på vilket projekt ni valt.

### Baseline

Bägge projektalternativen har en baseline - dvs funktionalitet som förväntas uppfyllas. Detta finns specificerat i ett separat dokument, se här: [Baseline för projektet](/projektet/baseline/)
Andra gruppuppgiften är delvis riktad mot att baseline uppnås.
Även om det inte finns specifika krav att detta ska vara klart inför projektet så kan det vara en god idé att se över och eventuellt se till att merparten av baseline uppfylls inför projektet. Exempelvis att det finns data i databasen att arbeta med.


## Projektvalen – bakgrund och kontext

Nedan finns en kort introduktion till respektive projekts sammanhang och vad ni bygger.

### Texteditor

Det här är en kort introduktion till det sammanhang som texteditor-projektet är inspirerat av. Det ger en bild av vad ni bygger och varför det är intressant rent tekniskt.

**Vad är en kollaborativ texteditor?**

En kollaborativ texteditor låter flera användare redigera samma dokument samtidigt – i realtid, utan att behöva skicka filer fram och tillbaka. Google Docs är det mest kända exemplet. Visual Studio Code Live Share är ett annat, riktat mot kod.

Det som gör det tekniskt intressant är att ändringar från en användare måste synkroniseras till alla andra direkt, utan att krocka med deras simultana ändringar. Det kräver en stabil kanal för realtidskommunikation – i det här projektet Socket.io.

**Vad bygger ni?**

Ni bygger en webbaserad texteditor där användare kan:
- Skapa och hantera dokument
- Redigera dokument i en webbläsarbaserad editor
- Se andras ändringar i realtid (om ni väljer Krav 2)
- Dela dokument med andra användare (om ni väljer Krav 1)

Utgångspunkten är en enkel server-renderad editor med Express och SQLite. Under kursen bygger ni om den till en modern arkitektur med React-frontend, MongoDB och driftsättning på en server.

**Kodeditor-läget (Krav 4)**

Ett av de valfria kraven för texteditor-projektet är att lägga till ett kodeditor-läge – ett dokument kan märkas som "kod" och editorn byts då mot en mer avancerad kodeditor med syntax highlighting. [Monaco Editor](https://microsoft.github.io/monaco-editor/) (som driver VS Code) och [CodeMirror](https://codemirror.net/) är två vanliga alternativ.

**Resurser för projektet**
- Startrepo: [ssr-editor-ht26](https://github.com/jsramverk-ht26/ssr-editor-ht26)
- Referensimplementation: [coed-backend](https://github.com/jsramverk-ht26/coed-backend) + [coed-frontend](https://github.com/jsramverk-ht26/coed-frontend)
- Live: [jsramverk-ht26.github.io/coed-frontend](https://jsramverk-ht26.github.io/coed-frontend/)

### Resource-booking

Det här är en kort introduktion till den miljö och det sammanhang som resource-booking-projektet är inspirerat av. Du behöver inte kunna något av det här för att genomföra kursen – det är kontexten som motiverar varför ett bokningssystem är användbart.

**Vad är Proxmox, MaaS och OpenStack?**

I datormiljöer där flera användare delar på samma fysiska hårdvara behövs ett sätt att hantera och boka resurser. Tre vanliga plattformar för detta är:
- **Proxmox VE** – ett open source-system för att skapa och hantera virtuella maskiner (VM) och containers. Används ofta i lab- och undervisningsmiljöer. En VM kan startas, stoppas och konfigureras via ett webb-API.
- **MaaS (Metal as a Service)** – ett system från Canonical (Ubuntu) för att hantera fysiska servrar som om de vore molnresurser. Används när man vill boka och provisionera riktig hårdvara.
- **OpenStack** – en stor open source-plattform för privata moln, liknande AWS eller Azure men driftas på egen hårdvara. Används på universitet och i företag för att erbjuda molntjänster internt.

Gemensamt för alla tre är att de exponerar ett HTTP-API – vilket gör det möjligt att integrera ett bokningssystem mot dem.

**Vad bygger ni?**

Ni bygger ett bokningssystem där användare kan se tillgängliga resurser och göra tidsbokningar. I sin enklaste form är det oberoende av vilken underliggande plattform som hanterar resurserna – resurser läggs in manuellt i databasen (via seed-data).

:::note[Brokern är en förutsättning]
Bokningar i resource-booking går via en **broker** — en mellanhand som ger er tillgång till riktiga, isolerade resurser (Proxmox, MAAS, OpenStack) utan att ni når deras egna API:er. Er backend **ska** använda den för resurser och bokningar. Läs [Brokern — bokningar i resource-booking](/projektet/broker/).
:::

**Resurser för projektet**
- Startrepo: [resource-booking-ht26](https://github.com/jsramverk-ht26/resource-booking-ht26)
- Referensimplementation: [resource-booking-backend](https://github.com/jsramverk-ht26/resource-booking-backend) + [resource-booking-frontend](https://github.com/jsramverk-ht26/resource-booking-frontend)
