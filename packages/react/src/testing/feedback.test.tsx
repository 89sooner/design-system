import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Banner, EmptyState, Meter, ProgressRing, Spinner } from "../feedback";

afterEach(cleanup);

describe("feedback components", () => {
  test("FR-CMP-008 AC-1 / AC-2: Banner exposes its live role and warns for a missing danger action", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { getByRole, rerender } = render(<Banner tone="danger">Problem</Banner>);
    expect(getByRole("alert")).not.toBeNull();
    expect(warn).toHaveBeenCalledOnce();
    rerender(<Banner tone="info">Information</Banner>);
    expect(getByRole("status")).not.toBeNull();
    warn.mockRestore();
  });

  test("FR-CMP-008 AC-3 / FR-A11Y-005 AC-3: EmptyState renders slots and hides its icon", () => {
    const { getByText } = render(<EmptyState title="No jobs" description="Try again" action={<button type="button">Retry</button>} icon={<svg />} />);
    expect(getByText("No jobs").parentElement?.querySelector(".cdt-empty-state__icon")?.getAttribute("aria-hidden")).toBe("true");
    expect(getByText("Try again")).not.toBeNull();
    expect(getByText("Retry")).not.toBeNull();
  });

  test("FR-CMP-008 AC-4 / FR-A11Y-003 AC-3: Meter provides text, range semantics, and threshold tone", () => {
    const { getByRole, rerender } = render(<Meter aria-label="Usage" value={80} warningAt={70} exceededAt={90} valueText="80% used" />);
    expect(getByRole("meter").classList.contains("cdt-meter--warning")).toBe(true);
    expect(getByRole("meter").getAttribute("aria-valuenow")).toBe("80");
    rerender(<Meter aria-label="Usage" value={95} warningAt={70} exceededAt={90} valueText="95% used" />);
    expect(getByRole("meter").classList.contains("cdt-meter--exceeded")).toBe(true);
  });

  test("FR-CMP-008 AC-5: ProgressRing and Spinner keep text alternatives in the DOM", () => {
    const { getByRole, getByText } = render(<><ProgressRing aria-label="Upload" value={50} valueText="50% complete" /><Spinner label="Loading jobs" /></>);
    expect(getByRole("progressbar").getAttribute("aria-valuetext")).toBe("50% complete");
    expect(getByRole("status").getAttribute("aria-live")).toBe("polite");
    expect(getByText("Loading jobs")).not.toBeNull();
  });
});
