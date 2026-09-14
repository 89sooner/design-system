import { createRef, useState, type ComponentProps } from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { AppShell, AppShellNavTrigger, NavList, TopBar, type NavItem } from "../shell";
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
    expect(main.id).toMatch(/^cdt-main-/);
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

  test("FR-CMP-009 AC-3: the mobile scrim is a button that closes the navigation", () => {
    function Fixture({ label }: { readonly label?: string }) {
      const [open, setOpen] = useState(false);
      return (
        <AppShell
          nav={<NavList items={items} renderLink={renderAnchor} aria-label="Documentation" />}
          navOpen={open}
          onNavOpenChange={setOpen}
          navCloseLabel={label}
          skipLinkLabel="Skip"
          topBar={<TopBar menuButton={<button type="button" onClick={() => setOpen(true)}>Open navigation</button>} />}
        >
          Content
        </AppShell>
      );
    }

    const { getByRole, queryByRole, unmount } = render(<Fixture />);
    fireEvent.click(getByRole("button", { name: "Open navigation" }));
    fireEvent.click(getByRole("button", { name: "Close navigation" }));
    expect(queryByRole("dialog", { name: "Navigation" })).toBeNull();
    unmount();

    const custom = render(<Fixture label="내비게이션 닫기" />);
    fireEvent.click(custom.getByRole("button", { name: "Open navigation" }));
    expect(custom.getByRole("button", { name: "내비게이션 닫기" }).classList.contains("cdt-app-shell__overlay")).toBe(true);
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

// Regression: an unlinked consumer trigger loses focus after Radix unmounts the drawer.
test("FR-CMP-009: legacy trigger Escape restores focus without a consumer animation frame", async () => {
  function Fixture() {
    const [open, setOpen] = useState(false);
    return <AppShell navOpen={open} onNavOpenChange={setOpen} nav={<button>Nav item</button>} skipLinkLabel="Skip" topBar={<button onClick={() => setOpen(true)}>Menu</button>}>Content</AppShell>;
  }
  const view = render(<Fixture />);
  const trigger = view.getByRole("button", { name: "Menu" });
  trigger.focus();
  fireEvent.click(trigger);
  fireEvent.keyDown(view.getByRole("dialog"), { key: "Escape" });
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

test("FR-CMP-013: linked shell trigger IDs, route focus, and repeated main IDs", async () => {
  const view = render(<AppShell nav={<button>Destination</button>} routeKey="one" skipLinkLabel="Skip" topBar={<AppShellNavTrigger>Menu</AppShellNavTrigger>}>First</AppShell>);
  const trigger = view.getByRole("button", { name: "Menu" });
  trigger.focus(); fireEvent.click(trigger);
  const dialog = view.getByRole("dialog");
  expect(trigger.getAttribute("aria-controls")).toBe(dialog.id);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  view.rerender(<AppShell nav={<button>Destination</button>} routeKey="two" skipLinkLabel="Skip" topBar={<AppShellNavTrigger>Menu</AppShellNavTrigger>}>Second</AppShell>);
  await waitFor(() => expect(document.activeElement).toBe(view.getByRole("main")));
  expect(view.queryByRole("dialog")).toBeNull();
  view.rerender(<><AppShell nav={null} skipLinkLabel="First">One</AppShell><AppShell nav={null} skipLinkLabel="Second">Two</AppShell></>);
  const mains = view.getAllByRole("main");
  expect(mains[0]?.id).not.toBe(mains[1]?.id);
});

test("FR-CMP-013: outside focus closes navigation without stealing destination focus", async () => {
  const view = render(<AppShell nav={<button>Nav item</button>} skipLinkLabel="Skip" topBar={<AppShellNavTrigger>Menu</AppShellNavTrigger>}><button>Result action</button></AppShell>);
  fireEvent.click(view.getByRole("button", { name: "Menu" }));
  const destination = view.getByRole("button", { name: "Result action" });
  destination.focus();
  await waitFor(() => expect(view.queryByRole("dialog")).toBeNull());
  expect(document.activeElement).toBe(destination);
});

test("FR-CMP-013: moving to desktop closes drawer and focuses visible main", async () => {
  let listener: (() => void) | undefined;
  const media = { matches: true, addEventListener: (_: string, callback: () => void) => { listener = callback; }, removeEventListener: vi.fn() };
  vi.stubGlobal("matchMedia", vi.fn(() => media));
  try {
    const view = render(<AppShell nav={<button>Nav item</button>} skipLinkLabel="Skip" topBar={<AppShellNavTrigger>Menu</AppShellNavTrigger>}>Content</AppShell>);
    fireEvent.click(view.getByRole("button", { name: "Menu" }));
    expect(view.getByRole("dialog")).not.toBeNull();
    media.matches = false;
    listener?.();
    await waitFor(() => expect(view.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(view.getByRole("main"));
    view.unmount(); expect(media.removeEventListener).toHaveBeenCalled();
  } finally { vi.unstubAllGlobals(); }
});

test("FR-CMP-013: scrim focus is a dismissal gesture and restores the opener", async () => {
  const view = render(<AppShell nav={<button>Nav item</button>} skipLinkLabel="Skip" topBar={<AppShellNavTrigger>Menu</AppShellNavTrigger>}>Content</AppShell>);
  const trigger = view.getByRole("button", { name: "Menu" });
  trigger.focus(); fireEvent.click(trigger);
  const scrim = view.getByRole("button", { name: "Close navigation" });
  scrim.focus(); fireEvent.click(scrim);
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});
