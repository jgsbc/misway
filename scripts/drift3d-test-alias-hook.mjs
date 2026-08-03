import path from "node:path";
import { pathToFileURL } from "node:url";

const SRC_BASE = pathToFileURL(path.resolve(process.cwd(), "src") + "/").href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const rewritten = `${SRC_BASE}${specifier.slice(2)}.ts`;
    return nextResolve(rewritten, context);
  }

  return nextResolve(specifier, context);
}
