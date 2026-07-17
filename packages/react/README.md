# @conductor-by-89soone/react

Accessible React primitives for the Conductor Design System. Interaction behavior is built on Radix UI and visual styling comes from `@conductor-by-89soone/css`.

## Install

```bash
pnpm add @conductor-by-89soone/react @conductor-by-89soone/css lucide-react
```

React and React DOM 18 or 19 are peer dependencies.

## Use

Import the stylesheet once, then import components from the package root:

```tsx
import "@conductor-by-89soone/css";
import { Button, Card } from "@conductor-by-89soone/react";

export function Example() {
  return (
    <Card>
      <Button variant="primary">Continue</Button>
    </Card>
  );
}
```

Set `data-cdt-theme="dark"` or `data-cdt-theme="light"` on the document root. Development builds warn once when the Conductor stylesheet is missing.

## Requirements

Node.js 20 or newer, React 18 or 19, React DOM 18 or 19, and `lucide-react` 0.400.0 or newer (below 2.0.0).

## License

MIT
