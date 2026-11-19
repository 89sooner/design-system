// FR-CMP-019 · CR-080: FileUpload.
import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { acceptsFile, admitFiles, FileUpload } from "../file-upload";
import { Field } from "../form";

afterEach(cleanup);

const file = (name: string, size = 10, type = ""): File => {
  const made = new File(["x"], name, { type });
  Object.defineProperty(made, "size", { value: size });
  return made;
};

function pick(input: HTMLElement, files: readonly File[]): void {
  fireEvent.change(input, { target: { files } });
}

describe("FR-CMP-019 AC-1 FileUpload accept and admission rules", () => {
  test("accept reads extensions, exact types and wildcards as the picker does; empty accepts all", () => {
    expect(acceptsFile(file("report.PDF"), ".pdf")).toBe(true);
    expect(acceptsFile(file("shot.png", 1, "image/png"), "image/*")).toBe(true);
    expect(acceptsFile(file("shot.png", 1, "image/png"), "image/jpeg, .gif")).toBe(false);
    expect(acceptsFile(file("data.csv", 1, "text/csv"), "text/csv")).toBe(true);
    expect(acceptsFile(file("anything"), undefined)).toBe(true);
    expect(acceptsFile(file("anything"), " , ")).toBe(true);
  });

  test("type and size come before count; a single upload replaces; maxFiles caps the list", () => {
    const a = file("a.txt", 5);
    const big = file("big.txt", 500);
    const img = file("b.png", 5, "image/png");
    const single = admitFiles([a], [img, file("c.txt", 5)], { accept: ".txt" });
    expect(single.files.map((item) => item.name)).toEqual(["c.txt"]);
    expect(single.rejections.map((item) => [item.file.name, item.reason])).toEqual([["b.png", "type"]]);
    const capped = admitFiles([a], [file("d.txt"), file("e.txt"), big], { multiple: true, maxFiles: 2, maxSize: 100 });
    expect(capped.files.map((item) => item.name)).toEqual(["a.txt", "d.txt"]);
    expect(capped.rejections.map((item) => [item.file.name, item.reason])).toEqual([["big.txt", "size"], ["e.txt", "count"]]);
    expect(admitFiles([a], [big], { maxSize: 100 }).files).toEqual([a]);
  });
});

describe("FR-CMP-019 AC-2 FileUpload", () => {
  test("the root keeps ref, class and native props; the name goes on the native file input", () => {
    const ref = createRef<HTMLDivElement>();
    render(<FileUpload ref={ref} aria-label="Attachments" className="consumer-class" data-testid="upload" title="Native title" />);
    const root = screen.getByTestId("upload");
    expect(ref.current).toBe(root);
    expect(root.className).toBe("cdt-file-upload consumer-class");
    expect(root.getAttribute("title")).toBe("Native title");
    expect(root.hasAttribute("aria-label")).toBe(false);
    const input = screen.getByLabelText("Attachments");
    expect(input.getAttribute("type")).toBe("file");
    expect(input.closest(".cdt-file-upload__choose")?.textContent).toBe("Choose files");
  });

  test("Field names, describes, requires and invalidates the input", () => {
    render(<Field label="Evidence" description="PDF only" error="Add a file" required><FileUpload accept=".pdf" /></Field>);
    const input = screen.getByLabelText(/Evidence/);
    expect(input.getAttribute("accept")).toBe(".pdf");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.hasAttribute("required")).toBe(true);
    const described = (input.getAttribute("aria-describedby") ?? "").split(" ").map((id) => document.getElementById(id)?.textContent);
    expect(described).toEqual(["PDF only", "Add a file"]);
  });

  test("a pick lists the files with size and a remove button; removing returns focus to the input", () => {
    const onFilesChange = vi.fn();
    render(<FileUpload aria-label="Attachments" multiple onFilesChange={onFilesChange} />);
    const input = screen.getByLabelText("Attachments");
    pick(input, [file("notes.txt", 2048), file("log.txt", 12)]);
    expect(onFilesChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: "notes.txt" }), expect.objectContaining({ name: "log.txt" })]);
    const list = screen.getByRole("list", { name: "Chosen files" });
    expect([...list.querySelectorAll("li")].map((row) => row.textContent)).toEqual(["notes.txt2 KB×", "log.txt12 B×"]);
    fireEvent.click(screen.getByRole("button", { name: "Remove notes.txt" }));
    expect(onFilesChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: "log.txt" })]);
    expect(document.activeElement).toBe(input);
    expect((input as HTMLInputElement).value).toBe("");
  });

  test("left-out files are reported to the callback and in the status the input points to", () => {
    const onFilesReject = vi.fn();
    render(<FileUpload aria-label="Images" accept="image/*" maxSize={100} onFilesReject={onFilesReject} />);
    const input = screen.getByLabelText("Images");
    pick(input, [file("notes.txt", 5, "text/plain")]);
    expect(onFilesReject).toHaveBeenCalledWith([expect.objectContaining({ reason: "type" })]);
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("notes.txt was not added: this file type is not accepted.");
    expect(input.getAttribute("aria-describedby")).toBe(status.id);
    pick(input, [file("huge.png", 500, "image/png")]);
    expect(status.textContent).toBe("huge.png was not added: the file is too large.");
    pick(input, [file("ok.png", 50, "image/png")]);
    expect(status.textContent).toBe("");
    expect(input.hasAttribute("aria-describedby")).toBe(false);
  });

  test("files dropped on the zone are added; dragging marks the zone; disabled ignores drops and disables removal", () => {
    const onFilesChange = vi.fn();
    const { rerender, container } = render(<FileUpload aria-label="Attachments" multiple files={[file("kept.txt")]} onFilesChange={onFilesChange} />);
    const zone = container.querySelector<HTMLElement>(".cdt-file-upload__dropzone")!;
    const dataTransfer = { types: ["Files"], files: [file("dropped.txt")] };
    fireEvent.dragEnter(zone, { dataTransfer });
    expect(zone.getAttribute("data-state")).toBe("dragging");
    fireEvent.drop(zone, { dataTransfer });
    expect(zone.getAttribute("data-state")).toBe("idle");
    expect(onFilesChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: "kept.txt" }), expect.objectContaining({ name: "dropped.txt" })]);
    // Controlled: the list is what the owner passes.
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    onFilesChange.mockClear();
    rerender(<FileUpload aria-label="Attachments" multiple disabled files={[file("kept.txt")]} onFilesChange={onFilesChange} />);
    fireEvent.drop(zone, { dataTransfer });
    expect(onFilesChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Attachments").hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Remove kept.txt" }).hasAttribute("disabled")).toBe(true);
    expect(container.firstElementChild!.hasAttribute("data-disabled")).toBe(true);
  });

  test("labels replace every string", () => {
    render(<FileUpload aria-label="첨부" defaultFiles={[file("a.txt", 3)]} labels={{ choose: "파일 선택", drop: "또는 여기로 끌어 놓기", files: "고른 파일", remove: (name) => `${name} 빼기`, size: (bytes) => `${bytes}바이트` }} />);
    expect(screen.getByText("파일 선택")).toBeTruthy();
    expect(screen.getByText("또는 여기로 끌어 놓기")).toBeTruthy();
    expect(screen.getByRole("list", { name: "고른 파일" }).textContent).toContain("3바이트");
    expect(screen.getByRole("button", { name: "a.txt 빼기" })).toBeTruthy();
  });
});
