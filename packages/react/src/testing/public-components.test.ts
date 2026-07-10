import { createElement } from "react";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { missingComponentTests, publicComponents } from "./public-components";
import { renderAllToString } from "./ssr";

describe("public component test coverage", () => {
  test("FR-QA-002 AC-1: every registered public component declares an existing test file", () => {
    const root = existsSync("packages/react/src") ? "packages/react/src" : "src";
    const files = publicComponents.map((component) => component.testFile).filter((file) => existsSync(join(root, file)));
    expect(missingComponentTests(publicComponents, files)).toEqual([]);
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
