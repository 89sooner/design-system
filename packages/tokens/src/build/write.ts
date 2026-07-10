/**
 * Atomic artifact writing.
 *
 * FR-TOK-003 exception handling: a failed resolution must leave no partial artifact, and the
 * previous output must survive intact. Two properties give us that:
 *
 *   1. Every artifact's bytes are produced before the first write happens, so a resolution,
 *      tier or naming failure throws while the output directory is still untouched.
 *   2. Each file lands through a temporary sibling and a rename, which is atomic within a
 *      filesystem. A reader never observes a half-written artifact.
 *
 * Refs: WP-003 FR-TOK-003
 */
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** File name relative to the output directory → complete file contents. */
export type Artifacts = ReadonlyMap<string, string>;

function isUnchanged(path: string, contents: string): boolean {
  return existsSync(path) && readFileSync(path, "utf8") === contents;
}

/** @returns the artifact names actually written; unchanged files are left alone. */
export function writeArtifacts(outDir: string, artifacts: Artifacts): string[] {
  mkdirSync(outDir, { recursive: true });

  const staged: { temporary: string; final: string; name: string }[] = [];
  try {
    for (const [name, contents] of artifacts) {
      const final = join(outDir, name);
      if (isUnchanged(final, contents)) continue;
      const temporary = `${final}.${process.pid}.tmp`;
      writeFileSync(temporary, contents, "utf8");
      staged.push({ temporary, final, name });
    }
  } catch (error) {
    for (const { temporary } of staged) rmSync(temporary, { force: true });
    throw error;
  }

  for (const { temporary, final } of staged) renameSync(temporary, final);
  return staged.map(({ name }) => name);
}
