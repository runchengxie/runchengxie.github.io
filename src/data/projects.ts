import type { Locale } from "../i18n";
import { t, type MessageKey } from "../i18n";
export const projectGroups = ["data", "models", "reports", "trading"] as const;
export type ProjectGroup = typeof projectGroups[number];
export interface Project {
  name: string;
  titleKey: MessageKey;
  descriptionKey: MessageKey;
  group: ProjectGroup;
  website?: string;
  featured?: boolean;
}
export const projects: Project[] = [
  {"name": "quant-market-research", "titleKey": "project.quant-market-research.title", "descriptionKey": "project.quant-market-research.description", "group": "reports", "featured": true, "website": "https://runchengxie.github.io/quant-market-research/"},
  {"name": "quant-factor-observatory", "titleKey": "project.quant-factor-observatory.title", "descriptionKey": "project.quant-factor-observatory.description", "group": "models", "featured": true, "website": "https://runchengxie.github.io/quant-factor-observatory/"},
  {"name": "quant-intel-pages", "titleKey": "project.quant-intel-pages.title", "descriptionKey": "project.quant-intel-pages.description", "group": "reports", "featured": true, "website": "https://runchengxie.github.io/quant-intel-pages/"},
  {"name": "quant-market-data-platform", "titleKey": "project.quant-market-data-platform.title", "descriptionKey": "project.quant-market-data-platform.description", "group": "data", "featured": true, "website": "https://runchengxie.github.io/quant-market-data-platform/"},
  {"name": "quant-platform", "titleKey": "project.quant-platform.title", "descriptionKey": "project.quant-platform.description", "group": "data", "featured": true, "website": "https://runchengxie.github.io/quant-platform/"},
  {"name": "quant-backtest-runtime", "titleKey": "project.quant-backtest-runtime.title", "descriptionKey": "project.quant-backtest-runtime.description", "group": "data"},
  {"name": "money-trees", "titleKey": "project.money-trees.title", "descriptionKey": "project.money-trees.description", "group": "models"},
  {"name": "quant-deep-learning", "titleKey": "project.quant-deep-learning.title", "descriptionKey": "project.quant-deep-learning.description", "group": "models"},
  {"name": "quant-intel-platform", "titleKey": "project.quant-intel-platform.title", "descriptionKey": "project.quant-intel-platform.description", "group": "reports"},
  {"name": "global-market-research", "titleKey": "project.global-market-research.title", "descriptionKey": "project.global-market-research.description", "group": "trading", "featured": true, "website": "https://runchengxie.github.io/global-market-research/"},
  {"name": "quant-trading-workbench", "titleKey": "project.quant-trading-workbench.title", "descriptionKey": "project.quant-trading-workbench.description", "group": "trading"},
  {"name": "a-share-zoo-garden", "titleKey": "project.a-share-zoo-garden.title", "descriptionKey": "project.a-share-zoo-garden.description", "group": "trading"},
  {"name": "ai-stock-picker", "titleKey": "project.ai-stock-picker.title", "descriptionKey": "project.ai-stock-picker.description", "group": "trading"},
 ];
export const researchEntrances = projects.slice(0, 3);
export const repositoryURL = (name: string) => `https://github.com/runchengxie/${name}`;
export const projectText = (project: Project, locale: Locale) => ({
  title: t(locale, project.titleKey), description: t(locale, project.descriptionKey), group: t(locale, `group.${project.group}`),
});
