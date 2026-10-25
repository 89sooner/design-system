"use client";
// FR-CMP-018 · CR-078: a value, or a range of two, picked on a track. Radix Slider owns the `slider` role on
// each thumb, `aria-valuenow`/`min`/`max`, the arrow, Page and Home/End keys and pointer dragging (ADR-004).
// The name goes on the thumbs, which are what assistive technology reads; the root has no role to name.
import * as RadixSlider from "@radix-ui/react-slider";
import { forwardRef, useId, useState, type ComponentPropsWithoutRef } from "react";
import { cx } from "./cx";
import { useMissingLabelWarning } from "./form";
import { DEFAULT_SLIDER_LABELS, type SliderLabels } from "./labels";

export interface SliderProps extends ComponentPropsWithoutRef<typeof RadixSlider.Root> {
  /** Speaks a value in words, such as a unit or a range of text, instead of the bare number. */
  readonly valueText?: (value: number) => string;
  readonly labels?: Partial<SliderLabels>;
}

export const Slider = forwardRef<HTMLSpanElement, SliderProps>(function Slider({ "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, className, defaultValue, labels, onValueChange, value, valueText, ...props }, ref) {
  useMissingLabelWarning("Slider", false, ariaLabel, ariaLabelledBy);
  const t = { ...DEFAULT_SLIDER_LABELS, ...labels };
  const id = useId();
  // Mirrors the uncontrolled value so `valueText` follows the thumbs; Radix keeps the value itself.
  const [uncontrolled, setUncontrolled] = useState(() => defaultValue ?? [props.min ?? 0]);
  const values = value ?? uncontrolled;
  const thumbs = values.length;
  const range = thumbs > 1;
  const part = (index: number): string => (index === 0 ? t.start : t.end);
  return (
    <RadixSlider.Root
      {...props}
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => {
        if (value === undefined) setUncontrolled(next);
        onValueChange?.(next);
      }}
      className={cx("cdt-slider", className)}
    >
      <RadixSlider.Track className="cdt-slider__track">
        <RadixSlider.Range className="cdt-slider__range" />
      </RadixSlider.Track>
      {Array.from({ length: thumbs }, (_, index) => {
        const current = values[index];
        return (
          <RadixSlider.Thumb
            key={index}
            className="cdt-slider__thumb"
            aria-label={ariaLabel === undefined ? undefined : range ? `${ariaLabel}, ${part(index)}` : ariaLabel}
            aria-labelledby={ariaLabelledBy === undefined ? undefined : range ? `${ariaLabelledBy} ${id}-${index}` : ariaLabelledBy}
            aria-valuetext={valueText === undefined || current === undefined ? undefined : valueText(current)}
          />
        );
      })}
      {ariaLabelledBy !== undefined && range ? Array.from({ length: thumbs }, (_, index) => <span key={index} id={`${id}-${index}`} hidden>{part(index)}</span>) : null}
    </RadixSlider.Root>
  );
});
Slider.displayName = "Slider";
