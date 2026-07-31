import fs from "node:fs/promises";

const TEXT_FILE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".html",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".md",
  ".mdx",
]);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizePath(path) {
  return path.replace(/\\/g, "/");
}

/**
 * Replace image references in staged source files.
 *
 * @param {{
 *   files: string[],
 *   conversions: Array<{
 *     oldPath: string,
 *     newPath: string
 *   }>
 * }} options
 */
export async function updateImports({ files, conversions }) {
  if (!files.length || !conversions.length) {
    return;
  }

  for (const file of files) {
    const ext = file.substring(file.lastIndexOf(".")).toLowerCase();

    if (!TEXT_FILE_EXTENSIONS.has(ext)) {
      continue;
    }

    let content;

    try {
      content = await fs.readFile(file, "utf8");
    } catch {
      continue;
    }

    const original = content;

    for (const conversion of conversions) {
      const oldPath = normalizePath(conversion.oldPath);
      const newPath = normalizePath(conversion.newPath);

      const oldName = oldPath.split("/").pop();
      const newName = newPath.split("/").pop();

      // Replace full relative/absolute path
      content = content.replace(
        new RegExp(escapeRegex(oldPath), "g"),
        newPath
      );

      // Replace filename-only imports
      content = content.replace(
        new RegExp(escapeRegex(oldName), "g"),
        newName
      );
    }

    if (content !== original) {
      console.log(`✏️ Updated imports in ${file}`);
      await fs.writeFile(file, content, "utf8");
    }
  }
}