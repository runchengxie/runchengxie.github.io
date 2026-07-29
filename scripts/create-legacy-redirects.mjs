import {
  copyFile,
  readdir,
  readFile,
  mkdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parse } from "yaml";

const projectRoot = process.cwd();
const contentDirectory = path.join(projectRoot, "src", "content", "blog");
const outputDirectory = path.join(projectRoot, "dist");
const frontmatterPattern = /^---\s*\n([\s\S]*?)\n---\s*\n/;
const filenamePattern = /^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function assertSafeSegment(segment, sourceFile) {
  if (
    typeof segment !== "string" ||
    segment.length === 0 ||
    segment === "." ||
    segment === ".." ||
    segment.includes("/") ||
    segment.includes("\\")
  ) {
    throw new Error(`${sourceFile}: invalid legacy URL segment "${segment}"`);
  }
}

function redirectDocument(target) {
  const safeTarget = escapeHtml(target);

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="refresh" content="0; url=${safeTarget}">
    <link rel="canonical" href="${safeTarget}">
    <title>页面已迁移 · Runcheng</title>
  </head>
  <body>
    <p>页面已迁移。<a href="${safeTarget}">继续阅读</a></p>
  </body>
</html>
`;
}

async function writeRedirect(relativeOutputPath, target) {
  const outputPath = path.join(outputDirectory, relativeOutputPath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, redirectDocument(target), "utf8");
}

const contentFiles = (await readdir(contentDirectory))
  .filter((filename) => filename.endsWith(".md"))
  .sort();

let redirectCount = 0;

for (const filename of contentFiles) {
  const filenameMatch = filenamePattern.exec(filename);
  if (!filenameMatch) {
    throw new Error(`${filename}: expected YYYY-MM-DD-slug.md`);
  }

  const [, year, month, day, slug] = filenameMatch;
  const source = await readFile(path.join(contentDirectory, filename), "utf8");
  const frontmatterMatch = frontmatterPattern.exec(source);
  if (!frontmatterMatch) {
    throw new Error(`${filename}: missing YAML frontmatter`);
  }

  const frontmatter = parse(frontmatterMatch[1]);
  const categories = frontmatter.categories;
  if (!Array.isArray(categories) || categories.length === 0) {
    throw new Error(`${filename}: categories must be a non-empty array`);
  }

  for (const category of categories) assertSafeSegment(category, filename);
  assertSafeSegment(slug, filename);

  const legacyPath = path.join(
    ...categories,
    year,
    month,
    day,
    `${slug}.html`,
  );
  await writeRedirect(legacyPath, `/blog/${slug}/`);
  redirectCount += 1;
}

await writeRedirect("about.html", "/about/");
await writeRedirect("blog.html", "/blog/");
redirectCount += 2;

await copyFile(
  path.join(outputDirectory, "sitemap-index.xml"),
  path.join(outputDirectory, "sitemap.xml"),
);

console.log(`Created ${redirectCount} legacy redirect pages.`);
