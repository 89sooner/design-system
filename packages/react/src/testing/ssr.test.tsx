import { createElement } from "react";
import { describe, expect, test } from "vitest";
import { renderAllToString } from "./ssr";

describe("SSR smoke harness", () => {
  test("FR-DX-004 AC-1: registered component render functions complete in Node", () => {
    expect(() => renderAllToString([{ name: "Fixture", render: () => createElement("div", null, "SSR") }])).not.toThrow();
  });
});
