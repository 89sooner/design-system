#!/usr/bin/env node
// Bin shim for API-TOK-001. The CLI itself is `dist/cli.js`; this wrapper exists so the
// executable carries a shebang without the bundler having to inject one.
import "../dist/cli.js";
