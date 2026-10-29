# runchengxie.github.io

Richard（runchengxie）的个人网站，使用 Astro、TypeScript 和 Markdown 构建，部署到 GitHub Pages。

站点包括个人介绍、精选项目、公开研究与市场报告入口，以及投资文章。支持深色模式、RSS/Atom 订阅和旧文章地址跳转。

- `/`：个人介绍、公开成果入口、精选项目和最新文章。
- `/projects/`：按数据与回测、因子与模型、研究与报告、交易与实验分类的项目介绍。
- `/about/`：个人关注方向、工作方式与 GitHub 入口。
- `/blog/`：巴菲特案例、企业研究、投资错误和长期投资思考。
- `/notes/investment-perspective/`：保留原关于页的投资观点。

项目数据集中维护在 `src/data/projects.ts`。更新时核对公开仓库 README、归档状态和网站入口，避免把演示样本或历史回测描述成实际运行成果。本站与其他项目网站分别部署；构建检查只跳过明确列出的独立项目路径，其余站内链接仍须指向本地构建产物。

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
