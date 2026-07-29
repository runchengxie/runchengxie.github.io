import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getExcerpt, getPostHref, sortPosts } from "./posts";
import { SITE } from "./site";

export async function createFeed(site: URL) {
  const posts = sortPosts(await getCollection("blog"));

  return rss({
    title: SITE.title,
    description: SITE.description,
    site,
    customData: `<language>${SITE.locale}</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: getExcerpt(post.body ?? ""),
      link: getPostHref(post),
      categories: post.data.categories,
    })),
  });
}
