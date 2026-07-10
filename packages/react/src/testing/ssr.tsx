import { type ReactElement } from "react";
import { renderToString } from "react-dom/server";

export interface SsrSubject {
  readonly name: string;
  readonly render: () => ReactElement;
}

/** Renders every registered public component without touching browser globals (FR-DX-004 AC-1). */
export function renderAllToString(subjects: readonly SsrSubject[]): void {
  for (const subject of subjects) renderToString(subject.render());
}
