import en from "./en.ts";
import zh from "./zh.ts";

export const locales = ["en", "zh"] as const;
export type Locale = typeof locales[number];
export type MessageKey = keyof typeof en;
export const languageTag = (locale: Locale) => locale === "zh" ? "zh-CN" : "en";
export const localeFromPath = (path: string): Locale => path.split("/")[1] === "zh" ? "zh" : "en";
const catalogs: Record<Locale, Partial<Record<MessageKey, string>>> = { en, zh };

export function t(locale: Locale, key: MessageKey, values: Record<string, string | number> = {}): string {
  const message = catalogs[locale][key] ?? en[key];
  return message.replace(/\{(\w+)\}/g, (token, name: string) => String(values[name] ?? token));
}

export function countMessage(locale: Locale, key: "blog.count" | "blog.reading", count: number): string {
  const category = new Intl.PluralRules(languageTag(locale)).select(count) === "one" ? "one" : "other";
  return t(locale, `${key}.${category}`, { count: new Intl.NumberFormat(languageTag(locale)).format(count) });
}

export function localizedPath(locale: Locale, path = "/"): string {
  const clean = path.replace(/^\/(en|zh)(?=\/|$)/, "");
  return `/${locale}${clean.startsWith("/") ? clean : `/${clean}`}`;
}
