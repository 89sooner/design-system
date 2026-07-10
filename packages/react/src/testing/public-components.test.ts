import { createElement } from "react";
import { describe, expect, test } from "vitest";
import { missingComponentTests, publicComponents } from "./public-components";
import { renderAllToString } from "./ssr";

describe("public component test coverage", () => {
  test("FR-QA-002 AC-1: every registered public component declares an existing test file", () => {
    expect(missingComponentTests(publicComponents, [])).toEqual([]);
  });

  test("FR-QA-002 exception: a public component without a test file is reported by name", () => {
    expect(
      missingComponentTests([{ name: "Uncovered", testFile: "uncovered.test.tsx", render: () => createElement("div") }], []),
    ).toEqual(["Uncovered"]);
  });

  test("FR-DX-004 AC-1: the registered public component set is rendered by the SSR smoke harness", () => {
    expect(() => renderAllToString(publicComponents)).not.toThrow();
  });
});
