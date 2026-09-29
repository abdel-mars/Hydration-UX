# Source documents

The eight original deliverables of the **Athlete Keep Hydrated** project. Read them on
the [project site](https://hydration-ux.vercel.app/), which renders each one as a
flipbook.

- [Medium case study](https://medium.com/@elmahmoudimars/athlete-keep-hydrated-ux-piscine-project-at-zone01-1459077457c9)

| Phase | File |
|-------|------|
| 01 User Interviews | `Elmahmoudi_Abderrahman_User_Interviews_Insights_20251006_V1.pdf` |
| 02 Analytics | `Elmahmoudi_Abderrahman_Analytics_Hydration_20251009_V1.pdf` |
| 03 Persona | `Elmahmoudi_Abderrahman_Pierre_Persona_20251009_V1.pdf` |
| 04 User Journey | `Elmahmoudi_Abderrahman_User_Journey_Timeline_Pierre_20251010_V2.pdf` |
| 05 Problem Statement | `Elmahmoudi_Abderrahman_Problem_Statement_Hydration_20251011_V1.pdf` |
| 06 Ideation | `Elmahmoudi_Abderrahman_Ideation_HydrationBand_20251012_V1.pdf` |
| 07 Storyboard | `Elmahmoudi_Abderrahman_Storyboard_Template_HydrationBand_20251013_V1.pdf` |
| 08 Final Product | `Elmahmoudi_Abderrahman_Final_Product_Summary_HydrationBand_SweatReactive_20251015_V1.pdf` |

## Re-rendering the page images

The site serves page images, not the PDFs themselves. They are generated with
[poppler's](https://poppler.freedesktop.org/) `pdftoppm`:

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
