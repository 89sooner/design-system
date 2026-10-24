# @conductor-by-89soone/css

Framework-agnostic, token-driven Conductor styles organized into explicit CSS cascade layers.

## Install

```bash
pnpm add @conductor-by-89soone/css
```

## Use

Import the stylesheet once near the application entry point:

```ts
import "@conductor-by-89soone/css";
```

Select a theme on the document root. Dark is the default and canonical palette.

```html
<html data-cdt-theme="light"></html>
```

Layout follows the document direction: with `dir="rtl"` the stylesheet mirrors placement and motion, while code, key caps and monospaced values keep reading left to right.

Applications that already own a global reset can use the reset-free entry point:

```ts
import "@conductor-by-89soone/css/component.css";
```

The stylesheet declares this fixed order:

```css
@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility;
```

### Keep your reset below Conductor

Unlayered rules outrank every layer. That is what makes your own class overrides easy, and it is also
why an unlayered element reset such as `button { font: inherit; }` silently replaces the weight, size
and line height of every Conductor button, tab and input. Put element-wide rules in a layer that you
declare before `cdt`, in a file imported before the Conductor stylesheet:

```css
/* layers.css — import this before @conductor-by-89soone/css/component.css */
@layer app.reset, cdt;
```

```css
/* your global stylesheet */
@layer app.reset {
  button, input, textarea, select { font: inherit; }
}
```

Layer order is fixed by the first declaration the browser sees, so `app.reset` now sits under every
`cdt.*` layer: your own elements still inherit the font, and Conductor elements keep theirs. Keep
unlayered rules for your own class names.

No JavaScript runtime is included.

## Requirements

Node.js 20 or newer.

## License

MIT
