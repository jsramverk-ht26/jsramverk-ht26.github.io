# DV1677 — Projektkrav

Fördjupningen till projektets sex krav: förklaringar, kodexempel för båda
projektalternativen och pekare in i referensapparna.

Publiceras på **https://jsramverk-ht26.github.io/**

Astro + Starlight, samma upplägg som `dbwebb-projfront.github.io`.

## Arbetsdelning mot Canvas

| Var | Vad |
|-----|-----|
| **Canvas** | Reglerna — kravlistan, poängsättningen, deadline, dev-flödet, inlämningen |
| **Den här siten** | Hur man gör — förklaringar, kod, fallgropar, referenser |

Står något olika **gäller Canvas**. Det står också på startsidan, så att
studenterna vet vilken källa som vinner.

Poängtabeller och deadlines ska alltså inte skrivas in här. Lägg en länk
i stället — annars uppstår två versioner som glider isär.

## Innehållet

Artiklarna i `src/content/docs/krav/` är genererade från `teacher-notes/krav/*.md`
(privat repo) vid uppsättningen 2026-09-23. **Därefter är det här repot källan.**
Redigera direkt i `.md`-filerna; `teacher-notes`-versionerna är inte längre
aktuella.

Frontmatter (`title`, `description`) styr sidhuvud och sidomeny. Rubrikerna
`##` och `###` blir automatiskt innehållsförteckning i högerspalten.

Sidomenyn konfigureras i `astro.config.mjs` — nya sidor måste läggas till där
för att synas.

## Kör lokalt

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # bygger till dist/
```

## Om `sharp` och bilder

Siten har inga bilder, så Astros bildtjänst är satt till `passthroughImageService()`
i `astro.config.mjs`. Det gör att `sharp` inte behövs — vilket är tur, eftersom
`sharp` inte kan byggas på Node 26 (saknar förkompilerade binärer för den ABI:n).

**Lägger ni till bilder via `astro:assets`:** installera `sharp` och ta bort
`image`-raden i konfigurationen. Annars serveras bilderna ooptimerade.

Bygget i CI kör Node 20 via `withastro/action@v3` och påverkas inte.

## Driftsättning

Push till `main` → GitHub Actions bygger och publicerar till GitHub Pages.
Kräver att Pages är aktiverat med **Source: GitHub Actions**.

Repot heter `<org>.github.io` och är därför en *org-site* som serveras från
roten. Det är skälet till att ingen `base` behöver sättas — till skillnad från
projektsajterna i orgen, som ligger på `/<reponamn>/`.
