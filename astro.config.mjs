// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

// Org-site: repot heter <org>.github.io och serveras från roten,
// därför behövs ingen `base` (till skillnad från projektsajterna i orgen).
export default defineConfig({
	site: 'https://jsramverk-ht26.github.io',

	// Siten har inga bilder att optimera, så vi slipper `sharp` som beroende.
	// Lägger ni till bilder via astro:assets: installera sharp och ta bort
	// den här raden, annars serveras de ooptimerade.
	image: { service: passthroughImageService() },

	integrations: [
		mermaid({ autoTheme: true }),
		starlight({
			title: 'DV1677 — Projektkrav',
			description: 'Fördjupning och kodexempel för projektets sex krav. JavaScript-baserade webbramverk, BTH.',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/jsramverk-ht26' }],
			sidebar: [
				{ label: 'Start', link: '/' },
				{
					label: 'Projektkraven',
					items: [
						'krav/krav-1-jwt-autentisering',
						'krav/krav-2-websockets',
						'krav/krav-3-kommentarer',
						'krav/krav-4-projektspecifikt',
						'krav/krav-5-notifieringar',
						'krav/krav-6-fordjupad-testning',
					]
				},
			],
			customCss: [
				'./src/styles/custom.css',
			],
			pagination: false,
		}),
	],
});
