# 2. 保留连续算式作为横向算式题型

- **状态**：已接受 (Accepted)
- **日期**：2026-07-24

## 背景 (Context)

连续算式在模块化设计文档之后加入了实现，造成设计文档只列出竖式和普通横式加减，而产品代码已经包含 `horizontal-chain-add`、`horizontal-chain-sub` 和 `horizontal-chain-mixed` 三种题型，以及独立的 `chainedArithmetic.ts` 生成器。

## 决策 (Decision)

保留连续算式并将其视为正式的横向算式题型范围，而不是临时实验功能。它由三个操作数和两个运算符组成，按从左到右计算；过程值保持为正数且不超过练习区间上限。

连续算式的范围固定为：

- 连续加法 (`horizontal-chain-add`)
- 连续减法 (`horizontal-chain-sub`)
- 连续加减混合 (`horizontal-chain-mixed`)

连续算式的题量与普通横式加减共用 `HORIZONTAL_PROBLEM_COUNTS`：10 以内 20 题、20 以内 30 题、30 以内 50 题、50 和 100 以内各 60 题。

该范围由 `Mode`、侧栏选择、`generateChainedArithmetic`、`ChainedArithmetic` 渲染器、打印标题和对应生成器/组件测试共同维护。后续若要移除或扩展连续算式，必须同时更新这些公开入口与本 ADR。

## 后果 (Consequences)

- 连续算式随本次产品代码合并，不再视为未记录的范围扩张。
- 模块化设计文档中的旧模式清单仍是历史实施计划，但 ADR 和 `CONTEXT.md` 提供当前有效范围。
- 连续算式继续使用独立候选生成与测试，避免把三操作数规则混入普通横式算式生成器。
