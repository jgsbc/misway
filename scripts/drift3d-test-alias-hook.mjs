import path from "node:path";
import { pathToFileURL } from "node:url";

const SRC_BASE = pathToFileURL(path.resolve(process.cwd(), "src") + "/").href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const rewritten = `${SRC_BASE}${specifier.slice(2)}.ts`;
    return nextResolve(rewritten, context);
  }

  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    path.extname(specifier) === ""
  ) {
    try {
      return await nextResolve(`${specifier}.ts`, context);
    } catch {
      // Fall through to Node's default resolver for non-TypeScript targets.
    }
  }

  return nextResolve(specifier, context);
}
