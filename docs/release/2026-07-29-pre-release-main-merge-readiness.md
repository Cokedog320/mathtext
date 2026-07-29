# Pre-release 合并 Main 就绪度

- 日期：2026-07-29
- 待合并分支：`pre-release`
- 目标分支：`main`
- 对照开发分支：`dev`
- 核验代码提交：`5ea95d1`
- 当前结论：**已达到功能性合并线，可以合并 `main`；仓库整理仍有非阻塞收尾项。**

## 1. 合并结论

`pre-release` 可以快进合并到当前 `main`：

- `main` 是 `pre-release` 的祖先；包含本文档提交后，`pre-release` 相对 `main` 领先 82 个提交、没有落后提交。
- `dev` 是 `pre-release` 的祖先；包含本文档提交后，`pre-release` 相对 `dev` 领先 6 个提交、没有落后提交。
- 本地 `main` 与远端 `origin/main` 一致。
- 工作区干净，没有未提交改动。
- 未发现合并冲突。

因此，从 Git 历史、功能实现和自动化门禁来看，当前分支已经满足合并 `main` 的最低要求。

## 2. 已通过的合并门禁

| 门禁 | 结果 |
| --- | --- |
| 单元测试 | 12 个测试文件、238 个测试全部通过 |
| TypeScript | `tsc --noEmit` 通过 |
| 生产构建 | Vite 构建通过 |
| 依赖锁文件 | `npm ci --dry-run --ignore-scripts` 通过 |
| 工作区状态 | 干净 |
| Git 合并关系 | 可快进，无冲突 |

生产构建仅有一个非阻塞警告：主 JavaScript chunk 约为 666 KB，超过 Vite 默认的 500 KB 提示线。它不会阻止部署，可以在后续性能优化中处理。

## 3. 凑十法坐标决定

当前 `MethodDiagram` 使用以下凑十法连接位置：

- 右分成框下行至 `y=116`
- 辅助数字 `10` 从右侧中点 `x=72, y=116` 接入
- 加号位于 `x=96, y=112`
- 汇合线从 `y=116` 上接答案框

仓库旧设计文档此前记录了 `y=130`、加号 `(89,122)` 的坐标，但这些坐标已与当前实现不一致。当前实现以 `src/components/ProblemRenderers.tsx` 里的实际 SVG 坐标和人工确认结果为准，不作为合并缺陷。

现有组件测试已经锁定当前有效坐标。已同步更新
`docs/superpowers/specs/2026-07-05-make-ten-styling-design.md` 与
`docs/superpowers/plans/2026-07-05-make-ten-styling-fix.md`，避免旧设计稿再次被误认为当前规范。

## 4. 相对 Dev 的整理成果

在本文档提交之前，`pre-release` 相对 `dev` 的 5 个追加代码与整理提交已经完成主要发布整理：

- 删除本地 Agent skills、skill lock 和 Copilot 指令等开发辅助资产。
- 删除 `.scratch/diff.patch`、`scratch.ts` 等临时文件。
- 删除已误提交的 Playwright 运行产物，并将 `test-results/` 加入 `.gitignore`。
- 删除未使用的 `dotenv` 依赖和 `.env.example`。
- 补充连续算式 ADR。
- 修正横式算式在格子中的溢出和不同练习区间的字号。
- 将连续算式题量统一到普通横式题量规则。
- 增加相应生成器与组件回归测试。

从功能和发布产物角度，主要整理工作已经完成。

## 5. 非阻塞收尾项

以下事项不影响当前版本运行、测试或构建，可以合并后处理；若希望
`main` 在合并时即保持完全整洁，也可以先补一个小型 cleanup 提交：

1. 删除仓库根目录中被追踪的零字节 `.codex` 文件。
2. `.env.example` 已删除，移除 `.gitignore` 中残留的 `!.env.example`。
3. 删除 `App.tsx` 中已不可达的 `range === '20-regroup'` 分支。
4. 更新水平填空 ADR 中的 `html2canvas` 描述；当前实际 PDF 实现是
   `html-to-image`，这是为兼容 Tailwind v4 颜色格式而做的有意迁移。
5. 复核并移除未被源码使用的 `express`、`@types/express` 和
   `@playwright/test`；若保留 Playwright，应补回正式的 E2E 测试和脚本。
6. 后续按需拆分生产 bundle，处理约 666 KB 的 chunk 警告。

## 6. 尚未自动化覆盖的风险

仓库当前没有 CI workflow，也没有被追踪的浏览器 E2E 测试。自动测试覆盖了生成规则和组件静态输出，但没有完整覆盖：

- 浏览器中的 A4 实际视觉布局
- 系统打印预览
- `html-to-image` 到 jsPDF 的真实下载流程

本次尝试运行 Playwright 冒烟检查时，执行环境缺少 Chromium 所需的
`libnspr4.so`，浏览器无法启动。这是检查环境依赖问题，不是应用测试失败。

在正式发布或部署前，建议人工执行一次打印和 PDF 下载冒烟检查。

## 7. 最终判定

### 合并 Main

**GO，可以合并。**

理由：Git 关系干净，核心功能完成，自动测试、类型检查和生产构建全部通过，凑十法当前坐标已确认是有效布局。

### 整理完成度

**主要整理已完成，但不是 100% 完成。**

剩余事项属于仓库卫生、文档同步、无用依赖和自动化覆盖补强，不构成当前合并阻塞。若目标是一次性产出完全整洁的 `main`，应先完成第 5 节的前五项；若目标是合入已验证功能并继续迭代，当前状态已经足够。
