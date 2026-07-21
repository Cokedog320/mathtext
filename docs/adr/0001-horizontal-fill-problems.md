# 1. 横排算式填空设计与生成策略

- **状态**：已接受 (Accepted)
- **日期**：2026-07-21

## 背景 (Context)

项目需要新增“横排算式填空”题型（包括横排填空加法、横排填空减法、横排填空加减混合）。填空题旨在训练学生的逆向思维与代数雏形概念（如 `□ + 5 = 8` 或 `12 - □ = 7`）。

在设计填空题的数据模型、数值限制和生成策略时，存在以下考量：
1. 填空表达形式与手写体验：手写填空以空心方框 `□` 最佳。
2. 填空位置：不需要繁琐的界面配置项，由生成算法在第一与第二操作数之间天然随机分布。
3. 候选生成与碰撞降级（Fallback）：传统的碰撞算法在候选数不足时往往会发生死循环或退化（降级生成不合规题目），这不符合教学严谨性。

## 决策 (Decisions)

1. **独立模式定义**：
   在 `Mode` 中新增三个独立模式：`horizontal-fill-add`、`horizontal-fill-sub` 和 `horizontal-fill-mixed`。

2. **统一数据结构**：
   定义 `HorizontalFillProblem` 接口：
   ```ts
   export type HorizontalFillProblem = {
     id: number;
     type: 'horizontal-fill';
     num1: number;
     num2: number;
     result: number;
     operator: '+' | '-';
     blankPosition: 1 | 2;
   };
   ```
   真实数值完整保留在 `num1`, `num2`, `result` 中，`blankPosition` 控制渲染隐藏。

3. **严格候选池策略 (Candidate Pool Strategy)**：
   - 遍历指定练习区间内的所有合法算式。
   - 严格要求所有数值均大于等于 1（$num_1 \ge 1, num_2 \ge 1, result \ge 1$），彻底排除 0 及退化算式（如 `x + 0 = x`, `x - x = 0`）。
   - 每条算式衍生出 `blankPosition: 1` 和 `blankPosition: 2` 两条不同候选项，唯一 Key 为 `${num1}-${operator}-${num2}-${blankPosition}`。
   - 候选池清洗打乱后直接抽取。若不重复候选数量少于计划数，则直接输出全部可用题目，不启用任何 Fallback 降级逻辑，也不生成重复题，同时向前端返回截断提示信息。

4. **CSS 方框渲染**：
   前端通过 CSS 类 `.fill-box` 绘制内联空心方框，确保在屏幕预览、系统打印、html2canvas 导出以及 PDF 导出中呈现一致的像素级对齐和方框大小。

## 后果 (Consequences)

- 保证了填空题目的教学质量，无 0、无退化、无重复。
- 候选少于计划数时（如 10 以内加法候选有限）能准确提示用户，不会产生伪随机死循环或违规题目。
- 模式结构独立，未来方便扩展乘法、除法填空。
