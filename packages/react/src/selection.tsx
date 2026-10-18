"use client";
// FR-CMP-015 · CR-060: choosing one option from a short visible set (RadioGroup) and switching a
// view or mode with pressed buttons (ToggleGroup). Radix owns the roles, roving focus, arrow keys
// and the hidden form inputs (ADR-004).
import * as RadixRadioGroup from "@radix-ui/react-radio-group";
import * as RadixToggleGroup from "@radix-ui/react-toggle-group";
import { forwardRef, useContext, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cx } from "./cx";
import { FieldContext, useFieldControl, useMissingLabelWarning } from "./form";
import type { Size } from "./types";

export type RadioGroupRootProps = ComponentPropsWithoutRef<typeof RadixRadioGroup.Root> & {
  readonly invalid?: boolean;
  /** `horizontal` lays the options out in a row; arrow keys follow `orientation` either way. */
  readonly orientation?: "vertical" | "horizontal";
};

/**
 * Inside `Field`, the group is named by the field label (`aria-labelledby`), described by its
 * description and error, and takes `required` and the invalid state from the field.
 */
const RadioGroupRoot = forwardRef<HTMLDivElement, RadioGroupRootProps>(function RadioGroupRoot(
  { "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, className, id: ownId, invalid, orientation = "vertical", required, ...props },
  ref,
) {
  const field = useContext(FieldContext);
  const control = useFieldControl(invalid, ariaDescribedBy);
  useMissingLabelWarning("RadioGroup", field !== null, ariaLabel, ariaLabelledBy);
  const id = ownId ?? (field === null ? undefined : control.id);
  return <RadixRadioGroup.Root {...props} ref={ref} id={id} orientation={orientation} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy ?? (field === null || ariaLabel !== undefined ? undefined : `${control.id}-label`)} aria-describedby={control.describedBy} aria-invalid={ariaInvalid ?? (control.invalid || undefined)} required={required ?? control.required} className={cx("cdt-radio-group", orientation === "horizontal" && "cdt-radio-group--horizontal", control.invalid && "cdt-radio-group--invalid", className)} />;
});
RadioGroupRoot.displayName = "RadioGroup.Root";

export type RadioGroupItemProps = ComponentPropsWithoutRef<typeof RadixRadioGroup.Item> & {
  /** The visible option text. It labels the radio, so the whole row is clickable. */
  readonly children: ReactNode;
  readonly description?: ReactNode;
};

const RadioGroupItem = forwardRef<HTMLButtonElement, RadioGroupItemProps>(function RadioGroupItem({ children, className, description, ...props }, ref) {
  return (
    <label className={cx("cdt-radio", props.disabled === true && "cdt-radio--disabled", className)}>
      <RadixRadioGroup.Item {...props} ref={ref} className="cdt-radio__control">
        <RadixRadioGroup.Indicator className="cdt-radio__indicator" />
      </RadixRadioGroup.Item>
      <span className="cdt-radio__text">
        <span>{children}</span>
        {description === undefined ? null : <span className="cdt-radio__description">{description}</span>}
      </span>
    </label>
  );
});
RadioGroupItem.displayName = "RadioGroup.Item";

export const RadioGroup = { Root: RadioGroupRoot, Item: RadioGroupItem } as const;

export type ToggleGroupProps = ComponentPropsWithoutRef<typeof RadixToggleGroup.Root> & { readonly size?: Size };

/**
 * A segmented control. `type="single"` keeps at most one item pressed (a view switch);
 * `type="multiple"` lets any number stay pressed (formatting-style toggles).
 */
const ToggleGroupRoot = forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroupRoot({ "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, className, size = "md", ...props }, ref) {
  useMissingLabelWarning("ToggleGroup", false, ariaLabel, ariaLabelledBy);
  return <RadixToggleGroup.Root {...props} ref={ref} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} className={cx("cdt-toggle-group", size === "sm" && "cdt-toggle-group--sm", className)} />;
});
ToggleGroupRoot.displayName = "ToggleGroup.Root";

export type ToggleGroupItemProps = ComponentPropsWithoutRef<typeof RadixToggleGroup.Item> & { readonly icon?: ReactNode };

const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(function ToggleGroupItem({ children, className, icon, ...props }, ref) {
  return <RadixToggleGroup.Item {...props} ref={ref} className={cx("cdt-toggle-group__item", className)}>{icon === undefined ? null : <span className="cdt-toggle-group__icon" aria-hidden="true">{icon}</span>}{children}</RadixToggleGroup.Item>;
});
ToggleGroupItem.displayName = "ToggleGroup.Item";

export const ToggleGroup = { Root: ToggleGroupRoot, Item: ToggleGroupItem } as const;
