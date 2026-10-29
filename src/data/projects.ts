export interface Project {
  name: string;
  title: string;
  description: string;
  group: "数据与回测" | "因子与模型" | "研究与报告" | "交易与实验";
  website?: string;
  featured?: boolean;
}

// Curated from public repository READMEs; keep claims scoped to published capabilities.
export const projects: Project[] = [
  { name: "quant-market-research", title: "市场研究", group: "研究与报告", featured: true,
    description: "研究指数与 ETF、流动性、交易容量、微盘股和风格因子，公开方法与审核后的结果。",
    website: "https://runchengxie.github.io/quant-market-research/" },
  { name: "quant-factor-observatory", title: "因子观测站", group: "因子与模型", featured: true,
    description: "浏览因子定义、数据质量、研究进展和审核后的汇总结果；部分展示使用演示样本，具体范围见各研究页面。",
    website: "https://runchengxie.github.io/quant-factor-observatory/" },
  { name: "quant-intel-pages", title: "市场日报", group: "研究与报告", featured: true,
    description: "阅读每日与每周市场报告，查看来源证据、数据完整性和发布时间。",
    website: "https://runchengxie.github.io/quant-intel-pages/" },
  { name: "quant-market-data-platform", title: "市场数据平台", group: "数据与回测", featured: true,
    description: "采集、标准化与检查市场数据，按约定格式和版本发布，供研究与回测使用。目前主要关注中国内地市场。",
    website: "https://runchengxie.github.io/quant-market-data-platform/" },
  { name: "quant-platform", title: "研究与回测框架", group: "数据与回测", featured: true,
    description: "提供组合构建、回测、风险分析与交易执行模拟，并定义研究结果的交换格式。",
    website: "https://runchengxie.github.io/quant-platform/" },
  { name: "quant-backtest-runtime", title: "回测任务运行工具", group: "数据与回测",
    description: "执行提交的回测任务，跟踪任务状态并发布版本化结果。" },
  { name: "money-trees", title: "经典因子研究", group: "因子与模型",
    description: "围绕 Alpha101、Alpha191、Alpha158 和 Alpha360，提供因子计算、校验、挖掘与滚动回测工具。" },
  { name: "quant-deep-learning", title: "结构化市场数据与深度学习", group: "因子与模型",
    description: "研究订单簿、分钟数据和 L2 事件流上的深度学习模型，当前关注 A 股次日横截面预测。" },
  { name: "quant-intel-platform", title: "市场报告生成平台", group: "研究与报告",
    description: "采集市场数据与新闻、校验研究产物并生成和投递报告；公开报告由市场日报网站呈现。" },
  { name: "global-market-research", title: "全球市场研究", group: "交易与实验", featured: true,
    description: "研究跨市场策略与因子，提供离线示例和历史实验报告；模拟交易和比赛策略仍需独立验证。",
    website: "https://runchengxie.github.io/global-market-research/" },
  { name: "quant-trading-workbench", title: "交易研究工作台", group: "交易与实验",
    description: "观察 A 股、港股和美股市场，研究日内交易思路，通过网页仪表盘查看数据并测试模拟组合。" },
  { name: "a-share-zoo-garden", title: "A 股动植物主题指数", group: "交易与实验",
    description: "按公司历史名称中的动植物词语构建主题指数，公开成分、计算方法及与沪深 300 的比较。" },
  { name: "ai-stock-picker", title: "语言模型候选股排序", group: "交易与实验",
    description: "用语言模型对已有候选名单排序，检查输出范围，并保存输入、结果和模型调用记录。" },
];

export const projectGroups = ["数据与回测", "因子与模型", "研究与报告", "交易与实验"] as const;
export const researchEntrances = projects.slice(0, 3);
export const repositoryURL = (name: string) => `https://github.com/runchengxie/${name}`;
