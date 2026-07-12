import { createRef, useState, type ComponentProps } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { AppShell, NavList, TopBar, type NavItem } from "../shell";
import { runContractSuite } from "./contract";

const items: readonly NavItem[] = [
  { id: "overview", label: "Overview", href: "/", active: true, section: "Start", icon: "●" },
  { id: "guide", label: "Guide", href: "/guide", section: "Start" },
  { id: "tokens", label: "Tokens", href: "/tokens", section: "Reference" },
];

const renderAnchor = (item: NavItem, props: Parameters<ComponentProps<typeof NavList>["renderLink"]>[1]) => (
  <a href={item.href} {...props} />
);

runContractSuite("AppShell", AppShell, { nav: null, skipLinkLabel: "Skip", children: "Content" }, "cdt-app-shell");
runContractSuite("NavList", NavList, { items: [], renderLink: () => null, "aria-label": "Navigation" }, "cdt-nav-list");
runContractSuite("TopBar", TopBar, {}, "cdt-topbar");

afterEach(cleanup);

describe("shell components", () => {
  test("FR-CMP-009 AC-1: NavList delegates links and supplies active state, content and consecutive sections", () => {
    const renderLink = vi.fn(renderAnchor);
    const { getByRole, getAllByText } = render(<NavList items={items} renderLink={renderLink} aria-label="Documentation" />);
    const active = getByRole("link", { name: "Overview" });
    expect(renderLink).toHaveBeenCalledTimes(3);
    expect(active.getAttribute("href")).toBe("/");
    expect(active.getAttribute("aria-current")).toBe("page");
    expect(active.classList.contains("cdt-nav-list__item--active")).toBe(true);
    expect(active.querySelector("[aria-hidden=true]")).not.toBeNull();
    expect(getAllByText("Start")).toHaveLength(1);
    expect(getAllByText("Reference")).toHaveLength(1);
  });

  test("FR-CMP-009 AC-4: AppShell renders a skip link and moves focus to its main region", () => {
    const ref = createRef<HTMLDivElement>();
    const { getByRole } = render(<AppShell ref={ref} nav={null} skipLinkLabel="Skip to content"><h1>Page</h1></AppShell>);
    const main = getByRole("main");
    fireEvent.click(getByRole("link", { name: "Skip to content" }));
    expect(document.activeElement).toBe(main);
    expect(main.id).toBe("cdt-main");
    expect(ref.current?.classList.contains("cdt-app-shell")).toBe(true);
  });

  test("FR-CMP-009 AC-3: AppShell delegates Escape dismissal to Radix", () => {
    function Fixture() {
      const [open, setOpen] = useState(false);
      return (
        <AppShell
          nav={<NavList items={items} renderLink={renderAnchor} aria-label="Documentation" />}
          navOpen={open}
          onNavOpenChange={setOpen}
          skipLinkLabel="Skip"
          topBar={<TopBar menuButton={<button type="button" onClick={() => setOpen(true)}>Open navigation</button>} />}
        >
          Content
        </AppShell>
      );
    }

    const { getByRole, queryByRole } = render(<Fixture />);
    fireEvent.click(getByRole("button", { name: "Open navigation" }));
    const dialog = getByRole("dialog", { name: "Navigation" });
    expect(dialog.querySelector("nav")?.getAttribute("aria-label")).toBe("Documentation");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(queryByRole("dialog", { name: "Navigation" })).toBeNull();
  });

  test("C-072: TopBar renders context, actions and the consumer-owned menu button", () => {
    const { getByRole, getByText } = render(
      <TopBar eyebrow="Design system" title="Components" actions={<button type="button">Theme</button>} menuButton={<button type="button">Menu</button>} />,
    );
    expect(getByRole("banner").querySelector("h1")).toBeNull();
    expect(getByText("Design system")).not.toBeNull();
    expect(getByText("Components")).not.toBeNull();
    expect(getByRole("button", { name: "Menu" })).not.toBeNull();
    expect(getByRole("button", { name: "Theme" })).not.toBeNull();
  });
});
