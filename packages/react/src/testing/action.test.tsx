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

  test("FR-A11Y-005 AC-3: IconButton hides its decorative icon", () => {
    const ref = createRef<HTMLButtonElement>();
    const { getByRole } = render(<IconButton ref={ref} aria-label="Close" icon={<svg />} />);
    expect(getByRole("button").querySelector("span")?.getAttribute("aria-hidden")).toBe("true");
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
