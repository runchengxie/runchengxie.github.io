import rss from "@astrojs/rss";
import { getExcerpt, getPostHref, getLocalizedPosts } from "./posts";
import { t, languageTag, type Locale } from "../i18n";
import { SITE } from "./site";

export async function createFeed(site: URL, locale: Locale = "zh") {
  const posts = await getLocalizedPosts(locale);

  return rss({
    title: SITE.title,
    description: t(locale, "site.description"),
    site,
    customData: `<language>${languageTag(locale)}</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: getExcerpt(post.body ?? "", locale === "en" ? 200 : 116, locale),
      link: getPostHref(post, locale),
      categories: post.data.categories,
    })),
  });
}
