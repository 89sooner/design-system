// FR 범위: FR-CMP-007, FR-A11Y-003, FR-A11Y-005
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import * as RadixSelect from "@radix-ui/react-select";
import * as RadixSwitch from "@radix-ui/react-switch";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "./cx";

interface FieldContextValue {
  readonly id: string;
  readonly descriptionId?: string;
  readonly errorId?: string;
  readonly invalid: boolean;
  readonly required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

function joinDescribedBy(...ids: Array<string | undefined>): string | undefined {
  const result = ids.filter((id): id is string => id !== undefined).join(" ");
  return result === "" ? undefined : result;
}

function useFieldControl(invalid: boolean | undefined, describedBy: string | undefined): FieldContextValue & { readonly describedBy?: string } {
  const field = useContext(FieldContext);
  return {
    id: field?.id ?? "",
    descriptionId: field?.descriptionId,
    errorId: field?.errorId,
    invalid: invalid ?? field?.invalid ?? false,
    required: field?.required ?? false,
    describedBy: joinDescribedBy(describedBy, field?.descriptionId, field?.errorId),
  };
}

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  readonly id?: string;
  readonly label: string;
  readonly description?: ReactNode;
  readonly error?: ReactNode;
  readonly required?: boolean;
  readonly children: ReactElement;
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field({ children, className, description, error, id: providedId, label, required = false, ...props }, ref) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const descriptionId = description === undefined ? undefined : `${id}-description`;
  const errorId = error === undefined ? undefined : `${id}-error`;
  const invalid = error !== undefined;

  return (
    <FieldContext.Provider value={{ id, descriptionId, errorId, invalid, required }}>
      <div {...props} ref={ref} className={cx("cdt-field", className)}>
        <label className="cdt-field__label" htmlFor={id}>{label}{required ? <span className="cdt-field__required" aria-hidden="true">*</span> : null}</label>
        {description === undefined ? null : <div id={descriptionId} className="cdt-field__description">{description}</div>}
        {/*
          `required` is not injected into the child. Every Conductor control reads it from
          `FieldContext`, and cloning forced the prop onto whatever element happened to be the
          direct child — a wrapper, a Radix root, an element with no notion of `required` at all.
        */}
        {children}
        {error === undefined ? null : <div id={errorId} className="cdt-field__error">{error}</div>}
      </div>
    </FieldContext.Provider>
  );
});
Field.displayName = "Field";

function useMissingLabelWarning(name: string, hasField: boolean, ariaLabel: string | undefined, ariaLabelledBy: string | undefined): void {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !hasField && ariaLabel === undefined && ariaLabelledBy === undefined) {
      console.warn(`[conductor] ${name} requires Field, aria-label, or aria-labelledby.`);
    }
  }, [ariaLabel, ariaLabelledBy, hasField, name]);
}

export interface TextFieldProps extends Omit<ComponentPropsWithoutRef<"input">, "size"> {
  readonly variant?: "solid" | "glass";
  readonly size?: "sm" | "md";
  readonly invalid?: boolean;
  readonly iconStart?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, className, iconStart, id: ownId, invalid, required, size = "md", variant = "solid", ...props },
  ref,
) {
  const field = useContext(FieldContext);
  const control = useFieldControl(invalid, ariaDescribedBy);
  useMissingLabelWarning("TextField", field !== null, ariaLabel, ariaLabelledBy);
  const input = <input {...props} ref={ref} id={ownId ?? (field === null ? undefined : control.id)} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} aria-describedby={control.describedBy} aria-invalid={ariaInvalid ?? (control.invalid || undefined)} required={required ?? control.required} className={cx("cdt-input", variant === "glass" && "cdt-input--glass", size === "sm" && "cdt-input--sm", control.invalid && "cdt-input--invalid", iconStart !== undefined && "cdt-input--icon-start", className)} />;
  return iconStart === undefined ? input : <span className="cdt-input-wrap"><span className="cdt-input__icon" aria-hidden="true">{iconStart}</span>{input}</span>;
});
TextField.displayName = "TextField";

export interface TextAreaProps extends ComponentPropsWithoutRef<"textarea"> {
  readonly variant?: "solid" | "glass";
  readonly invalid?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, className, id: ownId, invalid, required, rows = 3, variant = "solid", ...props },
  ref,
) {
  const field = useContext(FieldContext);
  const control = useFieldControl(invalid, ariaDescribedBy);
  useMissingLabelWarning("TextArea", field !== null, ariaLabel, ariaLabelledBy);
  return <textarea {...props} ref={ref} id={ownId ?? (field === null ? undefined : control.id)} rows={rows} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} aria-describedby={control.describedBy} aria-invalid={ariaInvalid ?? (control.invalid || undefined)} required={required ?? control.required} className={cx("cdt-textarea", variant === "glass" && "cdt-textarea--glass", control.invalid && "cdt-textarea--invalid", className)} />;
});
TextArea.displayName = "TextArea";

export type SelectTriggerProps = ComponentPropsWithoutRef<typeof RadixSelect.Trigger> & { readonly size?: "sm" | "md"; readonly invalid?: boolean };
const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(function SelectTrigger(
  { "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, "aria-required": ariaRequired, className, id: ownId, invalid, size = "md", ...props },
  ref,
) {
  const field = useContext(FieldContext);
  const control = useFieldControl(invalid, ariaDescribedBy);
  // Unlike the other controls, `Select.Trigger` has no `required` prop of its own — Radix reads it
  // from `Select.Root`. The attribute is therefore omitted rather than passed as `undefined`, so a
  // consumer who sets `required` on the root keeps it when no Field is present.
  const requiredAttribute = ariaRequired ?? (control.required ? true : undefined);
  return <RadixSelect.Trigger {...props} ref={ref} id={ownId ?? (field === null ? undefined : control.id)} aria-describedby={control.describedBy} aria-invalid={ariaInvalid ?? (control.invalid || undefined)} {...(requiredAttribute === undefined ? {} : { "aria-required": requiredAttribute })} className={cx("cdt-select__trigger", size === "sm" && "cdt-select__trigger--sm", control.invalid && "cdt-select__trigger--invalid", className)} />;
});
SelectTrigger.displayName = "Select.Trigger";

const SelectContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixSelect.Content>>(function SelectContent({ children, className, ...props }, ref) {
  return <RadixSelect.Portal><RadixSelect.Content {...props} ref={ref} className={cx("cdt-select__content", className)}><RadixSelect.Viewport>{children}</RadixSelect.Viewport></RadixSelect.Content></RadixSelect.Portal>;
});
SelectContent.displayName = "Select.Content";

/** `indicator` matches `Checkbox`: the check glyph is a text character unless a consumer swaps it. */
export type SelectItemProps = ComponentPropsWithoutRef<typeof RadixSelect.Item> & { readonly indicator?: ReactNode };
const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(function SelectItem({ children, className, indicator = "✓", ...props }, ref) {
  return <RadixSelect.Item {...props} ref={ref} className={cx("cdt-select__item", className)}><RadixSelect.ItemText>{children}</RadixSelect.ItemText><RadixSelect.ItemIndicator className="cdt-select__indicator" aria-hidden="true">{indicator}</RadixSelect.ItemIndicator></RadixSelect.Item>;
});
SelectItem.displayName = "Select.Item";

export const Select = { Root: RadixSelect.Root, Trigger: SelectTrigger, Value: RadixSelect.Value, Content: SelectContent, Item: SelectItem, Group: RadixSelect.Group, Label: RadixSelect.Label } as const;

export type SwitchProps = ComponentPropsWithoutRef<typeof RadixSwitch.Root>;
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch({ className, ...props }, ref) {
  const field = useContext(FieldContext);
  const control = useFieldControl(undefined, props["aria-describedby"]);
  return <RadixSwitch.Root {...props} ref={ref} id={props.id ?? (field === null ? undefined : control.id)} aria-describedby={control.describedBy} aria-invalid={control.invalid || undefined} required={props.required ?? control.required} className={cx("cdt-switch", control.invalid && "cdt-switch--invalid", className)}><RadixSwitch.Thumb className="cdt-switch__thumb" /></RadixSwitch.Root>;
});
Switch.displayName = "Switch";

export type CheckboxProps = ComponentPropsWithoutRef<typeof RadixCheckbox.Root> & { readonly indicator?: ReactNode };
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox({ className, indicator = "✓", ...props }, ref) {
  const field = useContext(FieldContext);
  const control = useFieldControl(undefined, props["aria-describedby"]);
  return <RadixCheckbox.Root {...props} ref={ref} id={props.id ?? (field === null ? undefined : control.id)} aria-describedby={control.describedBy} aria-invalid={control.invalid || undefined} required={props.required ?? control.required} className={cx("cdt-checkbox", control.invalid && "cdt-checkbox--invalid", className)}><RadixCheckbox.Indicator className="cdt-checkbox__indicator" aria-hidden="true">{indicator}</RadixCheckbox.Indicator></RadixCheckbox.Root>;
});
Checkbox.displayName = "Checkbox";
