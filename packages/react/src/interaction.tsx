"use client";

// FR-CMP-013 · WP-029: Radix owns focus, keyboard navigation and disclosure state.
import * as RadixTabs from "@radix-ui/react-tabs";
import * as RadixPopover from "@radix-ui/react-popover";
import * as RadixCollapsible from "@radix-ui/react-collapsible";
import { createContext, useContext, useState, forwardRef, type ComponentPropsWithoutRef } from "react";
import { cx } from "./cx";

const TabValue = createContext<string | undefined>(undefined);
export type TabsRootProps = ComponentPropsWithoutRef<typeof RadixTabs.Root>;
const TabsRoot = forwardRef<HTMLDivElement, TabsRootProps>(function TabsRoot(
  { className, activationMode = "manual", value, defaultValue, onValueChange, ...props }, ref,
) {
  const [localValue, setLocalValue] = useState(defaultValue);
  const selected = value ?? localValue;
  return <TabValue.Provider value={selected}><RadixTabs.Root {...props} ref={ref} className={cx("cdt-tabs", className)} activationMode={activationMode} value={selected} onValueChange={(next) => { setLocalValue(next); onValueChange?.(next); }} /></TabValue.Provider>;
});
const TabsList = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixTabs.List>>(function TabsList({ className, ...props }, ref) {
  return <RadixTabs.List {...props} ref={ref} className={cx("cdt-tabs__list", className)} />;
});
const TabsTrigger = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof RadixTabs.Trigger>>(function TabsTrigger({ className, ...props }, ref) {
  return <RadixTabs.Trigger {...props} ref={ref} className={cx("cdt-tabs__trigger", className)} />;
});
/** Inactive children unmount by default. forceMount preserves their state, but keeps them hidden. */
export type TabsContentProps = ComponentPropsWithoutRef<typeof RadixTabs.Content>;
const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent({ className, value, ...props }, ref) {
  const selected = useContext(TabValue);
  return <RadixTabs.Content {...props} value={value} ref={ref} hidden={selected !== value} className={cx("cdt-tabs__content", className)} />;
});
export const Tabs = { Root: TabsRoot, List: TabsList, Trigger: TabsTrigger, Content: TabsContent } as const;

export type PopoverContentProps = ComponentPropsWithoutRef<typeof RadixPopover.Content> & {
  /** Keep a locally scoped theme by portalling into its container. Defaults to document.body. */
  readonly container?: ComponentPropsWithoutRef<typeof RadixPopover.Portal>["container"];
};
const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent({ className, container, ...props }, ref) {
  return <RadixPopover.Portal container={container}><RadixPopover.Content {...props} ref={ref} className={cx("cdt-popover", className)} /></RadixPopover.Portal>;
});
export const Popover = { Root: RadixPopover.Root, Trigger: RadixPopover.Trigger, Anchor: RadixPopover.Anchor, Content: PopoverContent, Close: RadixPopover.Close, Arrow: RadixPopover.Arrow } as const;

const CollapsibleRoot = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixCollapsible.Root>>(function CollapsibleRoot({ className, ...props }, ref) {
  return <RadixCollapsible.Root {...props} ref={ref} className={cx("cdt-collapsible", className)} />;
});
const CollapsibleTrigger = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof RadixCollapsible.Trigger>>(function CollapsibleTrigger({ className, ...props }, ref) {
  return <RadixCollapsible.Trigger {...props} ref={ref} className={cx("cdt-collapsible__trigger", className)} />;
});
const CollapsibleContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixCollapsible.Content>>(function CollapsibleContent({ className, ...props }, ref) {
  return <RadixCollapsible.Content {...props} ref={ref} className={cx("cdt-collapsible__content", className)} />;
});
export const Collapsible = { Root: CollapsibleRoot, Trigger: CollapsibleTrigger, Content: CollapsibleContent } as const;
