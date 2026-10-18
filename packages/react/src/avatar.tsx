"use client";
// FR-CMP-015 · CR-060: a person or team shown by picture, or by initials when there is no picture
// or it fails to load. Radix Avatar decides when the image has loaded (ADR-004).
import * as RadixAvatar from "@radix-ui/react-avatar";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cx } from "./cx";

/**
 * Up to two initials from a display name: the first letters of the first and last words, or the
 * first two characters of a single word. Characters outside the Basic Multilingual Plane count as
 * one letter. Blank input gives an empty string.
 */
export function avatarInitials(name: string): string {
  const words = name.trim().split(/\s+/u).filter((word) => word !== "");
  const letters = (word: string): string[] => Array.from(word);
  if (words.length === 0) return "";
  if (words.length === 1) return letters(words[0]!).slice(0, 2).join("").toLocaleUpperCase();
  return (letters(words[0]!)[0]! + letters(words[words.length - 1]!)[0]!).toLocaleUpperCase();
}

export interface AvatarProps extends Omit<ComponentPropsWithoutRef<typeof RadixAvatar.Root>, "children"> {
  /** The person's or team's name. It is the accessible name and the source of the initials. */
  readonly name: string;
  readonly src?: string;
  readonly size?: "sm" | "md" | "lg";
  /** Hide from assistive technology when the name is already printed next to the avatar. */
  readonly decorative?: boolean;
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar({ "aria-label": ariaLabel, className, decorative = false, name, size = "md", src, ...props }, ref) {
  return (
    <RadixAvatar.Root {...props} ref={ref} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : ariaLabel ?? name} aria-hidden={decorative || undefined} className={cx("cdt-avatar", `cdt-avatar--${size}`, className)}>
      {src === undefined ? null : <RadixAvatar.Image className="cdt-avatar__image" src={src} alt="" />}
      <RadixAvatar.Fallback className="cdt-avatar__fallback" aria-hidden="true">{avatarInitials(name)}</RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
});
Avatar.displayName = "Avatar";
