---
title: 巴菲特的投资经验与多因子研究有哪些交集
date: 2026-01-26
reviewedAt: 2026-10-30
categories: [投资, 巴菲特, 论文解读, 量化研究]
---

多因子研究发现，股票的估值和盈利能力与历史平均收益有关。这些结果与巴菲特讨论的企业质量、买入价格存在交集，但两类材料使用的方法和样本不同。

## 资料时间与适用范围

主要论文发表于 1992 至 2015 年。Carhart 的基金样本为 1962 至 1993 年，动量与盈利能力研究各有自己的历史样本，不能把它们当成同一时期的检验。股东信按所述年度命名，通常在次年发布。到 2026 年 10 月，这些材料仍可用于比较投资思路，但本文没有补做近年样本，也没有验证当前交易成本下的策略收益。

这些研究有不少结论和巴菲特的经验相通。下面看四个最有代表性的交集。

## 1. 盈利能力与估值共同影响历史收益

Novy-Marx 的核心结论之一是，毛盈利能力（毛利润/总资产）较高的公司，即使估值相对更高，平均回报仍然更高。把盈利能力纳入控制变量后，价值策略的表现也会明显改善。

巴菲特在 [1979 年股东信](https://www.berkshirehathaway.com/letters/1979.html)里提到，便宜的烂生意不如价格合理的好生意。他在 [1982 年股东信](https://www.berkshirehathaway.com/letters/1982.html)讨论以自身被低估的股票支付收购价时又指出，即使标的价格公平，付出的实际价值仍可能过高，让 marvelous business（好生意）变成 terrible buy（糟糕的买卖）。

## 2. 盲目扩张的风险

Fama-French 五因子里的投资因子 CMA 表示，在控制其他因素后，投资更激进的公司平均回报更低。论文还指出一个表现特别差的组合，小盘股中高投资、低盈利的公司，并把它称为 lethal portfolios。

伯克希尔是一个多元控股集团，巴菲特也反复强调，资本配置要看资金效率，不能只追求规模。比如在 [2014 年致股东信](https://www.berkshirehathaway.com/letters/2014ltr.pdf)中，他就把 LTV 集团作为反面教材。

## 3. 频繁交易带来的成本会明显拖累业绩

Carhart 的结果很直接，费用率、换手率和销售费（load）都与较差的风险调整后表现显著相关。回归系数说明，投资者承担的成本基本没有换来相应的收益。

表 V 的费用率系数约为 -1.54，换手率系数约为 -0.95。费用率提高 1 个百分点，对应的年化异常收益约下降 1.54 个百分点。换手率结果需要结合表中的变量缩放阅读，作者把它解释为每次完整买卖约 0.95% 的净交易成本。两个系数不能脱离各自单位直接比较。

巴菲特在 [1983 年股东信](https://www.berkshirehathaway.com/letters/1983.html)里说过，市场过度活跃是企业的 pickpocket（扒手）。他还算过一笔账，如果股票一年换手 100%，买卖各收 1% 佣金，股东每年就要为这次转手付出公司净资产的 2%，相当于消耗掉公司 12% ROE 的六分之一。这是一场昂贵的音乐椅游戏，也是一种自我征税。

## 4. 短期动量与企业分析的差别

巴菲特和这些量化研究的一个主要差异，在于对短期动量的看法。Jegadeesh-Titman 的研究表明，买入过去表现好、卖出过去表现差的策略，在 3 到 12 个月的持有期内有显著正收益。最成功的 12-month/3-month 策略，月收益约为 1.31%，是否跳过最近一周会影响结果。

本文比较的是巴菲特公开讨论的企业分析与论文中的短期动量信号。两者使用的信息和持有期限不同，不能仅凭这些论文判断哪种方法在当前市场更优。

## 5. 参考资料

1. Eugene F. Fama、Kenneth R. French（1992），[The Cross-Section of Expected Stock Returns](https://doi.org/10.1111/j.1540-6261.1992.tb04398.x)，*The Journal of Finance* 47(2)，427至465。提供规模、账面市值比与平均收益的基础研究背景。
2. Eugene F. Fama、Kenneth R. French（1993），[Common Risk Factors in the Returns on Stocks and Bonds](https://www.sciencedirect.com/science/article/pii/0304405X93900235)，*Journal of Financial Economics* 33(1)，3至56。提供三因子股票模型背景。这与上条 1992 年论文是两篇不同的作品。
3. Narasimhan Jegadeesh、Sheridan Titman（1993），[Returns to Buying Winners and Selling Losers，Implications for Stock Market Efficiency](https://doi.org/10.1111/j.1540-6261.1993.tb04702.x)，*The Journal of Finance* 48(1)，65至91。第 II 节、表 I 对应第 4 节的动量结果。12 个月形成、3 个月持有策略不留间隔时为月均 1.31%，留一周间隔时为 1.49%。
4. Mark M. Carhart（1997），[On Persistence in Mutual Fund Performance](https://doi.org/10.1111/j.1540-6261.1997.tb03808.x)，*The Journal of Finance* 52(1)，57至82。表 V 对应第 3 节的费用率、换手率和销售费回归。-1.54 与 -0.95 是该表系数。
5. Robert Novy-Marx（2013），[The Other Side of Value，The Gross Profitability Premium](https://doi.org/10.1016/j.jfineco.2013.01.003)，*Journal of Financial Economics* 108(1)，1至28。另见 [NBER 工作论文 15940（2010）](https://www.nber.org/papers/w15940)。对应第 1 节，论文的毛盈利能力指标是毛利润/总资产，不是通常的毛利率。
6. Eugene F. Fama、Kenneth R. French（2015），[A Five-Factor Asset Pricing Model](https://doi.org/10.1016/j.jfineco.2014.10.010)，*Journal of Financial Economics* 116(1)，1至22。CMA 定义及表 XI 对应第 2 节的投资因子与低盈利、高投资小盘股组合。
7. Warren E. Buffett，伯克希尔 [1979 年股东信](https://www.berkshirehathaway.com/letters/1979.html)、[1982 年股东信](https://www.berkshirehathaway.com/letters/1982.html)、[1983 年股东信](https://www.berkshirehathaway.com/letters/1983.html)、[2014 年股东信](https://www.berkshirehathaway.com/letters/2014ltr.pdf)。分别对应好生意与便宜生意、用低估股票支付收购价的代价、换手成本算例，以及 LTV 的资本配置反例。
