"use client";
// FR-CMP-017 · CR-076: a stack of disclosure sections. Radix Accordion owns expansion, `aria-expanded`,
// the heading and region wiring and arrow-key movement between triggers (ADR-004).
import * as RadixAccordion from "@radix-ui/react-accordion";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cx } from "./cx";

export type AccordionRootProps = ComponentPropsWithoutRef<typeof RadixAccordion.Root>;
const AccordionRoot = forwardRef<HTMLDivElement, AccordionRootProps>(function AccordionRoot({ className, ...props }, ref) {
  return <RadixAccordion.Root {...props} ref={ref} className={cx("cdt-accordion", className)} />;
});

export type AccordionItemProps = ComponentPropsWithoutRef<typeof RadixAccordion.Item>;
const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem({ className, ...props }, ref) {
  return <RadixAccordion.Item {...props} ref={ref} className={cx("cdt-accordion__item", className)} />;
});

export type AccordionTriggerProps = ComponentPropsWithoutRef<typeof RadixAccordion.Trigger> & {
  /** The heading level that wraps the trigger. Defaults to 3; match the outline of the page around it. */
  readonly level?: 2 | 3 | 4 | 5 | 6;
};
/** The trigger sits inside a heading, as the WAI-ARIA accordion pattern asks. */
const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(function AccordionTrigger({ children, className, level = 3, ...props }, ref) {
  const Heading = `h${level}` as const;
  return (
    <RadixAccordion.Header asChild>
      <Heading className="cdt-accordion__header">
        <RadixAccordion.Trigger {...props} ref={ref} className={cx("cdt-accordion__trigger", className)}>
          <span className="cdt-accordion__label">{children}</span>
          <span className="cdt-accordion__chevron" aria-hidden="true">▾</span>
        </RadixAccordion.Trigger>
      </Heading>
    </RadixAccordion.Header>
  );
});

export type AccordionContentProps = ComponentPropsWithoutRef<typeof RadixAccordion.Content>;
const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(function AccordionContent({ className, ...props }, ref) {
  return <RadixAccordion.Content {...props} ref={ref} className={cx("cdt-accordion__content", className)} />;
});

export const Accordion = { Root: AccordionRoot, Item: AccordionItem, Trigger: AccordionTrigger, Content: AccordionContent } as const;
