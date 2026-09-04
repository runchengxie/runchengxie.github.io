# runchengxie.github.io

Runcheng 的个人主页和投资文章站点，使用 Astro、TypeScript 和 Markdown 构建，部署到 GitHub Pages。

站点目前包括主页、文章列表、文章详情页、关于页、RSS/Atom 订阅源、站内导航、深色模式和旧地址兼容跳转。文章内容以巴菲特案例、企业研究、投资错误和长期投资思考为主。

## 本地开发

需要 Node.js 22 和 pnpm。

```sh
pnpm install
pnpm dev
```

开发服务器默认运行在 `http://localhost:4321`。

## 质量检查

```sh
script/check
```

该命令依次执行：

1. Astro 与 TypeScript 类型检查
2. 生产构建
3. Jekyll 旧地址兼容页生成
4. 站内链接和关键构建产物检查

## 写文章

在 `src/content/blog` 新建 `YYYY-MM-DD-slug.md`：

```md
---
title: 文章标题
date: 2026-07-29
categories: [投资, 案例研究]
---

正文。
```

文章元数据由 `src/content.config.ts` 中的 Zod schema 校验。当前必填字段为 `title`、`date` 和至少一个 `categories`。

## 部署

推送到 `main` 后，`.github/workflows/pages.yml` 使用 Astro 官方 GitHub Action 构建并部署站点。站点地址为 [runchengxie.github.io](https://runchengxie.github.io)。
