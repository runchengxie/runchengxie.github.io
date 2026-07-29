# runchengxie.github.io

Runcheng 的个人主页与投资文章，使用 Astro、TypeScript 和 Markdown 构建，并部署到 GitHub Pages。

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

1. Astro 与 TypeScript 类型检查；
2. 生产构建；
3. Jekyll 旧地址兼容页生成；
4. 站内链接和关键构建产物检查。

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

文章元数据由 `src/content.config.ts` 中的 Zod schema 校验。

## 部署

推送到 `main` 后，`.github/workflows/pages.yml` 使用 Astro 官方 GitHub Action 构建并部署站点。
