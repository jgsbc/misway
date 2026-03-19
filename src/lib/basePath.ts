const BASE_PATH = process.env.NODE_ENV === "production" ? "/misway" : "";

export function withBasePath(path: string) {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BASE_PATH}${path}`;
}