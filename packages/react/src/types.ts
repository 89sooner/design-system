import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

/** Own props take precedence when they overlap native element props (FR-CMP-001 AC-4). */
export type PolymorphicProps<E extends ElementType, Own> = Own &
  Omit<ComponentPropsWithoutRef<E>, keyof Own>;

export type Tone = "neutral" | "accent" | "info" | "success" | "warning" | "danger";
export type Size = "sm" | "md";

/** Icons are injected by consumers; Conductor does not bundle an icon set. */
export type IconSlot = ReactNode;
