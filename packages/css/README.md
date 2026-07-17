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

Applications that already own a global reset can use the reset-free entry point:

```ts
import "@conductor-by-89soone/css/component.css";
```

The stylesheet declares this fixed order:

```css
@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility;
```

No JavaScript runtime is included.

## Requirements

Node.js 20 or newer.

## License

MIT
