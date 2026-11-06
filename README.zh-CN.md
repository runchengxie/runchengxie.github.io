# runchengxie.github.io

[English](README.md)

Richard 的个人网站，使用 Astro、TypeScript 和 Markdown 构建，发布到 [GitHub Pages](https://runchengxie.github.io)。

站点展示精选项目、公开市场与因子研究、市场报告，以及十五篇有完整中英文版本的投资文章。默认使用英文，可在页首切换语言，浏览器存储可用时会保存选择。站点还提供深色模式、按语言区分的 RSS/Atom 订阅源和旧文章地址跳转。

## 本地启动

需要 Node.js 22.18.0 或更新版本，以及项目固定的 `pnpm@11.17.0`。在仓库根目录执行：

```sh
pnpm install --frozen-lockfile
pnpm dev
```

开发服务器默认为 `http://localhost:4321`。运行 `script/check` 可执行类型检查、生产构建、站内链接检查和单元及构建测试。

## 维护文档

- [开发与发布](docs/development.zh-CN.md)：安装、命令、文章维护和 CI
- [语言维护](docs/i18n.zh-CN.md)：路由、词条、回退规则和浏览器检查
- [研究展示](docs/research-showcase.md)（英文）：公开来源契约与解释边界
- [文章引用](docs/article-references.md)（英文）：引用规范与双语来源记录

项目标识与网址维护在 `src/data/projects.ts`，本地化文案维护在 `src/i18n/`。项目页读取独立研究站点已发布的汇总数据，研究结果及其证据边界由来源项目维护。
