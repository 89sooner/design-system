// Refs: CR-069 FR-CSS-001 AC-5 DS-PILOT-21
//
// `component.css` leaves the global reset to the consumer. A consumer element rule that sits outside
// any layer outranks every `cdt.*` layer and silently replaces component typography; the same rule in
// a layer declared before `cdt` stays underneath. Both documents below load the real stylesheet.
import { expect, test } from "vitest";
import "@conductor-by-89soone/css/component.css";

/** The built `component.css`, as the browser test runner injected it. */
const conductorCss = (): string => {
  const sheet = [...document.querySelectorAll("style")].map((style) => style.textContent ?? "").find((text) => text.includes("@layer cdt.reset"));
  if (sheet === undefined) throw new Error("component.css was not injected");
  return sheet;
};

interface Typography { readonly weight: string; readonly size: string }

/** The consumer page's own body font: what an unlayered `font: inherit` hands every button. */
const INHERITED: Typography = { weight: "400", size: "16px" }; /* cdt-allow-literal: the consumer's body font, deliberately not a Conductor value */

/** Renders a Conductor button and a tab trigger in a fresh document: consumer CSS before, Conductor, consumer CSS after. */
async function typography(before: string, after: string): Promise<{ readonly button: Typography; readonly tab: Typography }> {
  const frame = document.createElement("iframe");
  const loaded = new Promise((resolve) => frame.addEventListener("load", resolve, { once: true }));
  frame.srcdoc = `<!doctype html><html data-cdt-theme="dark"><head><style>${before}</style><style>${conductorCss()}</style><style>${after}</style></head>`
    + `<body style="font: ${INHERITED.weight} ${INHERITED.size} sans-serif"><button class="cdt-btn">Save</button><button class="cdt-tabs__trigger">Results</button></body></html>`;
  document.body.append(frame);
  await loaded;
  const read = (selector: string): Typography => {
    const style = getComputedStyle(frame.contentDocument!.querySelector(selector)!);
    return { weight: style.fontWeight, size: style.fontSize };
  };
  const result = { button: read(".cdt-btn"), tab: read(".cdt-tabs__trigger") };
  frame.remove();
  return result;
}

const RESET = "button, input, textarea, select { font: inherit; }";

test("CR-069 FR-CSS-001 AC-5: a consumer reset in a layer declared before cdt keeps Conductor typography", async () => {
  const conductor = await typography("", "");
  // Conductor sets its own weight and size, so the comparison below is not trivially equal to the inherited font.
  expect(conductor.button).not.toEqual(INHERITED);
  expect(conductor.tab.weight).not.toBe(INHERITED.weight);

  const layered = await typography(`@layer app.reset, cdt;\n@layer app.reset { ${RESET} }`, "");
  expect(layered).toEqual(conductor);
});

test("CR-069 FR-CSS-001 AC-5: an unlayered consumer reset replaces Conductor typography (the documented hazard)", async () => {
  const conductor = await typography("", "");
  const unlayered = await typography("", RESET);
  expect(unlayered.button).toEqual(INHERITED);
  expect(unlayered.tab.weight).toBe(INHERITED.weight);
  expect(unlayered.button).not.toEqual(conductor.button);
});
