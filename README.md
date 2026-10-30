# runchengxie.github.io

Richard（runchengxie）的个人网站，使用 Astro、TypeScript 和 Markdown 构建，部署到 GitHub Pages。

站点包括个人介绍、精选项目、公开研究与市场报告入口，以及投资文章。支持深色模式、RSS/Atom 订阅和旧文章地址跳转。

默认使用英文，可在页首切换中文并保存选择。页面和全部 15 篇文章都有中英文版本。

- `/en/`、`/zh/`：个人介绍、成果入口、精选项目和最新文章。
- `/{locale}/projects/`：市场研究与因子研究的交互展示，后附项目代码与文档目录。
- `/{locale}/about/`：个人关注方向、工作方式与 GitHub 入口。
- `/{locale}/blog/`：投资文章列表及对应语言正文。
- `/{locale}/notes/investment-perspective/`：保留并翻译原关于页的投资观点。

原有中文地址和订阅源继续兼容。语言目录、翻译维护、缺失翻译回退和浏览器检查见 [双语维护说明](docs/i18n.md)。

项目标识与网址维护在 `src/data/projects.ts`，中英文文案维护在 `src/i18n/`。更新时核对公开仓库状态，保留演示样本、历史回测等范围说明。

项目页直接读取研究网站已公开的汇总结果，保留样本与限制说明；不再展示数据清洗和再平衡工具示例。来源协议、失败状态和检查方式见 [研究展示说明](docs/research-showcase.md)。

## 本地开发

需要 Node.js 22.18 或更新版本，以及 pnpm。

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
5. 双语目录、文章配对、源链接、回退和复数规则检查

## 写文章

在 `src/content/blog` 和 `src/content/blog-en` 分别添加相同文件名的中文原文和完整英文译文，文件名使用 `YYYY-MM-DD-slug.md`：

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
