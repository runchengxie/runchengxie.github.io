import { getCollection } from "astro:content";
import { languageTag, localizedPath, type Locale } from "../i18n";
import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog"> | CollectionEntry<"blogEn">;

const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;
const markdownSyntax = /[#>*_`~[\]()]|!\[[^\]]*]\([^)]*\)|\[([^\]]+)]\([^)]*\)/g;

export function getPostSlug(post: BlogPost): string {
  return post.id.replace(DATE_PREFIX, "").replace(/\.md$/, "");
}

export function getPostHref(post: BlogPost, locale: Locale = "zh"): string {
  return localizedPath(locale, `/blog/${getPostSlug(post)}/`);
}

export function sortPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (first, second) => second.data.date.getTime() - first.data.date.getTime(),
  );
}

export function formatDate(date: Date, locale: Locale = "zh"): string {
  return new Intl.DateTimeFormat(languageTag(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Shanghai",
  }).format(date);
}

export function formatShortDate(date: Date, locale: Locale = "zh"): string {
  return new Intl.DateTimeFormat(languageTag(locale), {
    year: "numeric",
    month: locale === "en" ? "short" : "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  })
    .format(date)
    .replaceAll("/", ".");
}

export function getExcerpt(body: string, maximumLength = 116, locale: Locale = "zh"): string {
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

  if (plainText.length <= maximumLength) return plainText;
  let excerpt = plainText.slice(0, maximumLength).trimEnd();
  if (locale === "en" && /\S/.test(plainText[maximumLength] ?? "")) {
    const lastSpace = excerpt.lastIndexOf(" ");
    if (lastSpace > 0) excerpt = excerpt.slice(0, lastSpace);
  }
  return `${excerpt}…`;
}

export function getReadingMinutes(body: string, locale: Locale = "zh"): number {
  if (locale === "en") return Math.max(1, Math.ceil(body.replace(/```[\s\S]*?```/g, "").split(/\s+/).filter(Boolean).length / 220));
  const textLength = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(markdownSyntax, "$1")
    .replace(/\s/g, "").length;

  return Math.max(1, Math.ceil(textLength / 500));
}

// A new untranslated article remains readable, with an explicit original-language notice.
export async function getLocalizedPosts(locale: Locale): Promise<BlogPost[]> {
  const originals = await getCollection("blog");
  if (locale === "zh") return sortPosts(originals);
  const translations = await getCollection("blogEn");
  const bySlug = new Map(translations.map((post) => [getPostSlug(post), post]));
  return sortPosts(originals.map((post) => bySlug.get(getPostSlug(post)) ?? post));
}
