/* global document, getComputedStyle */
/** FR-CMP-013 / WP-029: install real tarballs in isolated consumers. Never publishes. */
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const output = resolve(process.env.CONSUMER_OUTPUT ?? '/tmp/conductor-consumers');
const tarballs = resolve(process.env.CONSUMER_TARBALLS ?? join(output, 'tarballs'));
const pnpm = process.env.PNPM_BIN ?? 'pnpm';
function run(command, args, cwd, log) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }, maxBuffer: 20 * 1024 * 1024 });
  writeFileSync(log, `${result.stdout ?? ''}\n${result.stderr ?? ''}`);
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed (${result.status}); see ${log}`);
}
mkdirSync(tarballs, { recursive: true });
if (!process.argv.includes('--existing-tarballs')) {
  for (const pkg of ['tokens', 'css', 'react']) run(pnpm, ['pack', '--pack-destination', tarballs], join(root, 'packages', pkg), join(output, `pack-${pkg}.log`));
}
const dependencies = Object.fromEntries(['tokens', 'css', 'react'].map(pkg => {
  const name = JSON.parse(readFileSync(join(root, 'packages', pkg, 'package.json'), 'utf8')).name;
  const tgz = readdirSync(tarballs).find(file => file.startsWith(`conductor-by-89soone-${pkg}-`) && file.endsWith('.tgz'));
  if (!tgz) throw new Error(`Missing packed ${pkg} in ${tarballs}`);
  return [name, `file:${join(tarballs, tgz)}`];
}));
writeFileSync(join(output, 'artifacts.json'), JSON.stringify(Object.fromEntries(Object.entries(dependencies).map(([name, path]) => [name, { tarball: path.slice(5), sha256: createHash('sha256').update(readFileSync(path.slice(5))).digest('hex') }])), null, 2));
async function browserCheck(cwd, next, port) {
  const log = [];
  const server = spawn(pnpm, next ? ['exec', 'next', 'start', '--hostname', '127.0.0.1', '--port', String(port)] : ['exec', 'vite', 'preview', '--strictPort', '--host', '127.0.0.1', '--port', String(port)], { cwd, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', value => log.push(String(value))); server.stderr.on('data', value => log.push(String(value)));
  let browser;
  try {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (server.exitCode !== null) throw new Error('Consumer server exited before readiness');
      try { const response = await fetch(`http://127.0.0.1:${port}`); if (response.ok) break; } catch { /* Server startup is retried until its bounded readiness deadline. */ }
      if (attempt === 99) throw new Error('Consumer server did not become ready');
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(`http://127.0.0.1:${port}`);
    await page.getByRole('button', { name: 'Hydrated 0', exact: true }).click();
    await page.getByRole('button', { name: 'Hydrated 1', exact: true }).waitFor();
    await page.getByRole('button', { name: 'View options', exact: true }).click();
    await page.getByRole('dialog', { name: 'Options', exact: true }).waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('button', { name: 'View options', exact: true }).evaluate(element => element === document.activeElement), true);
    const preview = page.getByRole('button', { name: 'PR A · 한글 검색 미리보기', exact: true });
    await preview.click(); await page.getByRole('heading', { name: 'PR preview', exact: true }).waitFor();
    await page.getByRole('button', { name: '미리보기 닫기', exact: true }).click();
    assert.equal(await preview.evaluate(element => element === document.activeElement), true);
    await page.getByRole('tab', { name: 'Results', exact: true }).focus(); await page.keyboard.press('ArrowRight');
    assert.equal(await page.getByRole('tab', { name: 'Results', exact: true }).getAttribute('aria-selected'), 'true');
    await page.waitForFunction(() => document.activeElement?.textContent === 'Relations');
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: '관계 선택: synthetic:edge', exact: true }).click();
    await page.getByText('근거: Synthetic explicit reference', { exact: true }).waitFor();
    const relationUrl = page.url();
    await page.getByRole('link', { name: '동일 정보 목록으로 이동', exact: true }).click();
    assert.equal(page.url(), relationUrl, 'List alternative must preserve the consumer route');
    await page.evaluate(() => document.documentElement.setAttribute('data-cdt-theme', 'dark'));
    const darkText = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--cdt-text-primary'));
    await page.screenshot({ path: join(cwd, 'relation-dark.png'), fullPage: true });
    await page.evaluate(() => document.documentElement.setAttribute('data-cdt-theme', 'light'));
    const lightText = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--cdt-text-primary'));
    assert.notEqual(darkText, lightText, 'Theme semantic tokens must switch');
    await page.screenshot({ path: join(cwd, 'relation-light.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: join(cwd, 'relation-mobile.png'), fullPage: true });
    await page.getByRole('tab', { name: 'Processing', exact: true }).click();
    await page.getByText('검색 최신 여부는 미확인', { exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: '합성 재시도', exact: true }).isDisabled(), true);
    assert.deepEqual(errors, [], 'Browser hydration/runtime console errors');
    return { hydration: 'passed', previewFocusReturn: 'passed', manualTabs: 'passed', relationEvidence: 'passed', processingPermission: 'passed', consoleErrors: errors };
  } finally {
    await browser?.close(); server.kill('SIGTERM'); writeFileSync(join(cwd, 'server.log'), log.join(''));
  }
}
const results = process.env.CONSUMER_ONLY ? JSON.parse(readFileSync(join(output, 'results.json'), 'utf8')).filter(result => result.fixture !== process.env.CONSUMER_ONLY) : [];
for (const [name, react, next] of [['vite18', '18.3.1', false], ['vite19', '19.2.8', false], ['next19', '19.2.8', true]]) {
  if (process.env.CONSUMER_ONLY && process.env.CONSUMER_ONLY !== name) continue;
  const cwd = join(output, name); mkdirSync(cwd, { recursive: true });
  const manifest = { name: `conductor-consumer-${name}`, private: true, type: 'module', scripts: next ? { build: 'next build --webpack', start: 'next start' } : { build: 'vite build', start: 'vite --host 127.0.0.1' }, dependencies: { ...dependencies, react, 'react-dom': react, 'lucide-react': '0.468.0', ...(next ? { next: '16.3.1' } : { vite: '7.3.6' }) }, devDependencies: { typescript: '5.9.3', '@types/node': '22.20.1', '@types/react': react.startsWith('18') ? '18.3.18' : '19.2.18', '@types/react-dom': react.startsWith('18') ? '18.3.5' : '19.2.4' }, pnpm: { overrides: dependencies, onlyBuiltDependencies: ['esbuild', 'sharp'] } };
  writeFileSync(join(cwd, 'package.json'), JSON.stringify(manifest, null, 2));
  copyFileSync(join(root, 'fixtures/consumer/Consumer.tsx'), join(cwd, 'Consumer.tsx'));
  writeFileSync(join(cwd, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ES2022', lib: ['DOM', 'ES2022'], module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', strict: true, noEmit: true, skipLibCheck: true, esModuleInterop: true, ...(next ? { allowJs: true, incremental: true, resolveJsonModule: true, isolatedModules: true, plugins: [{ name: 'next' }] } : {}) }, include: ['*.tsx', 'app/**/*.tsx', ...(next ? ['.next/types/**/*.ts', '.next/dev/types/**/*.ts'] : [])], exclude: ['node_modules'] }, null, 2));
  if (next) {
    mkdirSync(join(cwd, 'app'), { recursive: true });
    writeFileSync(join(cwd, 'app/layout.tsx'), 'import React from "react"; import "@conductor-by-89soone/css"; export default function Layout({children}: {children: React.ReactNode}) {return <html lang="ko"><body>{children}</body></html>;}');
    writeFileSync(join(cwd, 'app/page.tsx'), 'import React from "react"; import { AppShell } from "@conductor-by-89soone/react"; import Consumer from "../Consumer"; export default function Page(){ return <AppShell nav={null} skipLinkLabel="Skip"><Consumer /></AppShell>; }');
    writeFileSync(join(cwd, 'next.config.mjs'), 'export default { experimental: { cpus: 1 } };');
  } else {
    writeFileSync(join(cwd, 'index.html'), '<!doctype html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Conductor installed consumer</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>');
    writeFileSync(join(cwd, 'main.tsx'), 'import React from "react"; import {createRoot} from "react-dom/client"; import "@conductor-by-89soone/css"; import Consumer from "./Consumer"; createRoot(document.getElementById("root")!).render(<Consumer />);');
  }
  run(pnpm, ['install', '--strict-peer-dependencies', '--ignore-scripts'], cwd, join(cwd, 'install.log'));
  run(pnpm, ['exec', 'tsc', '--noEmit'], cwd, join(cwd, 'typecheck.log'));
  run(pnpm, ['run', 'build'], cwd, join(cwd, 'build.log'));
  const browser = await browserCheck(cwd, next, next ? 4319 : react.startsWith('18') ? 4318 : 4320);
  results.push({ fixture: name, react, next: next ? '16.3.1' : null, install: 'passed', typecheck: 'passed', build: 'passed', browser, path: cwd });
  writeFileSync(join(output, 'results.json'), JSON.stringify(results, null, 2));
  console.log(`${name}: tarball installation, typecheck and production build passed`);
}
