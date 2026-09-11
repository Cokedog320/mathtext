# mathtext ponytail 审计交接文档

> 原文件 `/tmp/mathtext-ponytail-audit-handoff.md` 已被系统清理，本文档由会话历史恢复（2026-09-10）。

全仓审查完毕（5056 行源码全读）。按「能砍多少」从大到小排：

## 审计结果

1. `shrink:` 三套选题器共用同一套平衡机器（starts/results/seconds/thirds 五张 Map、increment、compareScores、cap 检查、score 贪心循环各写一遍）。合并成一个可参数化的选择器。`selectChainedCandidates` 里 L265-296 预计算的 11 个值，三条路径里两条用不到（各自重算），应下移到唯一用它的循环前。`src/utils/generator/chainedArithmetic.ts`（427 行 → ~300）

2. `yagni:` `RENDER_REGISTRY` 16 个条目，组件其实只按题型分 5 类（bond/method/vertical/horizontal/chain/fill），布局只按模式家族分。为绕开类型还造了个「全可选属性的上帝 props 接口」+ 每处 `as any`。换成 5 行家族映射 + 一个布局函数。`src/components/Worksheet.tsx:57-152`（~-75 行）

3. `delete:` `buildChainedCandidates` 的蓄水池采样：`1-10` 时 retention=∞ 等于全保留；其他区间每组留 5 个——但后面的选择器本来就有逐组 cap，蓄水池是早期设计的残留。直接 push 全部候选。`src/utils/generator/chainedArithmetic.ts:41-77`（~-15 行）

4. `shrink:` `generateExtendedVerticalArithmetic` 与主函数重复同一骨架（desiredOperator 推导、filter 逐级回退、末尾 map）。抽公共骨架。`src/utils/generator/verticalArithmetic.ts:20-88 vs 90-226`（~-30 行）

5. `shrink:` `generateHorizontalFillProblems` 三个分支只差运算符，`ops = mode.endsWith('add') ? ['+'] : ...` 一个循环收掉。`src/utils/generator/horizontalFill.ts:44-92`（~-20 行）

6. `yagni:` `FillGenerationResult.availableCount/truncated` 只有测试在用，生产路径取 `.problems` 后全丢弃（App 自己用 `getRequestedProblemCount` 对比算 limit）。返回 `Problem[]`，测试从长度推导。`src/utils/generator/horizontalFill.ts:7-13`（~-10 行，需同步改测试）

7. `shrink:` `NumberBond` large/small 两分支结构完全同构，只差尺寸数字。参数化（尺寸/字号/线宽）一份模板。`src/components/ProblemRenderers.tsx:4-57`（~-20 行）

8. `delete:` `pdfFileNames` 与 `translations.printTitles` 16 个键里 13 个中文值完全相同（仅 3 个 fill 模式带括号差异）。文件名 = printTitles + '.pdf'，只给 3 个例外留覆盖。`src/types.ts:26-59`（~-20 行）

9. `delete:` `makeTenLeftOptions` 是恒等映射——键 '9' 映射值 '9'。只有 `mixed` 需要翻译。删对象，Sidebar 直接 `['mixed','9','8','7','6','5'].map(...)`。`src/types.ts:113-120, 200-207` + `src/components/Sidebar.tsx:246-251`（~-12 行）

10. `shrink:` `hideTen` 复选框在 make-ten 和 break/flat-ten 两处整块重复（还造成重复 id）。合并为一个条件块，select 仅 make-ten 显示。`src/components/Sidebar.tsx:255-279`（~-10 行）

11. `delete:` `rangeMap` 可从区间字符串推导：`r.split('-')[1] + '以内'` / `'Within ' + n`——Sidebar 的区间按钮已经在用这个技巧。`src/utils/generator/printTitle.ts:7-15`（~-9 行）

12. `shrink:` App 里 number-bonds 的 PDF 文件名三元链与 Worksheet 的标题三元链是同一段逻辑的两份拷贝。抽一个 `getBondWorksheetName()` 两边共用。`src/App.tsx:119-125` vs `src/components/Worksheet.tsx:186-192`（~-8 行）

13. `delete:` `numberBonds.ts`：`typeof targetNumber !== 'number'` 守卫是死代码（`'mixed'` 分支已 return，走到这里的必是 number）；`bondNumber === 'mixed' && !isBlankTemplate` 的 `!isBlankTemplate` 同理冗余。`src/utils/generator/numberBonds.ts:33, 52-54`（~-3 行）

14. `delete:` `window.addEventListener('resize')` 与 ResizeObserver 重复——容器宽度变了 Observer 自己会触发。`src/components/Worksheet.tsx:26`（~-3 行）

15. `delete:` App 顶部两个 re-export（`generateProblems`、`Problem`）无人从 App 导入，测试都直接走 `problemGenerator`。`src/App.tsx:11-12`（~-2 行）

16. `delete:` `translations.mode`（'题型'/'Mode'）无引用，用的是 `t.modes`。`src/types.ts:69, 155`（~-2 行）

17. `delete:` `MethodDiagram` 的 `index` prop 声明了从不解构使用；`getLayoutClass` 里 `isBlankTemplate ? 10 : bondNumber` 的三元是死分支（该分支 isBlankTemplate 必为 false）。`src/components/ProblemRenderers.tsx:168`、`src/components/Worksheet.tsx:74`（~-2 行）

18. `delete:` `vite` 同时出现在 dependencies 和 devDependencies；`@vitejs/plugin-react`、`@tailwindcss/vite` 是构建期插件，应只在 devDependencies。`package.json`（-1 行，归类修正）

19. `native:` `lucide-react` 只为 6 个图标。内联 SVG 各 1 行，-1 依赖。（可选——已装且 tree-shake 后很小）

20. `yagni:` `printTitle.ts:57-59` 那个 `horizontal-add × 1-100 × none` 的两行标题特例，16 模式 × 7 区间 × 3 进位里只命中一格。若非某次明确需求，删。（docs/ 里有对应 plan 的话就留）

## 处置结论（2026-09-10 作业时确认）

- 条 20 **保留**：来自 `0ddc64f fix: prevent worksheet title overflow` + `fd83c8a fix: scope concise worksheet title` 两个明确修复提交，有 3 个测试覆盖（`uses a concise two-line English title for addition without regrouping`）。
- 条 19 **保留**：审计标注可选，图标已是打包依赖，改内联 SVG 属 UI 改动，收益小风险大。
- 其余 1–18 条按文档执行。

**没砍的**：测试文件（ponytail 下限，不是赘肉）、`regroup.ts`/`worksheetRules.ts`/`balanceCandidates.ts`（干净）、字体依赖（打印/PDF 一致性需要）、jsPDF+html-to-image（下载 PDF 是真需求，且这就是最懒路径）。

```
net: -~320 行, -1 依赖可减。
```

最肥的是 `chainedArithmetic.ts`（427 行，占源码 8.4%）——三套选择器合并一项就占总削减量的三分之一。

## 验证命令

- `npm test`（= `vitest run`）
- `npm run lint`（= `tsc --noEmit`）

## 建议执行顺序

同文件合并处理，减少验证次数：chainedArithmetic（1+3）→ Worksheet（2+14+17）→ verticalArithmetic（4）→ horizontalFill+index（5+6）→ ProblemRenderers（7）→ types/Sidebar（8+9+10+16）→ printTitle（11）→ App（12+15）→ numberBonds（13）→ package.json（18）。