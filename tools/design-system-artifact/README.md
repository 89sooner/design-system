# Design system artifact producer

Rebuilds the files of the **Conductor** design system artifact on claude.ai (a Claude "Design System" artifact) from this repository, so the artifact can follow the code instead of being re-authored by hand.

```bash
pnpm ds:artifact               # builds tokens → css → react and the docs component catalog, then writes out/
pnpm ds:artifact --skip-build  # reuses the existing dist/ and generated/ outputs
```

Options: `--ref <label>` overrides the recorded source ref (default `main@<short sha>`), `--synced <YYYY-MM-DD>` the sync date (default today).

The output goes to `out/` (gitignored):

| Output | From |
| --- | --- |
| `out/project/tokens.json` | `packages/tokens/dist/tokens.json` — colours and shadows per theme (dark first), spacing, radius and the other single-value families |
| `out/project/components/bundle.css` | `packages/css/dist/index.css` + `agent.css`, minus the `--cdt-*` declarations tokens.json now owns; `data-cdt-theme` → `data-theme` |
| `out/project/components/bundle.js` | `packages/react/dist/index.js` bundled as one IIFE on `window.Conductor`, reading `window.React` / `window.ReactDOM` |
| `out/project/components/index.d.ts` | `packages/react/etc/react.api.md` |
| `out/project/components/<Name>/README.md` | `apps/docs/src/generated/component-meta.json` (guidance + props) |
| `out/project/components/<Name>/preview.html` | the docs catalog previews in `apps/docs/src/catalog.tsx`, compiled once and inlined |
| `out/project/README.md`, `components/Cover/preview.html`, `assets/Logos/**` | `static/` — hand-written brand book, cover and logo files, copied as they are |
| `out/publish.json` | the list of files to publish and of images to upload |

Tokens the artifact's tables cannot hold — font stacks, motion and transitions, gradients, `transparent`, and lengths that differ per theme — stay declared in `bundle.css`; the brand book's "Not synced" section names them.

## Publishing

The artifact is not written by this script. Ask Claude, in a session with access to the artifact, to re-sync the Conductor design system from `out/` (or from GitHub): it reads the artifact's current files, publishes the files listed in `out/publish.json` under the same paths, uploads the images in `assets` only if they changed, and updates the artifact's index (`design-system.json`, never produced here) last.

## Changing it

- Token, stylesheet or component changes need nothing here: rebuild and re-sync.
- A new public component needs a guidance entry and a catalog preview in `apps/docs` first (the docs build already enforces both); it then appears here automatically. Give it a row height in `PREVIEW_HEIGHTS` (`lib/previews.mjs`) if the default 130px is too short.
- Brand book prose, the cover and the logos are edited in `static/`. Regenerate the cover when the name, palette or radius scale changes.
- `test/producer.test.mjs` runs in `pnpm test` and fails if `catalog.tsx` no longer has the markers the previews are cut from.
