"use client";

// FR 범위: FR-CMP-009, FR-A11Y-002, FR-CSS-002
import * as RadixDialog from "@radix-ui/react-dialog";
import {
  Fragment,
  forwardRef,
  useRef,
  useId,
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { breakpoints } from "@conductor-by-89soone/tokens";
import { cx } from "./cx";

export interface AppShellProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  readonly nav: ReactNode;
  readonly topBar?: ReactNode;
  readonly navOpen?: boolean;
  readonly onNavOpenChange?: (open: boolean) => void;
  readonly skipLinkLabel: string;
  /** Accessible name of the mobile navigation scrim, which closes the drawer. */
  readonly navCloseLabel?: string;
  readonly mainId?: string;
  /** Changing this consumer-owned route identity closes navigation and focuses main. */
  readonly routeKey?: string;
  readonly navLabel?: string;
  readonly children: ReactNode;
}

export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(function AppShell(
  {
    children,
    className,
    mainId: suppliedMainId,
    routeKey,
    navLabel = "Navigation",
    nav,
    navCloseLabel = "Close navigation",
    navOpen,
    onNavOpenChange,
    skipLinkLabel,
    topBar,
    ...props
  },
  ref,
) {
  const mainRef = useRef<HTMLElement>(null);
  const generatedId = useId();
  const mainId = suppliedMainId ?? `cdt-main-${generatedId}`;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = navOpen ?? internalOpen;
  const returnFocus = useRef<HTMLElement | null>(null);
  const outsideInteraction = useRef(false);
  const routeChanged = useRef(false);
  const previousRoute = useRef(routeKey);
  const changeOpen = (next: boolean) => {
    setInternalOpen(next);
    onNavOpenChange?.(next);
  };
  const changeOpenRef = useRef(changeOpen);
  changeOpenRef.current = changeOpen;
  useEffect(() => {
    if (previousRoute.current === routeKey) return;
    previousRoute.current = routeKey;
    routeChanged.current = true;
    changeOpenRef.current(false);
    mainRef.current?.focus({ preventScroll: true });
  }, [routeKey]);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia(`(max-width: ${breakpoints.md}px)`);
    const onChange = () => {
      if (!media.matches) {
        routeChanged.current = true;
        changeOpenRef.current(false);
        mainRef.current?.focus({ preventScroll: true });
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <RadixDialog.Root modal={false} open={open} onOpenChange={changeOpen}>
      <div {...props} ref={ref} className={cx("cdt-app-shell", className)}>
        <a
          className="cdt-skip-link"
          href={`#${mainId}`}
          onClick={(event) => {
            event.preventDefault();
            mainRef.current?.focus();
          }}
        >
          {skipLinkLabel}
        </a>
        <aside className="cdt-app-shell__nav" aria-hidden={open || undefined}>
          {open ? null : nav}
        </aside>
        <div className="cdt-app-shell__content">
          {topBar}
          <main ref={mainRef} id={mainId} className="cdt-app-shell__main" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
      <RadixDialog.Portal>
        {/*
          Tapping the scrim is the gesture users reach for first on a phone. As an
          `aria-hidden` div it did nothing, so the drawer could only be dismissed from the
          keyboard. A button restores the gesture and keeps the action reachable — the CSS
          rule already zeroes its border on the assumption that it is one.
        */}
        <RadixDialog.Close asChild>
          <button type="button" className="cdt-app-shell__overlay" aria-label={navCloseLabel} />
        </RadixDialog.Close>
        <RadixDialog.Content className="cdt-app-shell__nav" data-mobile="" aria-describedby={undefined}
          onOpenAutoFocus={() => {
            returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            outsideInteraction.current = false;
            routeChanged.current = false;
          }}
          onInteractOutside={(event) => {
            const target = event.detail.originalEvent.target;
            outsideInteraction.current = !(target instanceof Element && target.closest(".cdt-app-shell__overlay"));
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (routeChanged.current) mainRef.current?.focus({ preventScroll: true });
            else if (!outsideInteraction.current && returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true });
          }}>

          <RadixDialog.Title className="cdt-sr-only">{navLabel}</RadixDialog.Title>
          {nav}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
});
AppShell.displayName = "AppShell";

/** Place inside AppShell, normally in TopBar.menuButton. Use asChild for IconButton. */
export const AppShellNavTrigger = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof RadixDialog.Trigger>>(
  function AppShellNavTrigger({ className, asChild = false, ...props }, ref) {
    return <RadixDialog.Trigger {...props} asChild={asChild} ref={ref} className={cx(!asChild && "cdt-btn cdt-btn--ghost", className)} />;
  },
);
AppShellNavTrigger.displayName = "AppShellNavTrigger";

export interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly icon?: ReactNode;
  readonly active?: boolean;
  readonly section?: string;
}

export interface NavLinkRenderProps {
  readonly className: string;
  readonly "aria-current": "page" | undefined;
  readonly children: ReactNode;
}

export interface NavListProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  readonly items: readonly NavItem[];
  readonly renderLink: (item: NavItem, props: NavLinkRenderProps) => ReactNode;
  readonly "aria-label": string;
}

export const NavList = forwardRef<HTMLElement, NavListProps>(function NavList(
  { className, items, renderLink, ...props },
  ref,
) {
  let previousSection: string | undefined;

  return (
    <nav {...props} ref={ref} className={cx("cdt-nav-list", className)}>
      <ul className="cdt-nav-list__items">
        {items.map((item) => {
          const showSection = item.section !== undefined && item.section !== previousSection;
          previousSection = item.section;
          const linkProps: NavLinkRenderProps = {
            className: cx("cdt-nav-list__item", item.active && "cdt-nav-list__item--active"),
            "aria-current": item.active ? "page" : undefined,
            children: (
              <>
                {item.icon === undefined ? null : <span className="cdt-nav-list__icon" aria-hidden="true">{item.icon}</span>}
                <span>{item.label}</span>
              </>
            ),
          };

          return (
            <Fragment key={item.id}>
              {showSection ? <li className="cdt-nav-list__section-label">{item.section}</li> : null}
              <li>{renderLink(item, linkProps)}</li>
            </Fragment>
          );
        })}
      </ul>
    </nav>
  );
});
NavList.displayName = "NavList";

export interface TopBarProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "title"> {
  readonly eyebrow?: ReactNode;
  readonly title?: ReactNode;
  readonly actions?: ReactNode;
  readonly menuButton?: ReactNode;
}

export const TopBar = forwardRef<HTMLElement, TopBarProps>(function TopBar(
  { actions, className, eyebrow, menuButton, title, ...props },
  ref,
) {
  return (
    <header {...props} ref={ref} className={cx("cdt-topbar", className)} title={typeof title === "string" ? title : undefined}>
      {menuButton === undefined ? null : <div className="cdt-topbar__menu-button">{menuButton}</div>}
      {eyebrow === undefined && title === undefined ? null : (
        <div className="cdt-topbar__context">
          {eyebrow === undefined ? null : <div className="cdt-topbar__eyebrow">{eyebrow}</div>}
          {title === undefined ? null : <div className="cdt-topbar__title">{title}</div>}
        </div>
      )}
      {actions === undefined ? null : <div className="cdt-topbar__actions">{actions}</div>}
    </header>
  );
});
TopBar.displayName = "TopBar";
