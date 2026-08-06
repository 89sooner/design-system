/**
 * Component tokens — local specifications that reference semantic tokens only
 * (FR-TOK-002 AC-3). A primitive key or a raw colour literal in this file fails the build.
 *
 * Values from `conductor_design_system_tokens.md` section 7. A theme swaps the *values* these
 * references resolve to, never the keys, which is why a single expression covers both palettes
 * (tokens spec 10.4). WP-010 adds the handful of light-only value overrides.
 *
 * `usage`: `decorative` unless the token is declared as a foreground of a contrast pair in
 * tokens spec 8.2. Pairs are explicit, not derived from the token graph, so a component token
 * that copies a checked semantic token (`input.focusRing` → `focusRing`) does not re-declare
 * the obligation — the semantic token already carries it (tokens spec 8.4).
 *
 * Refs: WP-002 FR-TOK-002 FR-CMP-002 FR-CMP-003 FR-CMP-004 FR-CMP-005 FR-CMP-006 FR-CMP-007 FR-CMP-009
 */
import type { TokenDefinition, TokenUsage } from "./schema";
import { FONT_SIZE_PX, roundHalfUp } from "./scales";

function component(
  key: string,
  source: { value: string | number } | { alias: string },
  description: string,
  usage: TokenUsage = "decorative",
): TokenDefinition {
  return { key, tier: "component", usage, description, ...source };
}

const value = (literal: string | number) => ({ value: literal });
const ref = (key: string) => ({ alias: key });

/**
 * `button.primary` is a flat fill, and hover does not repaint it.
 * The source painted a gradient from `accent` to `accent.strong`; white text measures 3.51:1 at
 * one end and `text.inverse` measures 4.20:1 at the other, so no label colour clears body 4.5:1
 * across the whole ramp. A flat `{accent}` under `{text.inverse}` gives 5.39:1, and hover is
 * expressed with `elevation.hover` instead (tokens spec 7.1).
 */
const button: TokenDefinition[] = [
  component("button.minHeight", value("40px"), "Minimum target height."),
  component("button.minHeightCompact", value("42px"), "Minimum height below `breakpoint.sm`."),
  component("button.paddingBlock", ref("space.2"), "Vertical padding."),
  component("button.paddingInline", value("14px"), "Horizontal padding."),
  component("button.radius", ref("radius.md"), "Corner radius."),
  component("button.fontSize", ref("font.size.md"), "Label size. 14px for body-level readability."),
  component("button.gap", ref("space.2"), "Gap between icon and label."),
  component("button.transition", ref("motion.fast"), "State transition."),
  component("button.primary.background", ref("accent.DEFAULT"), "Primary fill."),
  component("button.primary.backgroundHover", ref("accent.DEFAULT"), "Primary fill stays flat on hover."),
  component("button.primary.text", ref("text.inverse"), "Primary label. 5.39:1 on the fill.", "body"),
  component("button.primary.border", value("transparent"), "Primary needs no edge."),
  component("button.primary.shadow", ref("elevation.raised"), "Primary resting shadow."),
  component("button.primary.shadowHover", ref("elevation.hover"), "Primary hover shadow."),
  component("button.secondary.background", ref("surface.raised"), "Secondary fill."),
  component("button.secondary.backgroundHover", ref("surface.elevated"), "Secondary hover fill."),
  component("button.secondary.text", ref("text.primary"), "Secondary label.", "body"),
  component(
    "button.secondary.border",
    ref("border.strong"),
    "Secondary edge. Not `border.control`: FR-THM-005 AC-2 scopes that token to the five form " +
      "controls, and a button is identified by its fill, label and focus ring.",
  ),
  component("button.secondary.borderHover", ref("accent.DEFAULT"), "Secondary hover edge."),
  component("button.ghost.background", value("transparent"), "Ghost has no fill."),
  component("button.ghost.backgroundHover", ref("state.hover"), "Ghost hover wash."),
  component("button.ghost.text", ref("text.muted"), "Ghost label.", "body"),
  component("button.ghost.textHover", ref("text.primary"), "Ghost hover label.", "body"),
  component("button.ghost.border", value("transparent"), "Ghost has no edge."),
  component("button.disabled.background", ref("state.disabled"), "Disabled fill."),
  component("button.disabled.text", ref("text.muted"), "Disabled label. 5.05:1 on the fill.", "body"),
  component("button.disabled.border", ref("border.default"), "Disabled edge."),
  component("button.policyDisabled.background", ref("state.disabledPolicy"), "Policy-blocked fill."),
  component(
    "button.policyDisabled.text",
    ref("meter.exceeded"),
    "Policy-blocked label. 5.27:1 on the dark amber fill (CP-041); `status.danger` would be 3.87:1.",
    "body",
  ),
  component("button.policyDisabled.border", ref("status.danger"), "Policy-blocked edge."),
  component("button.focusRing", ref("focusRing"), "Focus indicator."),
];

const card: TokenDefinition[] = [
  component("card.background", ref("surface.glass"), "Card fill."),
  component("card.border", ref("border.default"), "Card edge."),
  component("card.radius", ref("radius.lg"), "Card radius."),
  component("card.radiusCompact", ref("radius.md"), "Card radius below `breakpoint.sm`."),
  component("card.padding", ref("space.5"), "Card padding."),
  component("card.paddingCompact", value("18px"), "Card padding below `breakpoint.sm`."),
  component("card.shadow", ref("elevation.raised"), "Card resting shadow."),
  component("card.interactive.borderHover", ref("border.strong"), "Interactive card hover edge."),
  component("card.interactive.shadowHover", ref("elevation.hover"), "Interactive card hover shadow."),
  component("card.interactive.translateHover", value("-2px"), "Interactive card hover lift."),
  component("card.interactive.transition", ref("motion.fast"), "Interactive card transition."),
  component("card.grid.minColumn", value("320px"), "`auto-fill` minimum column width."),
  component("card.grid.minColumnCompact", value("260px"), "Minimum column below `breakpoint.lg`."),
  component("card.grid.gap", ref("space.5"), "Grid gap."),
];

/**
 * `StatusBadge` picks its shape from the status token's `usage`, not from a prop.
 * Fill shape (`usage: body`) paints the status colour and sets `text.inverse` on top.
 * Marker shape (`usage: nonText` / `decorative`) keeps a `surface.raised` background with a
 * `text.primary` label and shows the status colour only as a 9px dot (tokens spec 7.3).
 *
 * `badge.fill.background`, `badge.marker.dot` and `badge.severity.background` are not defined
 * here: the spec lists each as a slot over a set of semantic tokens ("`{status.running}` and 4
 * others") rather than as a single value, so the variant classes in WP-013 supply them.
 */
const badge: TokenDefinition[] = [
  component("badge.radius", value("9999px"), "Pill radius."),
  component("badge.paddingBlock", ref("space.1"), "Vertical padding."),
  component("badge.paddingInline", value("10px"), "Horizontal padding."),
  component("badge.fontSize", ref("font.size.sm"), "Label size."),
  component("badge.lineHeight", ref("font.lineHeight.sm"), "Label line height."),
  component("badge.gap", value("6px"), "Gap between icon and label."),
  component("badge.iconSize", value("12px"), "Icon box."),
  component("badge.fill.text", ref("text.inverse"), "Label on a status fill. 5.03:1 to 9.87:1.", "body"),
  component("badge.marker.background", ref("surface.raised"), "Marker-shape background."),
  component("badge.marker.text", ref("text.primary"), "Marker-shape label. 15.77:1.", "body"),
  component("badge.marker.border", ref("border.strong"), "Marker-shape edge."),
  component("badge.marker.dotSize", value("9px"), "Status dot diameter."),
  component("badge.marker.dotRing", ref("surface.raised"), "Marker dot ring."),
  component("badge.marker.dotRingWidth", ref("border.width.emphasis"), "Marker dot ring width."),
  component("badge.severity.text", ref("text.primary"), "Label on a severity fill. 4.67:1 to 9.32:1.", "body"),
];

const table: TokenDefinition[] = [
  component("table.headerText", ref("text.muted"), "Column header text.", "body"),
  component("table.headerFontSize", ref("font.size.base"), "Column header size."),
  component("table.headerBorder", ref("border.default"), "Header rule."),
  component("table.headerBorderWidth", ref("border.width.emphasis"), "Header rule width."),
  component(
    "table.cellBorder",
    ref("border.default"),
    "Row rule. A decorative border is correct here: row separators divide content, they do not " +
      "identify a component, so WCAG 1.4.11 does not apply.",
  ),
  component("table.cellPaddingBlock", ref("space.4"), "Cell vertical padding."),
  component("table.cellPaddingInline", ref("space.3"), "Cell horizontal padding."),
  component("table.rowBackgroundHover", ref("state.hover"), "Row hover wash."),
  component("table.rowTransition", ref("motion.fast"), "Row hover transition."),
  component("table.linkText", ref("text.secondary"), "In-cell link.", "body"),
  component("table.linkTextHover", ref("text.primary"), "In-cell link hover.", "body"),
  component("table.numFontFamily", ref("font.mono"), "Numeric cell font."),
  component("table.scrollBreakpoint", ref("breakpoint.md"), "Below this, the table scrolls."),
];

const timeline: TokenDefinition[] = [
  component("timeline.background", ref("surface.timeline"), "Timeline fill."),
  component("timeline.border", ref("border.default"), "Timeline edge."),
  component("timeline.stepBackgroundHover", ref("state.hover"), "Interactive step hover fill."),
  component("timeline.markerBackground", ref("accent.DEFAULT"), "Default marker fill."),
  component("timeline.markerRing", ref("accent.glow"), "Default marker glow."),
  component("timeline.markerBorder", ref("surface.timeline"), "Marker ring edge."),
];

const codeBlock: TokenDefinition[] = [
  component("codeBlock.background", ref("surface.timeline"), "Code block fill."),
  component("codeBlock.border", ref("border.default"), "Code block edge."),
  component("codeBlock.text", ref("text.monoPayload"), "Code block text.", "body"),
];

const kbd: TokenDefinition[] = [
  component("kbd.background", ref("surface.raised"), "Keycap fill."),
  component("kbd.border", ref("border.default"), "Keycap edge."),
  component("kbd.borderBottom", ref("border.strong"), "Keycap lower edge."),
  component("kbd.text", ref("text.secondary"), "Keycap text.", "body"),
];

const banner: TokenDefinition[] = [
  component("banner.info.background", ref("surface.raised"), "Info banner surface."),
  component("banner.info.border", ref("status.running"), "Info banner edge."),
  component("banner.info.text", ref("text.secondary"), "Info banner body text.", "body"),
  component("banner.warning.background", ref("surface.raised"), "Warning banner surface."),
  component("banner.warning.border", ref("status.waiting"), "Warning banner edge."),
  component("banner.warning.text", ref("text.secondary"), "Warning banner body text.", "body"),
  component("banner.danger.background", ref("surface.raised"), "Danger banner surface."),
  component("banner.danger.border", ref("status.danger"), "Danger banner edge."),
  component("banner.danger.text", ref("text.secondary"), "Danger banner body text.", "body"),
];

const emptyState: TokenDefinition[] = [
  component("emptyState.titleText", ref("text.primary"), "Empty-state title.", "body"),
  component("emptyState.descriptionText", ref("text.muted"), "Empty-state description.", "body"),
  component("emptyState.padding", ref("space.6"), "Empty-state padding."),
];

const feedbackMeter: TokenDefinition[] = [
  component("feedbackMeter.trackBackground", ref("surface.track"), "Meter track."),
  component("feedbackMeter.fillNormal", ref("meter.normal"), "Normal meter fill."),
  component("feedbackMeter.fillWarning", ref("meter.warning"), "Warning meter fill."),
  component("feedbackMeter.fillExceeded", ref("meter.exceeded"), "Exceeded meter fill."),
  component("feedbackMeter.height", value("8px"), "Meter track height."),
];

const progressRing: TokenDefinition[] = [
  component("progressRing.trackStroke", ref("surface.track"), "Progress-ring track."),
  component("progressRing.indicatorStroke", ref("accent.DEFAULT"), "Progress-ring indicator."),
  component("progressRing.labelText", ref("text.primary"), "Progress-ring label.", "body"),
  component("progressRing.size", value("64px"), "Medium progress-ring diameter."),
  component("progressRing.sizeCompact", value("40px"), "Small progress-ring diameter."),
];

const spinner: TokenDefinition[] = [
  component("spinner.trackStroke", ref("surface.track"), "Spinner track."),
  component("spinner.indicatorStroke", ref("accent.DEFAULT"), "Spinner indicator."),
  component("spinner.size", value("24px"), "Medium spinner diameter."),
  component("spinner.sizeCompact", value("16px"), "Small spinner diameter."),
];

/**
 * Shared by TextField, TextArea, Select, Switch and Checkbox — exactly the five components
 * FR-THM-005 AC-2 scopes `border.control` to. The input's fill matches the surface around it and
 * the label sits outside the box, so the edge is the only thing that bounds the control.
 */
const input: TokenDefinition[] = [
  component("input.minHeight", value("40px"), "Minimum target height."),
  component("input.minHeightCompact", value("42px"), "Minimum height below `breakpoint.sm`."),
  component("input.background", ref("surface.base"), "Field fill."),
  component("input.backgroundFocus", ref("surface.canvas"), "Focused field fill."),
  component("input.text", ref("text.primary"), "Field value.", "body"),
  component(
    "input.placeholder",
    ref("text.faint"),
    "Placeholder. `text.faint` is allowed here and the dark field sits on `surface.base`, so the " +
      "combination FR-THM-005 AC-3 forbids never renders.",
  ),
  component("input.border", ref("border.control"), "Field edge. 3.23:1 on `surface.raised`."),
  component("input.borderHover", ref("border.control"), "Hovered field edge."),
  component("input.borderFocus", ref("accent.DEFAULT"), "Focused field edge."),
  component("input.borderInvalid", ref("status.danger"), "Invalid field edge."),
  component("input.radius", ref("radius.sm"), "Field radius."),
  component("input.paddingBlock", value("9px"), "Field vertical padding."),
  component("input.paddingInline", ref("space.3"), "Field horizontal padding."),
  component("input.focusRing", ref("focusRing"), "Focus indicator."),
  component("input.label.text", ref("text.secondary"), "Field label with stronger hierarchy.", "body"),
  component("input.label.fontSize", ref("font.size.base"), "Field label size."),
  component("input.error.text", ref("status.danger"), "Field error message.", "body"),
  component("input.transition", ref("motion.fast"), "Field transition."),
];

const overlay: TokenDefinition[] = [
  component("overlay.scrim", ref("surface.overlay"), "Backdrop behind Dialog and Drawer."),
  component("overlay.scrimBlur", value("4px"), "Backdrop blur radius."),
  component("overlay.scrimZ", ref("z.overlay"), "Backdrop stacking layer."),
  component("overlay.background", ref("surface.glass"), "Overlay panel fill."),
  component("overlay.backgroundBlur", value("16px"), "Overlay panel backdrop blur."),
  component("overlay.border", ref("border.strong"), "Overlay panel edge."),
  component("overlay.radius", ref("radius.lg"), "Overlay panel radius."),
  component("overlay.shadow", ref("elevation.overlay"), "Overlay panel shadow."),
  component("overlay.contentZ", ref("z.popover"), "Tooltip, menu and select content layer."),
  component("overlay.drawerZ", ref("z.drawer"), "Drawer panel layer."),
  component("overlay.drawerBackground", ref("surface.raised"), "Drawer panel fill."),
  component("overlay.drawerWidth", value("500px"), "Drawer panel width."),
  component("overlay.enter", ref("motion.standard"), "Overlay entrance."),
  component("overlay.exit", ref("motion.fast"), "Overlay exit."),
];

/**
 * `page.headingSize` evaluates the derivation in tokens spec 5.9.2 rather than restating a
 * literal: the scale stays seven steps (FR-TOK-007 AC-1) and the `clamp()` bounds come out of
 * `font.size.xl`. `clamp()` arguments cannot survive as custom properties — a consumer
 * redefining one without `calc()` would produce an invalid value — so the build inlines them.
 */
const HEADING_MIN_PX = FONT_SIZE_PX.xl * 1.2;
const HEADING_MAX_PX = FONT_SIZE_PX.xl * 1.6;

/**
 * `h2` and `h3` had no size of their own: below `page.headingSize` the scale stopped at
 * `font.size.xl` (20px), which is also `h1`'s floor, so a section heading and the body it
 * introduces were nearly the same size and the document read as one flat block.
 *
 * These are derived the same way `page.headingSize` is — multipliers on `font.size.xl` — so the
 * exposed type scale stays seven steps (FR-TOK-007 AC-1). Line heights use the 1.30 heading ratio
 * and `scales.ts`'s half-up rounding, so a heading's leading is computed by the same rule as every
 * other step rather than eyeballed.
 */
const H2_PX = Math.round(FONT_SIZE_PX.xl * 1.3);
const H3_PX = Math.round(FONT_SIZE_PX.xl * 1.1);
const HEADING_LINE_HEIGHT_RATIO = 1.3;

const page: TokenDefinition[] = [
  component(
    "page.headingSize",
    value(`clamp(${HEADING_MIN_PX}px, 3vw, ${HEADING_MAX_PX}px)`),
    "Responsive page heading size, derived from `font.size.xl` (× 1.2 and × 1.6).",
  ),
  component(
    "page.headingLineHeight",
    value("1.16"),
    "The only unitless line height: `clamp()` makes a px value impossible here.",
  ),
  component(
    "page.sectionHeadingSize",
    value(`${H2_PX}px`),
    "`h2`. `font.size.xl` × 1.3.",
  ),
  component(
    "page.sectionHeadingLineHeight",
    value(`${roundHalfUp(H2_PX * HEADING_LINE_HEIGHT_RATIO)}px`),
    "Line height paired with `page.sectionHeadingSize`, at the 1.30 heading ratio.",
  ),
  component(
    "page.subHeadingSize",
    value(`${H3_PX}px`),
    "`h3`. `font.size.xl` × 1.1.",
  ),
  component(
    "page.subHeadingLineHeight",
    value(`${roundHalfUp(H3_PX * HEADING_LINE_HEIGHT_RATIO)}px`),
    "Line height paired with `page.subHeadingSize`, at the 1.30 heading ratio.",
  ),
  component("page.stackGap", ref("space.6"), "Gap between page sections."),
  component("page.stackGapCompact", ref("space.5"), "Section gap below `breakpoint.sm`."),
  component("page.contentStackGap", ref("space.5"), "Gap inside a content stack."),
  component("page.splitBreakpoint", ref("breakpoint.md"), "Below this, a split layout stacks."),
  component("page.splitAsideWidth", value("minmax(280px, 340px)"), "Split layout aside track."),
  component("page.shellNavWidth", value("272px"), "App shell navigation width."),
  component("page.shellNavWidthCompact", value("232px"), "Navigation width below `breakpoint.lg`."),
  component("page.topbarZ", ref("z.sticky"), "Top bar stacking layer."),
  component("page.navZ", ref("z.drawer"), "Navigation stacking layer."),
  component("page.skipLinkZ", ref("z.popover"), "Skip link stacking layer."),
];

const shell: TokenDefinition[] = [
  component(
    "appShell.background",
    value("radial-gradient(circle at 82% -10%, {surface.tint.1}, transparent 34rem), radial-gradient(circle at 10% 85%, {surface.tint.2}, transparent 30rem), {surface.base}"),
    "Ambient app-shell surface derived from the source application background.",
  ),
  component("appShell.navWidth", ref("page.shellNavWidth"), "AppShell desktop navigation width."),
  component("appShell.mainMaxWidth", value("1480px"), "AppShell main content maximum width."),
  component("appShell.overlayBackground", ref("surface.overlay"), "Mobile navigation scrim."),
  component("skipLink.background", ref("accent.DEFAULT"), "Skip-link fill."),
  component("skipLink.text", ref("text.inverse"), "Skip-link label."),
  component(
    "navList.background",
    value("linear-gradient(180deg, {surface.glass}, {surface.canvas})"),
    "Glass navigation surface over the app-shell ambient background.",
  ),
  component("navList.border", ref("border.subtle"), "Navigation surface edge."),
  component("navItem.text", ref("text.muted"), "Navigation item label."),
  component("navItem.textActive", ref("text.primary"), "Active navigation item label."),
  component("navItem.backgroundHover", ref("state.hover"), "Navigation item hover wash."),
  component("navItem.backgroundActive", ref("state.selected"), "Active navigation item wash."),
  component("navItem.indicator", ref("accent.DEFAULT"), "Active navigation item indicator."),
  component("navSectionLabel.text", ref("text.faint"), "Navigation section label."),
  component("font.weight.sectionLabel", value(700), "Navigation section label weight."),
  component("topBar.background", ref("surface.glass"), "TopBar glass surface."),
  component("topBar.border", ref("border.subtle"), "TopBar lower edge."),
  component("topBar.eyebrowText", ref("text.faint"), "TopBar eyebrow label."),
  component("topBar.titleText", ref("text.secondary"), "TopBar context title."),
  component("topBar.minHeight", value("68px"), "TopBar minimum height."),
];

export const componentTokens: readonly TokenDefinition[] = [
  ...button,
  ...card,
  ...badge,
  ...table,
  ...timeline,
  ...codeBlock,
  ...kbd,
  ...banner,
  ...emptyState,
  ...feedbackMeter,
  ...progressRing,
  ...spinner,
  ...input,
  ...overlay,
  ...page,
  ...shell,
];
