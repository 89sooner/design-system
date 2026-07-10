import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Card, CardGrid, Panel } from "../surface";
import { runContractSuite } from "./contract";

runContractSuite("Card", Card, { children: "Card" }, "cdt-card");
runContractSuite("CardGrid", CardGrid, {}, "cdt-card-grid");
runContractSuite("Panel", Panel, {}, "cdt-panel");

afterEach(cleanup);

describe("surface components", () => {
  test("FR-CMP-003 AC-1: Card with onClick renders as a focusable button", () => {
    const { getByRole } = render(<Card onClick={() => undefined}>Card</Card>);
    expect(getByRole("button").classList.contains("cdt-card--interactive")).toBe(true);
  });

  test("FR-CMP-003 AC-1: Card with href renders as a link", () => {
    const { getByRole } = render(<Card href="/details">Card</Card>);
    expect(getByRole("link").getAttribute("href")).toBe("/details");
  });

  test("FR-CMP-003 AC-3: static Card renders as a non-focusable div", () => {
    const { getByText } = render(<Card>Card</Card>);
    expect(getByText("Card").tagName).toBe("DIV");
    expect(getByText("Card").getAttribute("tabindex")).toBeNull();
  });

  test("FR-CMP-003 exception: interactive Card warns about nested interactive content in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<Card onClick={() => undefined}><button type="button">Nested</button></Card>);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Interactive Card"));
    warn.mockRestore();
    error.mockRestore();
  });
});
