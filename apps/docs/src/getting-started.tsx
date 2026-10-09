// Refs: CR-042 WP-019 FR-CSS-001 FR-DX-001 FR-DX-003 FR-DX-004 W-002
//
// W-002 as a numbered path: eight steps on one rail, each with its own copyable code block.
// The `h2` texts and their order are asserted by `e2e/guides.spec.ts`, so the step number lives
// in the rail next to the heading, never inside it. Everything here composes public components;
// nothing reads `document` or `navigator` at render time.
// Page styles ride with the lazy route chunks so the landing never downloads them (CR-042, NFR-001).
import "./styles/pages.css";
import { Banner, CodeBlock, CopyButton, Table } from "@conductor-by-89soone/react";
import { ArrowRight, Component } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const installCode = "pnpm add @conductor-by-89soone/tokens @conductor-by-89soone/css @conductor-by-89soone/react\npnpm add react react-dom lucide-react\npnpm run build";
const styleCode = 'import "@conductor-by-89soone/css";';
const themeCode = '<html data-cdt-theme="dark">';
const renderCode = 'import { Button } from "@conductor-by-89soone/react";\n\nexport function SaveAction() {\n  return <Button variant="primary">Save changes</Button>;\n}';
const layersCode = "@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility;";
const ssrThemeCode = 'try {\n  const saved = localStorage.getItem("conductor-theme");\n  document.documentElement.dataset.cdtTheme = saved === "light" || saved === "dark" ? saved : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";\n} catch {\n  document.documentElement.dataset.cdtTheme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";\n}';

const requirements = [
  ["Node", "20 or later"],
  ["pnpm", "10 or later"],
  ["React", "18 or 19"],
] as const;

const buildOrder = ["tokens", "css", "react", "docs"] as const;

/**
 * A code block with a header bar: the language label on the left, the public `CopyButton` on the
 * right. The `CodeBlock` itself is unchanged underneath, so the `.cdt-code-block` tests keep
 * finding the same element.
 */
export function DocsCode({ code, language }: { readonly code: string; readonly language: string }) {
  return (
    <div className="docs-code">
      <div className="docs-code__bar">
        <span className="docs-code__lang">{language}</span>
        <CopyButton value={code} label="Copy" />
      </div>
      <CodeBlock language={language} code={code} />
    </div>
  );
}

function Step({ id, number, title, children }: { readonly id: string; readonly number: string; readonly title: string; readonly children: ReactNode }) {
  const headingId = `step-${id}`;
  return (
    <li className="docs-step-item">
      <div className="docs-step-item__rail" aria-hidden="true">
        <span className="docs-step-item__number">{number}</span>
      </div>
      <section className="docs-step-item__body" aria-labelledby={headingId}>
        <h2 id={headingId}>{title}</h2>
        {children}
      </section>
    </li>
  );
}

export function GettingStarted() {
  return (
    <section className="cdt-page docs-guide docs-steps-screen" aria-labelledby="getting-started-title">
      <div className="docs-page-head">
        <p className="docs-eyebrow">Start</p>
        <h1 id="getting-started-title">Getting Started</h1>
        <p className="docs-lead">From an empty React application to a themed component in eight short steps. Every step composes the public packages; nothing here is specific to this site.</p>
      </div>

      <ol className="docs-steps-page" role="list">
        <Step id="requirements" number="01" title="Requirements">
          <p className="docs-step-item__note">Conductor ships as ESM packages and expects a current toolchain.</p>
          <Table caption="Consumer requirements">
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Requirement</Table.HeaderCell>
                <Table.HeaderCell>Value</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {requirements.map(([name, value]) => (
                <Table.Row key={name}>
                  <Table.Cell>{name}</Table.Cell>
                  <Table.Cell>{value}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Step>

        <Step id="install" number="02" title="Install">
          <p className="docs-step-item__note">Use these three commands or fewer in a React application.</p>
          <DocsCode language="bash" code={installCode} />
        </Step>

        <Step id="stylesheet" number="03" title="Import the stylesheet">
          <p className="docs-step-item__note">One import loads the tokens, the cascade layers and every component class.</p>
          <DocsCode language="ts" code={styleCode} />
          <Banner tone="warning">If this import is missing, development builds warn once in the console and components render without Conductor styles.</Banner>
        </Step>

        <Step id="theme" number="04" title="Choose a theme">
          <p className="docs-step-item__note">Set the attribute on the root element. Dark is canonical; light is a complete second palette over the same semantic keys, so switching never touches component code.</p>
          <DocsCode language="html" code={themeCode} />
        </Step>

        <Step id="render" number="05" title="Render a component">
          <p className="docs-step-item__note">Each primitive is a React component bound to the same class contract the stylesheet publishes.</p>
          <DocsCode language="tsx" code={renderCode} />
        </Step>

        <Step id="layers" number="06" title="Cascade layers">
          <p className="docs-step-item__note">The generated stylesheet fixes this declaration as its first line. Your own unlayered rules always win, so overrides never need specificity tricks.</p>
          <DocsCode language="css" code={layersCode} />
          <Banner tone="info"><span>Radix CSS custom properties such as <code>--radix-*</code> are inline runtime values, not Conductor layer rules.</span></Banner>
        </Step>

        <Step id="ssr" number="07" title="SSR first paint">
          <p className="docs-step-item__note">Components avoid browser globals during server rendering. Run this browser-only snippet in the document head before hydration so the first paint uses the intended theme.</p>
          <DocsCode language="js" code={ssrThemeCode} />
          <Banner tone="warning"><span>Place this snippet in <code>&lt;head&gt;</code> before application JavaScript to avoid a theme flash.</span></Banner>
        </Step>

        <Step id="build-order" number="08" title="Build order">
          <p className="docs-step-item__note">Each package consumes only the one before it. A reverse reference is a build error, which keeps the stylesheet usable without React.</p>
          <ol className="docs-chain" role="list" aria-label="Build order">
            {buildOrder.map((name, index) => (
              <li key={name} className="docs-chain__item">
                <span className="docs-chain__pkg">{name}</span>
                {index < buildOrder.length - 1 ? <span className="docs-chain__arrow" aria-hidden="true"><ArrowRight size={16} strokeWidth={1.75} /></span> : null}
              </li>
            ))}
          </ol>
        </Step>
      </ol>

      <div className="docs-pointer">
        <div className="docs-pointer__body">
          <span className="docs-pointer__icon"><Component size={20} strokeWidth={1.75} aria-hidden="true" /></span>
          <div className="docs-pointer__text">
            <strong>Where to next</strong>
            <span>Browse the component catalog for live previews, or open the token reference to compare every value across both themes.</span>
          </div>
        </div>
        <div className="docs-pointer__actions">
          <Link className="cdt-btn cdt-btn--primary cdt-btn--tone-accent" to="/components">Browse components<ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" /></Link>
          <Link className="cdt-btn cdt-btn--secondary cdt-btn--tone-neutral" to="/tokens/reference">Token reference</Link>
        </div>
      </div>
    </section>
  );
}
