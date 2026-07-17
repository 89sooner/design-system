import { scheduleStylesheetWarning } from "./stylesheet-warning";

/** Joins optional class names without introducing a runtime dependency. */
export function cx(...classNames: readonly (string | false | null | undefined)[]): string {
  if (classNames.some((className) => typeof className === "string" && /(?:^|\s)cdt-/.test(className))) {
    scheduleStylesheetWarning();
  }
  return classNames.filter((className): className is string => typeof className === "string" && className !== "").join(" ");
}
