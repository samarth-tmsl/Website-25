import process from "node:process";

import {
  getStagedFiles,
  stageFiles,
  removeFiles,
} from "./git.mjs";

import {
  convertImages,
} from "./converter.mjs";

import {
  updateImports,
} from "./replacer.mjs";

import {
  normalizePath,
} from "./utils.mjs";

import {
  IMAGE_EXTENSIONS,
  SOURCE_EXTENSIONS,
  IGNORE_PATHS,
} from "./constants.mjs";

function hasExtension(file, extensions) {
  const lower = file.toLowerCase();
  for (const ext of extensions) {
    if (lower.endsWith(ext)) return true;
  }
  return false;
}

function isIgnored(file) {
  const normalized = normalizePath(file);
  return IGNORE_PATHS.some(ignorePath => normalized.startsWith(ignorePath));
}

async function main() {
  console.log("📸 Image conversion started...");

  const stagedFiles = await getStagedFiles();

  if (!stagedFiles.length) {
    console.log("No staged files.");
    return;
  }

  const activeStagedFiles = stagedFiles.filter(file => !isIgnored(file));

  const imageFiles = activeStagedFiles.filter(file =>
    hasExtension(file, IMAGE_EXTENSIONS)
  );

  const sourceFiles = activeStagedFiles.filter(file =>
    hasExtension(file, SOURCE_EXTENSIONS)
  );

  if (!imageFiles.length) {
    console.log("No staged images found.");
    return;
  }

  console.log(`Found ${imageFiles.length} image(s).`);

  /**
   * Returns something like:
   *
   * [
   *   {
   *     oldPath: "public/images/logo.png",
   *     newPath: "public/images/logo.webp"
   *   }
   * ]
   */
  const conversions = await convertImages(imageFiles);

  if (!conversions.length) {
    console.log("Nothing converted.");
    return;
  }

  console.log("Updating imports...");

  await updateImports({
    files: sourceFiles,
    conversions,
  });

  console.log("Updating Git index...");

  await stageFiles([
    ...sourceFiles,
    ...conversions.map(c => c.newPath),
  ]);

  await removeFiles(
    conversions.map(c => c.oldPath)
  );

  console.log("✅ Done!");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});