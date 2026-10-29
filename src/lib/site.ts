export const SITE = {
  title: "Runcheng",
  description: "Richard 的个人网站：量化研究、市场数据、开源工具与投资思考",
  author: "Richard",
  locale: "zh-CN",
} as const;

export const NAVIGATION = [
  { href: "/", label: "主页" },
  { href: "/projects/", label: "项目" },
  { href: "/blog/", label: "文章" },
  { href: "/about/", label: "关于" },
] as const;
