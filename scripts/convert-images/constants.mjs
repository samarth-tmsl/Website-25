/**
 * WebP quality (0-100)
 */
export const WEBP_QUALITY = 85;

/**
 * Sharp WebP effort (0-6)
 * Higher = smaller files but slower conversion.
 */
export const WEBP_EFFORT = 6;

/**
 * Image extensions to convert.
 */
export const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
]);

/**
 * Source files whose image references should be updated.
 */
export const SOURCE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",

  ".html",

  ".css",
  ".scss",
  ".sass",
  ".less",

  ".md",
  ".mdx",
]);

/**
 * Files/folders that should never be converted.
 *
 * These are matched by prefix.
 */
export const IGNORE_PATHS = [
  "android/",
  "public/images2/new/guest/",
];

/**
 * Git diff filter.
 *
 * A = Added
 * M = Modified
 */
export const GIT_DIFF_FILTER = "AM";