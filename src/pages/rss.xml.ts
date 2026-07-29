import type { APIRoute } from "astro";
import { createFeed } from "../lib/feed";

export const GET: APIRoute = ({ site }) =>
  createFeed(site ?? new URL("https://runchengxie.github.io"));
