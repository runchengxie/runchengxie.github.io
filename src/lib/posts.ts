import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;
const markdownSyntax = /[#>*_`~[\]()]|!\[[^\]]*]\([^)]*\)|\[([^\]]+)]\([^)]*\)/g;

export function getPostSlug(post: BlogPost): string {
  return post.id.replace(DATE_PREFIX, "").replace(/\.md$/, "");
}

export function getPostHref(post: BlogPost): string {
  return `/blog/${getPostSlug(post)}/`;
}

export function sortPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (first, second) => second.data.date.getTime() - first.data.date.getTime(),
  );
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(SITE_LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Shanghai",
  }).format(date);
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat(SITE_LOCALE, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  })
    .format(date)
    .replaceAll("/", ".");
}

export function getExcerpt(body: string, maximumLength = 116): string {
  const firstParagraph =
    body
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .find(
        (paragraph) =>
          paragraph.length > 0 &&
          !paragraph.startsWith("#") &&
          !paragraph.startsWith("-") &&
          !/^\d+\./.test(paragraph),
      ) ?? "";

  const plainText = firstParagraph
    .replace(markdownSyntax, "$1")
    .replace(/\s+/g, " ")
    .trim();

  return plainText.length > maximumLength
    ? `${plainText.slice(0, maximumLength).trimEnd()}…`
    : plainText;
}

export function getReadingMinutes(body: string): number {
  const textLength = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(markdownSyntax, "$1")
    .replace(/\s/g, "").length;

  return Math.max(1, Math.ceil(textLength / 500));
}

const SITE_LOCALE = "zh-CN";
