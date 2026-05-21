import { existsSync } from "node:fs";
import path from "node:path";

export function getRepoRoot(start = process.cwd()) {
  let current = start;

  for (let depth = 0; depth < 8; depth += 1) {
    if (
      existsSync(path.join(current, "content")) &&
      existsSync(path.join(current, "data")) &&
      existsSync(path.join(current, "apps"))
    ) {
      return current;
    }

    const parent = path.dirname(current);

    if (parent === current) {
      break;
    }

    current = parent;
  }

  return path.resolve(start, "../..");
}
