// FR 범위: FR-CMP-009, FR-A11Y-002, FR-CSS-002
import * as RadixDialog from "@radix-ui/react-dialog";
import {
  Fragment,
  forwardRef,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
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
  readonly children: ReactNode;
}

export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(function AppShell(
  {
    children,
    className,
    mainId = "cdt-main",
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

  return (
    <RadixDialog.Root modal={false} open={navOpen} onOpenChange={onNavOpenChange}>
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
        <aside className="cdt-app-shell__nav" aria-hidden={navOpen || undefined}>
          {navOpen ? null : nav}
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
        <RadixDialog.Content className="cdt-app-shell__nav" data-mobile="">
          <RadixDialog.Title className="cdt-sr-only">Navigation</RadixDialog.Title>
          {nav}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
});
AppShell.displayName = "AppShell";

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
