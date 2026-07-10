# agent-context-index:v1
generated=2026-07-10T14:20:41+00:00
source_dir=agent-context
output_dir=agent-context/_handoff
files=7
legend=@hN heading;@p prose;@b bullet;@todo task;@dec decision;@risk risk;@cmd command;@path path-ref;@code code-fence;@sig retrieval-signals;@kv metadata

## read_order
- f73e2b0 p=20 src=agent-context/session-notes.md compact=agent-context/_handoff/compact/f73e2b0.session-notes.ctx.md title=Session-2026-07-10-Conductor-Design-System-문서-환경-구축부터-REL-001-완료까지 sig=agent-context/session-notes.md,home/roqkf/agent-ai-platform,Opus/Sonnet,conductor/tokens,TS/JSON,40/40,packages/css,packages/react
- f3c6d32 p=20 src=agent-context/session-summary.md compact=agent-context/_handoff/compact/f3c6d32.session-summary.ctx.md title=Session-Summary-2026-07-10-Conductor-Design-System-부트스트랩 sig=agent-context/session-summary.md,home/roqkf/agent-ai-platform,agent-ai-platform/packages/web,packages/tokens/,conductor/tokens,packages/css/,conductor/css,packages/react/
- f0b2764 p=33 src=agent-context/decisions.md compact=agent-context/_handoff/compact/f0b2764.decisions.ctx.md title=확정-결정과-그-이유 sig=agent-context/decisions.md,conductor/react,conductor/tokens,src/tokens.ts,src/breakpoints.ts,packages/tokens/dist,Vue/Svelte/Web,conductor/css
- f54408e p=35 src=agent-context/todos.md compact=agent-context/_handoff/compact/f54408e.todos.ctx.md title=다음-작업-/-미해결-항목 sig=agent-context/todos.md,docs/20_derived_ui_specs/conductor_ai_agent_execution_brief.md,docs/40_delivery/conductor_work_packages.md,docs/40_delivery/conductor_implementation_traceability.md,conductor/css,/component.css,conductor/react,conductor/tokens/tokens.css
- f527103 p=50 src=agent-context/commands.md compact=agent-context/_handoff/compact/f527103.commands.ctx.md title=명령어-/-테스트-결과-/-실패한-것과-원인 sig=agent-context/commands.md,claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py,FR/WP,conductor/tokens,packages/tokens/bin/conductor-build-tokens.mjs,dist/cli.js,dist/contrast-report.json,packages/tokens/package.json
- f5791b0 p=50 src=agent-context/files.md compact=agent-context/_handoff/compact/f5791b0.files.ctx.md title=중요-파일과-역할 sig=agent-context/files.md,docs/20_derived_ui_specs/conductor_ai_agent_execution_brief.md,docs/40_delivery/conductor_work_packages.md,docs/40_delivery/conductor_implementation_traceability.md,docs/10_requirements/srs_final.md,docs/00_governance/change_control.md,docs/README.md,docs/00_governance/
- f7b39dc p=50 src=agent-context/risks.md compact=agent-context/_handoff/compact/f7b39dc.risks.ctx.md title=리스크-/-불확실한-가정-/-검증에서-속을-뻔한-지점 sig=agent-context/risks.md,dist/cli.js,packages/tokens/bin/conductor-build-tokens.mjs,conductor/tokens,/bin/,packages/tokens/dist,packages/css,packages/react

## files
### f527103
src=agent-context/commands.md
compact=agent-context/_handoff/compact/f527103.commands.ctx.md
sha256=4f3b8ca1395a03ac69b27a1a43a948e00636c764a48da1b481fe1c77c639dfdc
bytes=8135 compact_bytes=9585 lines=193 priority=50
heads=명령어 / 테스트 결과 / 실패한 것과 원인 > 문서 검증 > 코드 게이트 — CI와 동일 순서 > 유용한 개별 명령 > 음성 테스트 — 도구가 실제로 죽는지 확인한 방법 > 의존 방향 (FR-DX-001 AC-1)
sig=agent-context/commands.md;claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py;FR/WP;conductor/tokens;packages/tokens/bin/conductor-build-tokens.mjs;dist/cli.js;dist/contrast-report.json;packages/tokens/package.json;conductor/react;scripts/check-deps.mjs;conductor/css;dist/tokens.css;packages/css/src/__probe.css;text.muted/surface.base;text.muted/surface.elevated;text.muted/state.disabled;home/roqkf/design-system;/tokens;/package.json;WP-003/004;/src/;SKILL;scripts;validate_srs_prd_env

### f0b2764
src=agent-context/decisions.md
compact=agent-context/_handoff/compact/f0b2764.decisions.ctx.md
sha256=1d23de5d1638f89debef214b4db4b3a2484be2f698076f206730454b2cb914d8
bytes=8693 compact_bytes=8864 lines=98 priority=33
heads=확정 결정과 그 이유 > 사용자가 직접 내린 결정 (인터뷰 4문항, 2026-07-10) > 오픈 결정 (OD) 처리 > OD-001을 "최소 수정"으로 고른 이유 > CR로 처리한 문서 결함 (구현 중 발견) > CR-006 — status.neutralEnd 모순 (해소안 A)
sig=agent-context/decisions.md;conductor/react;conductor/tokens;src/tokens.ts;src/breakpoints.ts;packages/tokens/dist;Vue/Svelte/Web;conductor/css;Conductor;Katakuri;Halo;product;React;Figma;DTCG;Vanilla;CSS;Tailwind;Modules;extract;ADR;WCAG;REL;deferred

### f5791b0
src=agent-context/files.md
compact=agent-context/_handoff/compact/f5791b0.files.ctx.md
sha256=ecfabd1cc6bce890832bb13af59db8c53d8c4c5f68bab771636bb91f3c1950fa
bytes=7704 compact_bytes=8572 lines=114 priority=50
heads=중요 파일과 역할 > 최우선 — 다음 에이전트가 먼저 읽을 것 > 문서 세트 (docs/, 39개 .md) > 자주 참조하게 될 문서 > 코드 > 루트
sig=agent-context/files.md;docs/20_derived_ui_specs/conductor_ai_agent_execution_brief.md;docs/40_delivery/conductor_work_packages.md;docs/40_delivery/conductor_implementation_traceability.md;docs/10_requirements/srs_final.md;docs/00_governance/change_control.md;docs/README.md;docs/00_governance/;docs/10_requirements/;docs/20_derived_ui_specs/;docs/30_technical_architecture/;docs/40_delivery/;docs/20_derived_ui_specs/conductor_design_system_tokens.md;docs/20_derived_ui_specs/conductor_ui_component_spec.md;docs/30_technical_architecture/conductor_api_contracts.md;docs/20_derived_ui_specs/conductor_screen_qa_checklist.md;docs/30_technical_architecture/conductor_architecture_decision_records.md;scripts/check-deps.mjs;github/workflows/ci.yml;packages/tokens/src/tokens.ts;src/breakpoints.ts;packages/tokens/;src/schema.ts;key/tier/value

### f7b39dc
src=agent-context/risks.md
compact=agent-context/_handoff/compact/f7b39dc.risks.ctx.md
sha256=3a2104e2129caef15bf512678afebb20acd1d8938e90b1b07d3ad84104568b8d
bytes=5441 compact_bytes=5957 lines=65 priority=50
heads=리스크 / 불확실한 가정 / 검증에서 속을 뻔한 지점 > 검증 함정 — 이 세션에서 실제로 당할 뻔한 것들 > bin/은 번들된 dist/cli.js를 실행한다 > 절대 실패할 수 없는 검사 > lint:tokens가 자명하게 통과한다 > 같은 코드로 자기를 검증하지 마라
sig=agent-context/risks.md;dist/cli.js;packages/tokens/bin/conductor-build-tokens.mjs;conductor/tokens;/bin/;packages/tokens/dist;packages/css;packages/react;px/ms/z-index/font-size;CR-005/CR-006;conductor/css;packages;conductor;gitignore;surface;elevated;contrast;WCAG;PRD;REL;Radix;DOM;important;neutralEnd

### f73e2b0
src=agent-context/session-notes.md
compact=agent-context/_handoff/compact/f73e2b0.session-notes.ctx.md
sha256=60a49567794cfcb2c137b4f0ab4c25a377efcf94795c724a1962ea71629aa149
bytes=4508 compact_bytes=5156 lines=75 priority=20
heads=Session: 2026-07-10 — Conductor Design System, 문서 환경 구축부터 REL-001 완료까지 > Goal > Current state > Decisions > Changed files > Commands
sig=agent-context/session-notes.md;home/roqkf/agent-ai-platform;Opus/Sonnet;conductor/tokens;TS/JSON;40/40;packages/css;packages/react;apps/docs;scripts/check-deps.mjs;github/workflows/ci.yml;packages/tokens/;packages/css/;packages/react/;apps/docs/;dist/cli.js;docs/20_derived_ui_specs/conductor_ai_agent_execution_brief.md;conductor/css;conductor/tokens/tokens.css;Risks/gotchas;claude/skills/build-srs-prd-env/;Session;Conductor;Design

### f3c6d32
src=agent-context/session-summary.md
compact=agent-context/_handoff/compact/f3c6d32.session-summary.ctx.md
sha256=4f12313a86c09a2ef17b31ddbed49d809f43bc19281bb9d5047c764909c23dcd
bytes=4936 compact_bytes=5682 lines=74 priority=20
heads=Session Summary — 2026-07-10, Conductor Design System 부트스트랩 > 목표 (사용자 표현 그대로) > 무엇을 만들었나 > 현재 상태 > 문서 (완료) > 코드 (REL-001 완료, WP-001~007)
sig=agent-context/session-summary.md;home/roqkf/agent-ai-platform;agent-ai-platform/packages/web;packages/tokens/;conductor/tokens;packages/css/;conductor/css;packages/react/;conductor/react;apps/docs/;SRS/PRD;scripts/check-deps.mjs;docs/10_requirements/srs_final.md;40/40;/tokens.css;/tokens.json;/contrast-report.json;/breakpoints;/package.json;REL-002/003/004;docs/20_derived_ui_specs/conductor_ai_agent_execution_brief.md;docs/00_governance/change_control.md;Session;Summary

### f54408e
src=agent-context/todos.md
compact=agent-context/_handoff/compact/f54408e.todos.ctx.md
sha256=10888847d6a4ea2c869c20c872d3a55115d38bcb52487c3afb7c9323a8cf9efe
bytes=4710 compact_bytes=5611 lines=72 priority=35
heads=다음 작업 / 미해결 항목 > 시작 지점 > REL-002 — 다음 릴리스 슬라이스 > WP-008 착수 시 즉시 확인할 것 > WP-010이 잠금 해제하는 것 > 열려 있는 결정
sig=agent-context/todos.md;docs/20_derived_ui_specs/conductor_ai_agent_execution_brief.md;docs/40_delivery/conductor_work_packages.md;docs/40_delivery/conductor_implementation_traceability.md;conductor/css;/component.css;conductor/react;conductor/tokens/tokens.css;/../tokens/dist/tokens.css;/tokens.css;/dist/tokens.css;docs/20_derived_ui_specs/conductor_design_system_tokens.md;packages/tokens/src/tokens.ts;packages/tokens/src/breakpoints.ts;docs/00_governance/change_control.md;src/breakpoints.ts;conductor_ai_agent_execution_brief;conductor_work_packages;conductor_implementation_traceability;REL;conductor;important;component;content

## continuation_protocol
read this index first; follow read_order; inspect only compact files needed for task; run reader.py search/show/restore when routing is unclear; treat compact context as lossy and repo source as final truth.
