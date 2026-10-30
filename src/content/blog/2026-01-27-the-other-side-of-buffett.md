---
title: 论文解读：巴菲特的另一面
date: 2026-01-27
categories: [投资, 巴菲特, 论文解读, 杠杆与质量]
---

AQR 的论文《Buffett's Alpha》用量化方法拆解巴菲特的投资能力，核心问题有两个：

1. 他买的资产是什么样的？
2. 他用什么样的融资方式把收益放大？

## 1. 伯克希尔带杠杆

AQR 用资产/权益（total assets to equity）口径估算，认为利用了保险浮存金的伯克希尔，长期平均杠杆实质上达到了 1.7:1。

其中，[论文表 III](https://doi.org/10.2469/faj.v74.n4.3)估算的保险浮存金平均年成本约为 1.72%，比同期 T-bill（短期国债）利率低约 3 个百分点。研究者还估算，float 平均约占伯克希尔负债的 35%。

## 2. 杠杆 + 低波动

巴菲特长期偏好一篮子 safe（低 beta、更安全）、quality（高质量）和 cheap / value（便宜、价值）股票。

AQR 用两个因子来描述这种偏好：

- BAB（Betting Against Beta）：倾向于买低 beta 股票、回避高 beta 股票。
- QMJ（Quality Minus Junk）：倾向于买高质量公司，包括更盈利、更增长、更稳健、分红或回购更高之类的特征。

当研究者控制伯克希尔，尤其是其公开股票组合，对 BAB 和 QMJ 的暴露后，公开股票组合的 alpha 降至统计上不显著，年化约为 0.3%。

这意味着，巴菲特的超额收益很大一部分可以理解为：长期持有安全、高质量、估值便宜的股票，再利用杠杆放大收益。

## 3. 为什么这套策略能成立

AQR 的理论背景是，杠杆约束和保证金要求会改变风险溢价结构。当许多资金无法有效加杠杆时，它们更愿意买入高 beta 资产，以获得更高的组合预期收益。

结果是，高风险资产可能被买贵，低风险资产反而被低估。能够使用杠杆的投资者，就可以建立买入低 beta、卖出高 beta 的头寸。

真正难以复制的环节，通常是获得同等质量的融资，并承受长期波动。挑选低 beta 股票只是其中一部分。

AQR 在结尾指出，巴菲特的收益曲线也经历过艰难阶段。关键在于他能长期坚持策略，熬过那些会迫使其他投资者平仓的时期。

## 4. 参考资料

1. Andrea Frazzini、David Kabiller、Lasse Heje Pedersen（2018），[Buffett's Alpha](https://www.aqr.com/Insights/Research/Journal-Article/Buffetts-Alpha)，*Financial Analysts Journal* 74(4): 35–55，[期刊正式版](https://doi.org/10.2469/faj.v74.n4.3)。杠杆与融资部分、表 III 对应 1.7:1、浮存金成本 1.72%、低于国库券约 3 个百分点及负债中浮存金约占 35%；投资风格部分、表 IV 对应 BAB、QMJ 及公开股票组合年化 alpha 约 0.3%。结论讨论长期坚持和被迫平仓风险。
2. *Financial Analysts Journal*（2019），[Correction](https://doi.org/10.1080/0015198X.2019.1569444)，75(1): 2–3。修正原文表 I 的 Panel B 信息比率分布；不是本文所引表 III、IV 的修正。
