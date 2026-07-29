import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const outputDirectory = path.join(projectRoot, "dist");
const siteOrigin = "https://runchengxie.github.io";
const linkPattern = /(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
const skippedProtocols = /^(?:data|javascript|mailto|tel):/i;
const errors = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(entryPath)));
    else files.push(entryPath);
  }

  return files;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function candidatePaths(pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return [];
  }

  const relativePath = decodedPath.replace(/^\/+/, "");
  if (relativePath === "") return [path.join(outputDirectory, "index.html")];

  if (decodedPath.endsWith("/")) {
    return [path.join(outputDirectory, relativePath, "index.html")];
  }

  if (path.extname(relativePath)) {
    return [path.join(outputDirectory, relativePath)];
  }

  return [
    path.join(outputDirectory, relativePath, "index.html"),
    path.join(outputDirectory, `${relativePath}.html`),
  ];
}

const allFiles = await walk(outputDirectory);
const htmlFiles = allFiles.filter((file) => file.endsWith(".html"));
let checkedLinks = 0;

for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, "utf8");
  for (const match of html.matchAll(linkPattern)) {
    const rawLink = (match[1] ?? match[2] ?? "").trim();
    if (
      rawLink === "" ||
      rawLink.startsWith("#") ||
      skippedProtocols.test(rawLink)
    ) {
      continue;
    }

    const resolved = new URL(rawLink, siteOrigin);
    if (resolved.origin !== siteOrigin) continue;

    checkedLinks += 1;
    const candidates = candidatePaths(resolved.pathname);
    const found = (
      await Promise.all(candidates.map((candidate) => exists(candidate)))
    ).some(Boolean);

    if (!found) {
      errors.push(
        `${path.relative(outputDirectory, htmlFile)} -> ${rawLink}: target not found`,
      );
    }
  }
}

const requiredFiles = [
  "index.html",
  "about/index.html",
  "about.html",
  "blog/index.html",
  "blog.html",
  "rss.xml",
  "feed.xml",
  "sitemap.xml",
  "sitemap-index.xml",
];

for (const relativePath of requiredFiles) {
  if (!(await exists(path.join(outputDirectory, relativePath)))) {
    errors.push(`missing required output: ${relativePath}`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Checked ${htmlFiles.length} HTML files and ${checkedLinks} internal links.`,
  );
}
