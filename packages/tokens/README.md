# @conductor-by-89soone/tokens

Theme-aware design tokens and validation CLIs for the Conductor Design System. Dark is the canonical theme; light uses the same semantic keys.

## Install

```bash
pnpm add @conductor-by-89soone/tokens
```

## Use

```ts
import { breakpoints, tokens } from "@conductor-by-89soone/tokens";

console.log(tokens.surface.raised);
console.log(breakpoints.md);
```

Import the generated custom properties directly when React components are not needed:

```css
@import "@conductor-by-89soone/tokens/tokens.css";
```

The package also exports `tokens.json`, `contrast-report.json`, and three executables:

```bash
conductor-build-tokens
conductor-check-contrast
conductor-lint-tokens <paths...>
```

`src/tokens.ts` and `src/breakpoints.ts` are generated during the repository build; edit the token source files instead.

## Requirements

Node.js 20 or newer.

## License

MIT
