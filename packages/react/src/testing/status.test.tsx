import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { Badge, SeverityTag, StatusBadge, type SeverityTagProps, type StatusBadgeProps } from "../status";
import { runContractSuite } from "./contract";

runContractSuite("Badge", Badge, { children: "Badge" }, "cdt-badge");
runContractSuite<HTMLSpanElement, StatusBadgeProps>("StatusBadge", StatusBadge, { status: "running", icon: "●", label: "Running" }, "cdt-badge");
runContractSuite<HTMLSpanElement, SeverityTagProps>("SeverityTag", SeverityTag, { severity: "destructive", icon: "●", label: "Destructive" }, "cdt-badge");

afterEach(cleanup);

describe("status components", () => {
  test("FR-CMP-004 AC-1: StatusBadge renders running colour class, icon and text", () => {
    const { getByText } = render(<StatusBadge status="running" icon="●" label="Running" />);
    const badge = getByText("Running");
    expect(badge.classList.contains("cdt-status-badge--running")).toBe(true);
    expect(badge.querySelector(".cdt-badge__icon")?.getAttribute("aria-hidden")).toBe("true");
  });

  test("FR-CMP-004 AC-2: status and severity icons are hidden while labels name the badges", () => {
    const { getByText } = render(<SeverityTag severity="destructive" icon="⚠" label="Destructive" />);
    const tag = getByText("Destructive");
    expect(tag.textContent).toBe("⚠Destructive");
    expect(tag.querySelector(".cdt-badge__icon")?.getAttribute("aria-hidden")).toBe("true");
  });

  test("FR-CMP-004 AC-3: StatusBadge only accepts the seven token statuses", () => {
    // @ts-expect-error Status values are the FR-TOK-005 seven-value union.
    <StatusBadge status="unknown" icon="●" label="Unknown" />;
    expect(true).toBe(true);
  });

  test("FR-CMP-004 AC-4: SeverityTag renders destructive colour class, warning icon and text", () => {
    const { getByText } = render(<SeverityTag severity="destructive" icon="⚠" label="Destructive" />);
    const tag = getByText("Destructive");
    expect(tag.classList.contains("cdt-severity-tag--destructive")).toBe(true);
    expect(tag.querySelector(".cdt-badge__icon")?.getAttribute("aria-hidden")).toBe("true");
  });

  test("FR-CMP-004 AC-5 / FR-A11Y-003 AC-1: all statuses retain distinct text labels", () => {
    const statuses = ["queued", "running", "waiting", "success", "partial", "danger", "neutralEnd"] as const;
    const { getByText } = render(<>{statuses.map((status) => <StatusBadge key={status} status={status} icon="●" label={`Status ${status}`} />)}</>);
    for (const status of statuses) expect(getByText(`Status ${status}`)).not.toBeNull();
  });

  test("FR-A11Y-003: Badge hides an optional decorative icon", () => {
    const { getByText } = render(<Badge icon="●">Neutral</Badge>);
    expect(getByText("Neutral").querySelector(".cdt-badge__icon")?.getAttribute("aria-hidden")).toBe("true");
  });
});
