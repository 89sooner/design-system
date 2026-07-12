import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const artifact = JSON.parse(readFileSync(fileURLToPath(new URL("../../../packages/tokens/dist/tokens.json", import.meta.url)), "utf8"));
for (const token of artifact.tokens) {
  if (typeof token.description !== "string" || token.description.trim() === "") {
    console.warn(`[docs] token ${token.key} has no description; Foundations will show 설명 없음.`);
  }
}
