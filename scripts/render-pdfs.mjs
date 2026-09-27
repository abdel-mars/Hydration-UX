import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pdfDir = path.join(root, "src", "pdfs");
const outDir = path.join(root, "public", "flipbook");
const manifestFile = path.join(root, "src", "data", "flipbook-manifest.json");

const PAGE_WIDTH_PX = 1655;
const MAX_DPI = 1400;
const PAGE_QUALITY = 82;
const THUMB_WIDTH = 400;
const THUMB_QUALITY = 68;

const deliverables = JSON.parse(
  await fs.readFile(path.join(root, "src", "data", "deliverables.json"), "utf8"),
);

const pad = (n) => String(n).padStart(2, "0");

const pdfInfo = async (file) => {
  const { stdout } = await run("pdfinfo", [file]);
  const read = (key) =>
    stdout.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
  const size = read("Page size") ?? "595.5 x 842.25 pts (A4)";
  const [width, height] = size.split(/\s+x\s+/).map((n) => Number.parseFloat(n));
  const dpi = Math.min(MAX_DPI, Math.round(PAGE_WIDTH_PX / (width / 72)));
  return {
    pages: Number.parseInt(read("Pages"), 10),
    aspect: Number((width / height).toFixed(4)),
    dpi,
    pixelWidth: Math.round((width / 72) * dpi),
    pixelHeight: Math.round((height / 72) * dpi),
  };
};

const jpegPages = async (pdfFile, prefix, sizeArgs, quality) => {
  const base = [
    ...sizeArgs,
    "-jpeg",
    "-jpegopt",
    `quality=${quality},progressive=y,optimize=y`,
    pdfFile,
    prefix,
  ];
  try {
    await run("pdftoppm", base, { maxBuffer: 1024 * 1024 * 32 });
  } catch (error) {
    if (!String(error.message).includes("quality")) throw error;
    await run("pdftoppm", [...sizeArgs, "-jpeg", pdfFile, prefix], {
      maxBuffer: 1024 * 1024 * 32,
    });
  }
};

const renamePages = async (dir, prefix, to) => {
  const files = await fs.readdir(dir);
  for (const file of files.filter((name) => name.startsWith(prefix))) {
    const index = Number.parseInt(
      file.slice(prefix.length).replace(/\D/g, ""),
      10,
    );
    await fs.rename(path.join(dir, file), path.join(dir, `${to}-${pad(index)}.jpg`));
  }
};

const main = async () => {
  await fs.mkdir(outDir, { recursive: true });

  const manifest = {};

  for (const deliverable of deliverables) {
    const pdfFile = path.join(pdfDir, deliverable.pdf);
    const info = await pdfInfo(pdfFile).catch(() => null);

    if (!info) {
      console.warn(`! skipping ${deliverable.slug}: cannot read ${deliverable.pdf}`);
      continue;
    }

    const slugDir = path.join(outDir, deliverable.slug);
    await fs.rm(slugDir, { recursive: true, force: true });
    await fs.mkdir(slugDir, { recursive: true });

    await jpegPages(pdfFile, path.join(slugDir, "page"), ["-r", String(info.dpi)], PAGE_QUALITY);
    await jpegPages(
      pdfFile,
      path.join(slugDir, "thumb"),
      ["-scale-to-x", String(THUMB_WIDTH), "-scale-to-y", "-1"],
      THUMB_QUALITY,
    );

    await renamePages(slugDir, "page-", "page");
    await renamePages(slugDir, "thumb-", "thumb");

    const files = await fs.readdir(slugDir);
    const pageFiles = files.filter((name) => name.startsWith("page-")).sort();
    const bytes = (
      await Promise.all(
        pageFiles.map(async (name) => (await fs.stat(path.join(slugDir, name))).size),
      )
    ).reduce((total, size) => total + size, 0);

    manifest[deliverable.slug] = {
      pageCount: pageFiles.length,
      aspect: info.aspect,
      pixelWidth: info.pixelWidth,
      pixelHeight: info.pixelHeight,
      bytes,
    };

    console.log(
      `✓ ${deliverable.slug.padEnd(17)} ${String(pageFiles.length).padStart(2)} pages  ` +
        `${String(info.pixelWidth).padStart(4)}x${String(info.pixelHeight).padEnd(4)}  ` +
        `aspect ${String(info.aspect).padEnd(6)} ${(bytes / 1024 / 1024).toFixed(2)}MB`,
    );
  }

  await fs.writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nwrote ${path.relative(root, manifestFile)}`);
};

main().catch((error) => {
  console.error(error.stderr || error.message || error);
  process.exit(1);
});
