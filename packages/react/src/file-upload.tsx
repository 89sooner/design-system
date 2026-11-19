"use client";
// FR-CMP-019 · CR-080: pick files with the browser's own file input, or drop them on the zone around it.
// Radix has no file control, and none is needed: the native `<input type="file">` owns the role, the name,
// the keyboard and the system picker (ADR-004). It is laid transparently over the visible "Choose files"
// face, so a click or a key on that face is a click or a key on the input. This file adds the drop zone,
// the list of chosen files with their remove buttons, and the accept, size and count checks.
import { forwardRef, useContext, useId, useRef, useState, type DragEvent, type HTMLAttributes } from "react";
import { Button } from "./action";
import { cx } from "./cx";
import { FieldContext, useFieldControl, useMissingLabelWarning } from "./form";
import { DEFAULT_FILE_UPLOAD_LABELS, type FileRejectionReason, type FileUploadLabels } from "./labels";

export interface FileRejection {
  readonly file: File;
  readonly reason: FileRejectionReason;
}

export interface FileUploadProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "defaultValue" | "onChange"> {
  /** The chosen files (controlled). */
  readonly files?: readonly File[];
  readonly defaultFiles?: readonly File[];
  /** Called with the whole list after a pick, a drop or a removal. */
  readonly onFilesChange?: (files: readonly File[]) => void;
  /** Called with the files a pick or a drop left out, and why. */
  readonly onFilesReject?: (rejections: readonly FileRejection[]) => void;
  /** As the input's `accept`: extensions (`.pdf`), MIME types (`image/png`) and wildcards (`image/*`). */
  readonly accept?: string;
  /** More than one file. Without it a new pick replaces the file. */
  readonly multiple?: boolean;
  /** The largest file accepted, in bytes. */
  readonly maxSize?: number;
  /** The most files the list holds, with `multiple`. */
  readonly maxFiles?: number;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly labels?: Partial<FileUploadLabels>;
}

/** Whether `file` matches an `accept` list, as the browser's picker reads it. An empty list accepts everything. */
export function acceptsFile(file: Pick<File, "name" | "type">, accept: string | undefined): boolean {
  const patterns = (accept ?? "").split(",").map((pattern) => pattern.trim().toLowerCase()).filter((pattern) => pattern !== "");
  if (patterns.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return patterns.some((pattern) =>
    pattern.startsWith(".") ? name.endsWith(pattern) : pattern.endsWith("/*") ? type.startsWith(pattern.slice(0, -1)) : type === pattern,
  );
}

/** Splits `incoming` into what joins `current` and what is rejected; a single-file upload replaces. */
export function admitFiles(
  current: readonly File[],
  incoming: readonly File[],
  { accept, maxFiles, maxSize, multiple }: Pick<FileUploadProps, "accept" | "maxFiles" | "maxSize" | "multiple">,
): { readonly files: readonly File[]; readonly rejections: readonly FileRejection[] } {
  const rejections: FileRejection[] = [];
  const valid = incoming.filter((file) => {
    const reason: FileRejectionReason | undefined = !acceptsFile(file, accept) ? "type" : maxSize !== undefined && file.size > maxSize ? "size" : undefined;
    if (reason !== undefined) rejections.push({ file, reason });
    return reason === undefined;
  });
  if (!multiple) {
    valid.slice(1).forEach((file) => rejections.push({ file, reason: "count" }));
    return { files: valid.length > 0 ? valid.slice(0, 1) : current, rejections };
  }
  const room = maxFiles === undefined ? valid.length : Math.max(0, maxFiles - current.length);
  valid.slice(room).forEach((file) => rejections.push({ file, reason: "count" }));
  return { files: [...current, ...valid.slice(0, room)], rejections };
}

export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(function FileUpload(
  { "aria-describedby": ariaDescribedBy, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, accept, className, defaultFiles = [], disabled = false, files, id: ownId, invalid, labels, maxFiles, maxSize, multiple = false, onFilesChange, onFilesReject, ...props },
  ref,
) {
  const field = useContext(FieldContext);
  const control = useFieldControl(invalid, ariaDescribedBy);
  useMissingLabelWarning("FileUpload", field !== null, ariaLabel, ariaLabelledBy);
  const t = { ...DEFAULT_FILE_UPLOAD_LABELS, ...labels };
  const statusId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [uncontrolled, setUncontrolled] = useState<readonly File[]>(defaultFiles);
  const [rejected, setRejected] = useState<readonly FileRejection[]>([]);
  const [dragging, setDragging] = useState(false);
  const chosen = files ?? uncontrolled;

  const change = (next: readonly File[]): void => {
    if (files === undefined) setUncontrolled(next);
    onFilesChange?.(next);
  };
  const add = (incoming: readonly File[]): void => {
    if (disabled || incoming.length === 0) return;
    const result = admitFiles(chosen, incoming, { accept, maxFiles, maxSize, multiple });
    setRejected(result.rejections);
    if (result.rejections.length > 0) onFilesReject?.(result.rejections);
    if (result.files !== chosen) change(result.files);
  };
  const remove = (file: File): void => {
    change(chosen.filter((item) => item !== file));
    setRejected([]);
    input.current?.focus();
  };
  const onDrag = (event: DragEvent<HTMLDivElement>, over: boolean): void => {
    if (disabled || !event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    // Leaving for a child of the zone is not leaving the zone.
    if (!over && event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
    setDragging(over);
  };

  return (
    <div {...props} ref={ref} className={cx("cdt-file-upload", className)} data-disabled={disabled || undefined}>
      <div
        className="cdt-file-upload__dropzone"
        data-state={dragging ? "dragging" : "idle"}
        onDragEnter={(event) => onDrag(event, true)}
        onDragOver={(event) => onDrag(event, true)}
        onDragLeave={(event) => onDrag(event, false)}
        onDrop={(event) => {
          if (disabled) return;
          event.preventDefault();
          setDragging(false);
          add([...event.dataTransfer.files]);
        }}
      >
        <span className="cdt-file-upload__choose cdt-btn cdt-btn--secondary">
          <input
            ref={input}
            type="file"
            className="cdt-file-upload__input"
            id={ownId ?? (field === null ? undefined : control.id)}
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={[control.describedBy, rejected.length > 0 ? statusId : undefined].filter(Boolean).join(" ") || undefined}
            aria-invalid={control.invalid || undefined}
            required={control.required && chosen.length === 0}
            onChange={(event) => {
              add([...(event.currentTarget.files ?? [])]);
              // The list above is the value; clearing the input lets the same file be picked again.
              event.currentTarget.value = "";
            }}
          />
          <span aria-hidden="true">{t.choose}</span>
        </span>
        <span className="cdt-file-upload__hint">{t.drop}</span>
      </div>
      {chosen.length > 0 && (
        <ul className="cdt-file-upload__list" aria-label={t.files}>
          {chosen.map((file, index) => (
            <li key={`${file.name}-${file.size}-${file.lastModified}-${index}`} className="cdt-file-upload__file">
              <span className="cdt-file-upload__name">{file.name}</span>
              <span className="cdt-file-upload__size">{t.size(file.size)}</span>
              <Button size="sm" variant="ghost" aria-label={t.remove(file.name)} disabled={disabled} onClick={() => remove(file)}>×</Button>
            </li>
          ))}
        </ul>
      )}
      <p id={statusId} role="status" className="cdt-file-upload__status">{rejected.map((item) => t.rejected(item.file.name, item.reason)).join(" ")}</p>
    </div>
  );
});
FileUpload.displayName = "FileUpload";
