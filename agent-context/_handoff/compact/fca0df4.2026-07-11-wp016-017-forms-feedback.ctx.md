#hidden
# aci:v1 id=fca0df4 src=agent-context/sessions/2026-07-11-wp016-017-forms-feedback.md
@kv sha256=19011fefa54eb5d5af553e5aecd66695dae26d052b1c3dd5250a33b0f78f377b bytes=4161 lines=55 title=Session-2026-07-11-WP-016-WP-017-forms-and-feedback-primitives
@sig agent-context/sessions/2026-07-11-wp016-017-forms-feedback.md;apps/docs;Vite/React;conductor/css;80/80;packages/react/src/testing/contract.test.tsx;radix-ui/react-select;packages/react/src/form.tsx;testing/form.test.tsx;packages/react/src/feedback.tsx;testing/feedback.test.tsx;packages/react/src/index.ts;testing/public-components.ts;packages/css/src/base.css;test/bundle.test.ts;form/feedback;packages/tokens/src/components.ts;token/component;WP-016/017;CR-013/DEV-006;claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py;persistence/fallback;Risks/gotchas;packages/tokens/src/tokens.ts
@h1 Session: 2026-07-11 — WP-016·WP-017 forms and feedback primitives
@h2 Goal
@path Continue REL-002 after WP-015: implement the form component family (WP-016), then feedback family (WP-017), keep documentation traceability current, and leave a clean handoff for WP-018.
@h2 Current state
@path WP-016 is complete: Field, TextField, TextArea, Radix Select/Switch/Checkbox, CSS, public registry, and form tests are present.
@path WP-017 is complete: Banner, EmptyState, Meter, ProgressRing, Spinner, CSS, public registry, feedback tests, and token entries are present.
@todo REL-002's next WP is WP-018. apps/docs remains only a tsup package-contract skeleton; Vite/React site runtime, router, and docs test scripts have not been implemented.
@path Last successful gates after WP-017: pnpm build, pnpm typecheck, pnpm test (29 files / 467 tests), pnpm --filter @conductor/css test (72 tests), pnpm lint:tokens, and pnpm check:contrast (80/80).
@path pnpm lint still fails in the pre-existing packages/react/src/testing/contract.test.tsx with three ESLint errors; neither WP changed that file.
@h2 Decisions
@path Form Radix packages are exact runtime dependencies: @radix-ui/react-select 2.2.5, react-switch 1.2.5, and react-checkbox 1.3.2.
@risk Field uses private context plus useId() to connect label, description, error, invalid, and required state; it remains a single-control wrapper.
@risk Feedback token collision: semantic meter.normal|warning|exceeded is fixed to three tokens by FR-TOK-005. C-062 rendering slots therefore use feedbackMeter.*, not meter.* (CR-013 / DEV-006).
@b surface.track is a new decorative semantic token: dark rgba(255, 255, 255, 0.05) matches the source progress track; light is rgba(12, 18, 28, 0.08).
@todo Reduced-motion Spinner label rule must live in cdt.base and be rooted at :root/[data-cdt-theme]; CSS bundle tests reject reduced-motion rules in cdt.component or unscoped selectors.
@h2 Changed files
@path packages/react/src/form.tsx, testing/form.test.tsx — WP-016 form primitives and tests.
@path packages/react/src/feedback.tsx, testing/feedback.test.tsx — WP-017 feedback primitives and tests.
@path packages/react/src/index.ts, testing/public-components.ts, package manifest and lockfile — exports, public registry, exact Radix dependencies.
@path packages/css/src/base.css, components.css, test/bundle.test.ts — form/feedback styles and static contracts.
@path packages/tokens/src/components.ts, palette.dark.ts, palette.light.ts, palette.dark.test.ts — feedback tokens and track palette.
@path delivery, QA, UI token/component, and change-control documents — WP-016/017 completion plus CR-013/DEV-006 closure.
@h2 Commands
@cmd Passed: pnpm build, pnpm typecheck, pnpm test, pnpm --filter @conductor/css build && pnpm --filter @conductor/css test, pnpm lint:tokens, pnpm check:contrast.
@path Passed: python3 ~/.claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py --root . --report --code-root . and --strict.
@risk Known failure: pnpm lint reports three pre-existing errors in packages/react/src/testing/contract.test.tsx (no-empty-object-type, two unused parameters).
@h2 Next steps
@path Start WP-018 by reading its block, FR-DOC-001, FR-DOC-005, FR-THM-003, API-DOC-001, API-THM-001.
@path Convert apps/docs from the current tsup contract skeleton into the documented Vite/React static app only within WP-018 scope.
@path Add shell, theme persistence/fallback, first-paint snippet, and mobile navigation; do not implement WP-019+ content pages.
@path Run WP-018's validation and update the traceability ledger.
@h2 Risks/gotchas
@path Generated packages/tokens/src/tokens.ts and src/breakpoints.ts are gitignored; edit token source only.
@b CSS test reads built dist; always build CSS before its tests.
@path Radix portal/browser behavior has jsdom limits. Use existing test patterns; browser axe gate remains WP-024.
@path CR-013 is closed. Do not revive meter.* component tokens; that violates the token group invariant.
@h2 References
@path CR-013 / DEV-006, WP-016, WP-017.
@todo Next work package: docs/40_delivery/conductor_work_packages.md WP-018.
