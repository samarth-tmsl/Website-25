import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

/**
 * Returns all staged files that are Added or Modified.
 */
export async function getStagedFiles() {
  const { stdout } = await exec("git", [
    "diff",
    "--cached",
    "--name-only",
    "--diff-filter=AM",
  ]);

  return stdout
    .split(/\r?\n/)
    .map(file => file.trim())
    .filter(Boolean);
}

/**
 * Stage files.
 *
 * @param {string[]} files
 */
export async function stageFiles(files) {
  if (!files.length) return;

  const unique = [...new Set(files)];

  await exec("git", [
    "add",
    "--",
    ...unique,
  ]);
}

/**
 * Remove files from Git and disk.
 *
 * @param {string[]} files
 */
export async function removeFiles(files) {
  if (!files.length) return;

  const unique = [...new Set(files)];

  await exec("git", [
    "rm",
    "--",
    ...unique,
  ]);
}

/**
 * Check if we're inside a git repository.
 */
export async function isGitRepository() {
  try {
    await exec("git", [
      "rev-parse",
      "--is-inside-work-tree",
    ]);

    return true;
  } catch {
    return false;
  }
}

/**
 * Get the repository root.
 */
export async function getRepositoryRoot() {
  const { stdout } = await exec("git", [
    "rev-parse",
    "--show-toplevel",
  ]);

  return stdout.trim();
}