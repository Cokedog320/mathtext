# MathText

一个用于生成小学数学练习题的小工具，支持数字组合、竖式/横式加减、凑十/破十/平十法等多种题型，可一键打印或导出 PDF。

A small tool for generating elementary math practice worksheets. It supports number bonds, vertical/horizontal addition & subtraction, make-ten / break-ten / flat-ten methods, and can print or export PDFs with one click.

## 功能特性 / Features

- **多种题型 / Multiple problem types**
  - 数字组合 / Number bonds
  - 竖式加法、竖式减法、竖式混合 / Vertical addition, subtraction, mixed
  - 横式加法、横式减法、横式混合 / Horizontal addition, subtraction, mixed
  - 连续加法、连续减法、连续加减混合 / Chained addition, subtraction, mixed
  - 凑十法、破十法、平十法 / Make-ten, break-ten, flat-ten methods
- **练习区间 / Practice bands**：10以内（2–10）、20以内（11–20）、30以内（21–30）、50以内（31–50）、100以内（51–100）
- **进退位控制 / Regrouping control**：混合、无进/退位、仅进/退位
- **打印与导出 / Print & export**：打印预览、直接打印、下载 PDF
- **中英双语界面 / Bilingual UI**：中文与英文一键切换
- **响应式布局 / Responsive layout**：桌面与移动端均可使用

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

```
mathtext/
├── src/              # 前端源码 / Frontend source
│   ├── App.tsx       # 主要组件与题目生成逻辑 / Main component & problem generator
│   ├── App.test.ts   # 单元测试 / Unit tests
│   ├── main.tsx      # 应用入口 / App entry
│   └── index.css     # 全局样式 / Global styles
├── docs/             # 设计文档与决策记录 / Design docs & ADRs
├── index.html        # HTML 入口 / HTML entry
├── package.json      # 依赖与脚本 / Dependencies & scripts
├── tsconfig.json     # TypeScript 配置 / TypeScript config
├── vite.config.ts    # Vite 配置 / Vite config
└── screenshot.png    # 项目截图 / Project screenshot
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

这是一个出于个人兴趣、结合 AI 辅助开发做出来的练手项目，主要用于学习、实验和功能验证。代码和结构会随需求持续迭代，不保证按标准开源产品的形式维护。

This is a personal practice project built out of interest, with AI used as a development helper. It is mainly used for learning, experiments, and feature validation. The code and structure will keep evolving, and it is not maintained as a polished open-source product.
