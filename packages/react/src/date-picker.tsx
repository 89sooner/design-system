"use client";
// FR-CMP-014 · CR-054: a single-date picker. The calendar grid, its roles and its arrow-key
// navigation belong to react-day-picker; the popover's focus handling and dismissal belong to Radix
// (ADR-004). This file wires the two to Field and gives every part a `cdt-` class: the library's
// own stylesheet is never imported, so the look comes only from @conductor-by-89soone/css.
import * as RadixPopover from "@radix-ui/react-popover";
import { DayFlag, DayPicker, SelectionState, UI, type DayPickerProps, type Matcher } from "react-day-picker";
import { forwardRef, useContext, useState, type ButtonHTMLAttributes } from "react";
import { cx } from "./cx";
import { useDirection } from "./direction";
import { FieldContext, useFieldControl } from "./form";
import { DEFAULT_DATE_PICKER_LABELS, type DatePickerLabels } from "./labels";

/**
 * Every structural part, day state and selection state, mapped to `cdt-date-picker__<part>`. Built through
 * `cx` so the stylesheet contract test (FR-CSS-004) reads the `cdt-date-picker__` prefix as emitted.
 */
const CLASS_NAMES = Object.fromEntries([...Object.values(UI), ...Object.values(DayFlag), ...Object.values(SelectionState)].map((key) => [key, cx(`cdt-date-picker__${key.replaceAll("_", "-")}`)]));

const defaultFormat = (date: Date): string => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);

export interface DatePickerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "defaultValue" | "onChange" | "children"> {
  readonly value: Date | undefined;
  readonly onValueChange: (date: Date | undefined) => void;
  /** Days that cannot be picked, in react-day-picker's matcher form (`{ before: today }`, a date, a function). */
  readonly disabledDays?: Matcher | Matcher[];
  readonly startMonth?: Date;
  readonly endMonth?: Date;
  /** A react-day-picker locale (`react-day-picker/locale`). Defaults to English. */
  readonly locale?: DayPickerProps["locale"];
  /** How the trigger shows the chosen date. Defaults to `Intl.DateTimeFormat` medium style. */
  readonly formatDate?: (date: Date) => string;
  readonly invalid?: boolean;
  readonly size?: "sm" | "md";
  /** Opens the calendar on mount, like Radix `defaultOpen`. */
  readonly defaultOpen?: boolean;
  readonly labels?: Partial<DatePickerLabels>;
}

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker(
  { value, onValueChange, disabledDays, startMonth, endMonth, locale, formatDate = defaultFormat, invalid, size = "md", defaultOpen = false, labels, className, id: ownId, "aria-describedby": ariaDescribedBy, ...props },
  ref,
) {
  const t = { ...DEFAULT_DATE_PICKER_LABELS, ...labels };
  const field = useContext(FieldContext);
  const control = useFieldControl(invalid, ariaDescribedBy);
  const [open, setOpen] = useState(defaultOpen);
  // The calendar's arrow keys and month buttons follow the reading direction (FR-CSS-006, CR-074).
  const direction = useDirection();
  return <RadixPopover.Root open={open} onOpenChange={setOpen}>
    <RadixPopover.Trigger asChild>
      <button
        type="button"
        {...props}
        ref={ref}
        id={ownId ?? (field === null ? undefined : control.id)}
        aria-describedby={control.describedBy}
        aria-invalid={control.invalid || undefined}
        aria-required={control.required || undefined}
        className={cx("cdt-input", "cdt-date-picker", size === "sm" && "cdt-input--sm", control.invalid && "cdt-input--invalid", value === undefined && "cdt-date-picker--empty", className)}
      >
        {value === undefined ? t.placeholder : formatDate(value)}
      </button>
    </RadixPopover.Trigger>
    <RadixPopover.Portal>
      <RadixPopover.Content className="cdt-popover cdt-date-picker__popover" align="start" aria-label={t.dialog}>
        <DayPicker
          mode="single"
          selected={value}
          onSelect={(date) => { onValueChange(date); setOpen(false); }}
          disabled={disabledDays}
          startMonth={startMonth}
          endMonth={endMonth}
          locale={locale}
          dir={direction}
          defaultMonth={value}
          autoFocus
          classNames={CLASS_NAMES}
        />
      </RadixPopover.Content>
    </RadixPopover.Portal>
  </RadixPopover.Root>;
});
DatePicker.displayName = "DatePicker";
