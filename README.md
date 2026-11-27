# Richard's website

[简体中文](README.zh-CN.md) · [Open the website](https://runchengxie.github.io/en/)

This is my home for investment writing and the tools I build for market research. You can browse projects, read articles, and follow links to the underlying research.

Start with the homepage for a quick overview, the projects page for research tools, or the writing page for longer articles. The site is available in English and Chinese, with light and dark themes.

## Run it on your computer

Install Node.js 22.18.0 or newer and pnpm 11.17.0. Then run these commands in the repository folder:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the local address shown in the terminal, usually `http://localhost:4321`. Press `Ctrl+C` to stop the server.

## Make a change

The [development guide](docs/development.md) explains setup, configuration, checks and how to add an article. See [language maintenance](docs/i18n.md) when changing English or Chinese text.

Research panels display results published by separate research projects. Their sample limits and source links remain visible on the site. The [research showcase guide](docs/research-showcase.md) explains how those results are loaded.
