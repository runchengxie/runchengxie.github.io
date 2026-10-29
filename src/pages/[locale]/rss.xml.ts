import type { APIRoute } from "astro";
import { locales, type Locale } from "../../i18n";
import { createFeed } from "../../lib/feed";
export const getStaticPaths = () => locales.map((locale) => ({params: {locale}}));
export const GET: APIRoute = ({site, params}) => createFeed(site ?? new URL("https://runchengxie.github.io"), params.locale as Locale);
