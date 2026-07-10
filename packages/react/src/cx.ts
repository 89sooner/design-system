/** Joins optional class names without introducing a runtime dependency. */
export function cx(...classNames: readonly (string | false | null | undefined)[]): string {
  return classNames.filter((className): className is string => typeof className === "string" && className !== "").join(" ");
}
