# Logos

- `conductor-brand-mark-dark.svg` — the navigation mark for dark surfaces: tile `#6d7cff` (`cdt-accent`), arc and point `#07111f` (`cdt-text-inverse`). 28×28, radius 8.
- `conductor-brand-mark-light.svg` — the same mark for light surfaces: tile `#4f5bd5`, ink `#f4f7fb` (the light values of the same two tokens).
- `conductor-favicon.svg` — the favicon: tile `#6d7cff`, arc `#f4f7fb`, no point. It does not follow the theme.

The mark is always presentational (`aria-hidden`) and sits beside the "Conductor" wordmark or another text label. In code the mark is drawn inline so its fills follow `--cdt-accent` / `--cdt-text-inverse`; these files carry the resolved values.
