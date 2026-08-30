import { createRef } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Button, IconButton } from "../action";
import { runContractSuite } from "./contract";

runContractSuite("Button", Button, { children: "Button" }, "cdt-btn");
runContractSuite("IconButton", IconButton, { "aria-label": "Icon", icon: "●" }, "cdt-btn");

afterEach(cleanup);

describe("action components", () => {
  test("FR-CMP-002 AC-1: Button supports primary, secondary and ghost variants", () => {
    for (const variant of ["primary", "secondary", "ghost"] as const) {
      const { unmount, getByRole } = render(<Button variant={variant}>Action</Button>);
      expect(getByRole("button").classList.contains(`cdt-btn--${variant}`)).toBe(true);
      unmount();
    }
  });

  test("FR-CMP-002 AC-2: loading sets aria-busy and suppresses click handlers", () => {
    const onClick = vi.fn();
    const { getByRole } = render(<Button loading onClick={onClick}>Action</Button>);
    fireEvent.click(getByRole("button"));
    expect(getByRole("button").getAttribute("aria-busy")).toBe("true");
    expect(onClick).not.toHaveBeenCalled();
  });

  test("FR-CMP-002 AC-2: loading also draws a visual signal, not only aria-busy", () => {
    const { getByRole, rerender } = render(<Button loading>Action</Button>);
    const button = getByRole("button");
    expect(button.querySelector(".cdt-spinner")).not.toBeNull();
    // The spinner replaces iconStart rather than joining it, so the label never shifts.
    rerender(<Button loading iconStart={<svg data-testid="start" />}>Action</Button>);
    expect(button.querySelector("[data-testid=start]")).toBeNull();
    rerender(<Button iconStart={<svg data-testid="start" />}>Action</Button>);
    expect(button.querySelector(".cdt-spinner")).toBeNull();
    expect(button.querySelector("[data-testid=start]")).not.toBeNull();
  });

  test("FR-A11Y-005: the loading spinner stays out of the accessibility tree", () => {
    const { getByRole } = render(<Button loading>Action</Button>);
    // `aria-busy` on the button is the announced state; a second live region would double it.
    expect(getByRole("button").querySelector(".cdt-spinner")?.getAttribute("aria-hidden")).toBe("true");
  });

  test("FR-CMP-002 AC-3: IconButton requires aria-label at the type level", () => {
    // @ts-expect-error IconButton has no accessible fallback name.
    <IconButton icon="●" />;
    expect(true).toBe(true);
  });

  test("FR-CMP-002 AC-4: disabled Button exposes the native disabled state", () => {
    const { getByRole } = render(<Button disabled>Action</Button>);
    expect((getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  });

  test("FR-CMP-002 exception: disabled visuals win while loading keeps aria-busy", () => {
    const { getByRole } = render(<Button disabled loading>Action</Button>);
    const button = getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
  });

  test("C-002: IconButton carries no size-specific class; the compound selector sizes it", () => {
    const { getByRole } = render(<IconButton aria-label="Close" icon="●" size="sm" />);
    const button = getByRole("button");
    expect(button.classList.contains("cdt-btn--icon")).toBe(true);
    expect(button.classList.contains("cdt-btn--sm")).toBe(true);
    expect(button.classList.contains("cdt-btn--icon-sm")).toBe(false);
  });

  test("FR-A11Y-005 AC-3: IconButton hides its decorative icon", () => {
    const ref = createRef<HTMLButtonElement>();
    const { getByRole } = render(<IconButton ref={ref} aria-label="Close" icon={<svg />} />);
    expect(getByRole("button").querySelector("span")?.getAttribute("aria-hidden")).toBe("true");
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  test("FR-CMP-002 AC-2: loading replaces IconButton's glyph rather than joining it", () => {
    // A fixed-width icon button has no room for two glyphs. Passing the icon as children left the
    // original in place beside the spinner, so the loading state widened the control instead of
    // changing what it shows (PR #8 review P2).
    const { getByRole, rerender } = render(
      <IconButton aria-label="Close" icon={<svg data-testid="glyph" />} />,
    );
    expect(getByRole("button").querySelectorAll("svg")).toHaveLength(1);

    rerender(<IconButton loading aria-label="Close" icon={<svg data-testid="glyph" />} />);
    const button = getByRole("button");
    expect(button.querySelector("[data-testid='glyph']")).toBeNull();
    // The spinner is the only glyph now — one in, one out.
    expect(button.querySelectorAll("svg")).toHaveLength(1);
    expect(button.getAttribute("aria-busy")).toBe("true");
  });
});
