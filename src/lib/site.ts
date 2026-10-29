export const SITE = {
  title: "Runcheng",
  author: "Richard",
} as const;
export const NAVIGATION = [
  { path: "/", key: "nav.home" },
  { path: "/projects/", key: "nav.projects" },
  { path: "/blog/", key: "nav.blog" },
  { path: "/about/", key: "nav.about" },
] as const;
