# Security policy

Conductor ships three npm packages — `@conductor-by-89soone/tokens`, `@conductor-by-89soone/css` and `@conductor-by-89soone/react` — and a static documentation site. There is no server, database or authentication, so the security surface is the published package contents and their dependencies.

## Supported versions

| Version | Security fixes |
| --- | --- |
| Latest `0.x` minor (until 1.0.0) | Yes |
| Older `0.x` minors | No — upgrade to the latest minor |

From 1.0.0 the latest major receives fixes. Fixes ship as patch releases through the normal release workflow.

## Reporting a vulnerability

Please report privately; do not open a public issue with details.

1. Use GitHub's private vulnerability reporting for this repository: **Security → Report a vulnerability**.
2. If that form is not available, open an issue titled "Security contact request" with no details, and a maintainer will reply with a private channel.

Include the affected package and version, what an attacker can do, and steps or a proof of concept. This is a small project without a support contract: reports are handled on a best-effort basis, and you will hear back when a fix or a decision is ready.

## Verifying what you install

Every release is published from GitHub Actions with npm provenance. To check the packages in your lockfile:

```sh
npm audit signatures
```

Runtime dependencies are pinned to exact versions (Radix UI primitives, react-day-picker, downshift, Headless Tree), and the release workflow fails on a high or critical `pnpm audit` finding. The one accepted exception is listed in the implementation ledger (`DEV-049`, a development-only dependency with no patch).
