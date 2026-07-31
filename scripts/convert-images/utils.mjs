import path from "node:path";

/**
 * Convert Windows paths to POSIX.
 *
 * C:\foo\bar.png
 * ↓
 * C:/foo/bar.png
 */
export function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/");
}

/**
 * Escape a string for use in a RegExp.
 */
export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Change a file extension.
 *
 * logo.png -> logo.webp
 */
export function replaceExtension(filePath, newExtension) {
  const parsed = path.parse(filePath);

  return path.join(
    parsed.dir,
    `${parsed.name}${newExtension}`
  );
}

/**
 * Get lowercase extension.
 */
export function getExtension(filePath) {
  return path.extname(filePath).toLowerCase();
}

/**
 * Get filename only.
 *
 * /images/logo.png
 * ↓
 * logo.png
 */
export function getFileName(filePath) {
  return path.basename(filePath);
}

/**
 * Remove duplicates.
 */
export function unique(array) {
  return [...new Set(array)];
}

/**
 * Check extension.
 */
export function hasExtension(filePath, extensions) {
  return extensions.has(getExtension(filePath));
}

/**
 * Check if file is an image.
 */
export function isImage(filePath) {
  return hasExtension(
    filePath,
    new Set([".png", ".jpg", ".jpeg"])
  );
}

/**
 * Check if file is editable text.
 */
export function isSourceFile(filePath) {
  return hasExtension(
    filePath,
    new Set([
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
    ])
  );
}