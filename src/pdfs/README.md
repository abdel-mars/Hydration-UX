# Athlete Keep Hydrated // UX Piscine Project

A non-digital UX design project focused on improving athletes' hydration experience through simple, human-centered innovation.

## Project Links
- **Page:** [athlete-keep-hydrated.page.gd](https://athlete-keep-hydrated.page.gd/)
- **Medium Case Study:** [Athlete Keep Hydrated](https://medium.com/@elmahmoudimars/athlete-keep-hydrated-ux-piscine-project-at-zone01-1459077457c9)

## Description
Created during the **Zone01 UX Piscine**, this project explores non-digital innovation for improving athlete hydration habits through design thinking.

Deliverables include:
- User Research & Insights  
- Analytics Validation  
- Persona & User Journey  
- Problem Statement  
- Ideation Workshop  
- Storyboard & Final Product  

**Final Concept:** *The Sweat-Reactive Hydration Band* — a color-changing wristband that teaches athletes to hydrate instinctively.

## Viewing the deliverables on the website

The site renders these PDFs as an in-browser flipbook. Page images are generated from
the PDFs with [poppler's](https://poppler.freedesktop.org/) `pdftoppm`:

```bash
npm run pdf:render
```

This reads every PDF referenced in `src/data/deliverables.json` and writes

- `public/flipbook/<slug>/page-NN.jpg` — ~1655px wide pages (used by the flipbook)
- `public/flipbook/<slug>/thumb-NN.jpg` — 400px wide thumbnails (rail + placeholders)
- `src/data/flipbook-manifest.json` — page count and aspect ratio per document

Re-run it whenever a PDF is added, replaced or re-exported. The generated images are
committed, so a fresh clone builds and deploys without poppler installed.

To add a phase: drop the PDF in `src/pdfs`, add an entry to
`src/data/deliverables.json`, run `npm run pdf:render`, done.

---
**Author:** Elmahmoudi Abderrahman | Mars'
**Program:** UX Piscine
