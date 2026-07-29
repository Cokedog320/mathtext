# MathText

Live demo: https://mathtext.pages.dev/

一个面向小学数学练习题生成的工作流工具。当前版本已经能生成一批基础练习题并支持打印/导出 PDF，但它仍然是一个“正在持续完善”的项目，而不是一个完整的数学题库产品。

English version: [README.en.md](README.en.md)

## 当前状态 / Current Status

### 已实现 / Implemented

- 数字组合 / Number bonds
- 竖式与横式加减 / Vertical and horizontal addition/subtraction
- 连续算式 / Chained arithmetic
- 横式填空题 / Horizontal fill-in-the-blank equations
- 凑十法、破十法、平十法 / Make-ten, break-ten, flat-ten methods
- 练习区间覆盖 10、20、30、50、100 以内 / Practice ranges up to 10, 20, 30, 50, and 100
- 打印预览、直接打印、PDF 导出 / Print preview, direct print, and PDF export
- 中英双语界面 / Bilingual Chinese/English UI

### 下一步 / Next

当前还没有完成更高级的题型扩展，下一阶段重点会补齐：

- 1000 以内的加减法 / Addition and subtraction within 1000
- 乘除法 / Multiplication and division
- 括号表达式 / Parentheses expressions
- 更完整的题型组合与难度控制 / Broader exercise combinations and difficulty controls

## 快速开始 / Quick Start

```bash
# 克隆仓库 / Clone the repo
git clone https://github.com/Cokedog320/mathtext.git
cd mathtext

# 安装依赖 / Install dependencies
npm install

# 启动开发服务器 / Start dev server
npm run dev

# 构建生产版本 / Build for production
npm run build
```

开发服务器默认运行在 `http://localhost:3000`。
The dev server runs at `http://localhost:3000` by default.

## 技术栈 / Tech Stack

- [React 19](https://react.dev/)
- [Vite 6](https://vitejs.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [html-to-image](https://github.com/bubkoo/html-to-image) + [jsPDF](https://github.com/parallax/jsPDF) 用于 PDF 导出

## 项目结构 / Project Structure

```text
mathtext/
├── src/                    # 前端源码 / Frontend source
│   ├── components/         # 界面与习题渲染 / UI and problem renderers
│   ├── utils/generator/   # 题目生成规则 / Generation rules
│   ├── *.test.ts           # 单元测试 / Unit tests
│   ├── App.tsx             # 应用状态与编排 / App state and orchestration
│   └── main.tsx            # 应用入口 / App entry
├── CONTEXT.md              # 项目术语与规则 / Project vocabulary and rules
├── index.html              # HTML 入口 / HTML entry
├── package.json            # 依赖与脚本 / Dependencies & scripts
├── tsconfig.json           # TypeScript 配置 / TypeScript config
├── vite.config.ts         # Vite 配置 / Vite config
└── screenshot.png          # 项目截图 / Project screenshot
```

## 可用脚本 / Available Scripts

| 脚本 / Script | 说明 / Description |
| --- | --- |
| `npm run dev` | 启动开发服务器 / Start dev server |
| `npm run build` | 构建生产版本 / Build for production |
| `npm run preview` | 预览生产构建 / Preview production build |
| `npm run lint` | 运行 TypeScript 类型检查 / Run TypeScript type check |
| `npm run test` | 运行单元测试 / Run unit tests |
| `npm run clean` | 清理构建产物 / Clean build output |

## 说明 / Notes

这是一个基于个人兴趣、并结合 AI 辅助开发持续推进的练手项目。当前已经具备较完整的基础练习生成与输出流程，后续会继续把题型范围从当前的基础算术逐步扩展到更高阶的运算与表达式。

This is a personal practice project built from interest and developed with AI assistance. It already has a fairly complete base worksheet generation and output flow, and the next step is to gradually expand from current basic arithmetic into more advanced operations and expressions.
