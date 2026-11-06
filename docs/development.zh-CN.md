# 开发与发布

[English](development.md)

## 安装与命令

使用 `package.json` 声明的 Node.js 22.18.0 或更新版本，以及 `pnpm@11.17.0`。以下命令均从仓库根目录执行。

```sh
pnpm install --frozen-lockfile
pnpm dev
script/check
```

`pnpm dev` 默认在 4321 端口启动 Astro。`script/check` 调用 `pnpm run build`，依次执行 Astro/TypeScript 检查、静态构建、旧地址跳转页生成、构建产物检查和 `tests/*.test.mjs`。`pnpm test` 执行同一套构建流程，`pnpm check` 只执行 Astro/TypeScript 检查。

浏览器检查需要先完成构建，并安装 Chromium：

```sh
pnpm exec playwright install chromium
pnpm run test:browser
```

浏览器脚本会在空闲的本地回环端口启动服务器，使用合成 fixture 检查双语导航、主题、动效、文章和研究面板。构建与浏览器测试不依赖在线研究服务。外部来源是否可用、内容是否准确，需要单独核查。详见[语言维护](i18n.zh-CN.md)和[研究展示契约](research-showcase.md)（英文）。

项目没有单独配置 lint 命令、覆盖率阈值或依赖安全门禁。`pnpm audit` 可单独查询依赖漏洞，不属于 `script/check` 或 Pages workflow。构建成功不能证明依赖安全。

## 内容与路由

- `/en/`、`/zh/`：个人介绍、公开成果、精选项目和最新文章
- `/{locale}/projects/`：市场风格与 PB/ROE 研究面板，后附项目链接
- `/{locale}/about/`：关注方向、工作方式和 GitHub 入口
- `/{locale}/blog/`：文章列表和对应语言正文
- `/{locale}/notes/investment-perspective/`：保留的投资观点

项目标识与网址维护在 `src/data/projects.ts`，文案维护在 `src/i18n/`，共用页面位于 `src/views/`。研究面板消费经过审查的公开汇总结果，并展示样本和解释边界，不计算新的研究结果。

## 添加文章

在 `src/content/blog/`（中文）和 `src/content/blog-en/`（英文）添加同名文件，文件名采用 `YYYY-MM-DD-slug.md`，例如：

```md
---
title: 文章标题
date: 2026-07-29
categories: [投资, 案例研究]
---

正文。
```

`src/content.config.ts` 要求 `title` 非空、`date` 可转换为日期，且 `categories` 至少包含一个非空条目。`reviewedAt` 可选。双语文章应保留相同的身份、日期、数值含义、限定条件和引用目标。详见[引用规范](article-references.md)（英文）。

## CI 与部署

`.github/workflows/pages.yml` 使用 Astro action 安装依赖、执行配置的构建并上传产物，然后运行 Chromium 检查。PR 只构建和测试，不部署。向 `main` 推送和手动运行 workflow 时，后续的 Pages job 可以执行部署。

`dist/`、`.astro/` 和 `node_modules/` 是已忽略的生成目录。不要提交构建产物、凭据、原始研究数据或浏览器诊断文件。源码或文档 PR 本身不能证明线上部署已通过验证。
