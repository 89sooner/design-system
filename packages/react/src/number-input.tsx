"use client";
// FR-CMP-015 · CR-060: a number with its unit and stepper buttons. The field is a native
// `<input type="number">`, so the `spinbutton` role, arrow-key stepping, min/max/step validation and
// form submission are the browser's (ADR-004). The two buttons call the input's own
// `stepUp`/`stepDown` and dispatch `input`, so `onChange` fires exactly as it does for typing.
// They sit outside the tab order: the keyboard path is the arrow keys on the field itself.
import { forwardRef, useCallback, useContext, useRef, type ComponentPropsWithoutRef, type ReactNode, type Ref } from "react";
import { cx } from "./cx";
import { FieldContext, useFieldControl, useMissingLabelWarning } from "./form";
import { DEFAULT_NUMBER_INPUT_LABELS, type NumberInputLabels } from "./labels";

/**
 * `className` styles the wrapper (width, layout); every other native prop, `ref` included, reaches
 * the `<input>`, as with `TextField`.
 */
export interface NumberInputProps extends Omit<ComponentPropsWithoutRef<"input">, "size" | "type"> {
  readonly size?: "sm" | "md";
  readonly invalid?: boolean;
  /** Text after the number inside the field, such as a unit (`ms`, `%`, `USD`). */
  readonly suffix?: ReactNode;
  readonly labels?: Partial<NumberInputLabels>;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === "function") ref(value);
  else if (ref !== null && ref !== undefined) (ref as { current: T | null }).current = value;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, className, disabled, id: ownId, invalid, labels, readOnly, required, size = "md", suffix, ...props },
  ref,
) {
  const t = { ...DEFAULT_NUMBER_INPUT_LABELS, ...labels };
  const field = useContext(FieldContext);
  const control = useFieldControl(invalid, ariaDescribedBy);
  useMissingLabelWarning("NumberInput", field !== null, ariaLabel, ariaLabelledBy);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setRef = useCallback((node: HTMLInputElement | null) => { inputRef.current = node; assignRef(ref, node); }, [ref]);
  const id = ownId ?? (field === null ? undefined : control.id);
  const step = (direction: 1 | -1): void => {
    const input = inputRef.current;
    if (input === null) return;
    // stepUp/stepDown throw on a value that is not a number; start from the bound instead.
    if (input.value === "" || Number.isNaN(input.valueAsNumber)) input.value = input.min !== "" && direction === 1 ? input.min : input.max !== "" && direction === -1 ? input.max : "0";
    else if (direction === 1) input.stepUp();
    else input.stepDown();
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  };
  const locked = disabled === true || readOnly === true;
  return (
    <span className={cx("cdt-number-input", size === "sm" && "cdt-number-input--sm", control.invalid && "cdt-number-input--invalid", className)}>
      <input {...props} ref={setRef} type="number" inputMode="decimal" id={id} disabled={disabled} readOnly={readOnly} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} aria-describedby={control.describedBy} aria-invalid={ariaInvalid ?? (control.invalid || undefined)} required={required ?? control.required} className="cdt-number-input__field" />
      {suffix === undefined ? null : <span className="cdt-number-input__suffix" aria-hidden="true">{suffix}</span>}
      <span className="cdt-number-input__steppers">
        <button type="button" tabIndex={-1} className="cdt-number-input__step" aria-label={t.increment} aria-controls={id} disabled={locked} onClick={() => step(1)}><span aria-hidden="true">▴</span></button>
        <button type="button" tabIndex={-1} className="cdt-number-input__step" aria-label={t.decrement} aria-controls={id} disabled={locked} onClick={() => step(-1)}><span aria-hidden="true">▾</span></button>
      </span>
    </span>
  );
});
NumberInput.displayName = "NumberInput";
