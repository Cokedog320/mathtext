# 凑十法连线样式修正 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修正 MathText 的凑十法图示中，下方辅助数字 10 与右分成数的连线样式及加号显示，确保其正确指向最终答案框。

**Architecture:** 修改 `src/App.tsx` 中的 `MethodDiagram` 组件，专门针对 `make-ten` 类型题目下的 SVG 连线与 `+` 号文本渲染逻辑进行坐标调整，使其符合设计规格并能够精确对齐。

**Tech Stack:** React, TypeScript, SVG, TailwindCSS, Vite

## Global Constraints

- 不修改非凑十法（如破十法、平十法等）的渲染样式。
- 画线线条和文字采用黑色实线样式，保持项目内风格统一。

---

### Task 1: 修正凑十法图示连线与加号

**Files:**
- Modify: `src/App.tsx:285-295`

**Interfaces:**
- Consumes: `MethodDiagram` 中的 `method`、`hideTen` 和各个布局基础尺寸坐标。
- Produces: 正确渲染底层水平汇合线、右分成下行线、答案上行线及相加符号的 JSX 结构。

- [ ] **Step 1: 修改 SVG 连线及符号定义**

  在 `src/App.tsx` 的 `MethodDiagram` 组件中，定位至 `method === 'make-ten'` 的连接线绘制分支，替换为以下代码：

  ```tsx
        {/* Connector: routes the final computed result over to the answer box after "=" */}
        <svg className="absolute inset-0" width="180" height="160" viewBox="0 0 180 160">
          {method === 'make-ten' ? (
            <>
              {/* Vertical line from part2 box (bottom center 120, 88) down to the merge line at y=116 */}
              <line x1="120" y1="88" x2="120" y2="116" stroke="black" strokeWidth="1.5" />
              {/* Horizontal line from the 10 box right midpoint (72, 116) to the merge column at x=120 */}
              <line x1="72" y1="116" x2="120" y2="116" stroke="black" strokeWidth="1.5" />
              {/* Plus sign centered between the 10 box right midpoint and the merge line */}
              <text x="96" y="112" fontSize="20" fontWeight="normal" fill="black" textAnchor="middle">+</text>
              {/* Horizontal line from the merge column to the answer box */}
              <line x1="120" y1="116" x2="164" y2="116" stroke="black" strokeWidth="1.5" />
              {/* Vertical line from the answer-box merge point up to the answer box */}
              <line x1="164" y1="116" x2="164" y2="30" stroke="black" strokeWidth="1.5" />
            </>
          ) : method === 'break-ten' ? (
  ```

- [ ] **Step 2: 验证编译与构建**

  在项目根目录下，运行 TypeScript 类型检查以验证没有编译错误。
  Run: `npm run lint`
  Expected: 命令成功执行，无 TypeScript 错误。

- [ ] **Step 3: 启动并预览**

  启动 Vite 本地开发服务器。
  Run: `npm run dev`
  Expected: 开发服务器成功启动并监听端口（通常为 `http://localhost:3000`）。在浏览器中访问页面，切换到“凑十法”题型，确认图形显示完美。

- [ ] **Step 4: 提交代码**

  将修改的内容提交至 Git 仓库。
  Run:
  ```bash
  git add src/App.tsx
  git commit -m "feat: fix make-ten method diagram layout and connection lines"
  ```
