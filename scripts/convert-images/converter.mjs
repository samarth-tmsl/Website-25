import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SUPPORTED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
]);

const WEBP_QUALITY = 85;

/**
 * Convert staged images to WebP.
 *
 * @param {string[]} files
 * @returns {Promise<Array<{oldPath:string,newPath:string}>>}
 */
export async function convertImages(files) {
  const conversions = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();

    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      continue;
    }

    const newPath = file.replace(/\.(png|jpg|jpeg)$/i, ".webp");

    try {
      await fs.access(file);
    } catch {
      console.warn(`⚠️ File not found: ${file}`);
      continue;
    }

    console.log(`🖼️  ${file} → ${newPath}`);

    try {
      await sharp(file)
        .rotate() // respects EXIF orientation
        .webp({
          quality: WEBP_QUALITY,
          effort: 6,
        })
        .toFile(newPath);

      // Remove the original image from disk.
      await fs.unlink(file);

      conversions.push({
        oldPath: file,
        newPath,
      });

    } catch (err) {
      console.error(`❌ Failed converting ${file}`);
      console.error(err);
      throw err;
    }
  }

  return conversions;
}