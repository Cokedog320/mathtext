# 设计文档: 增加横排加法、减法及加减混合模式

本设计文档旨在为口算习题生成器添加“横排加法”、“横排减法”和“横排混合”三种新题型。

---

## 1. 需求分析与定义

### 1.1 新增题型模式 (Modes)
* **横排加法 (`horizontal-add`)**：生成横向排列的加法算式，例如：`12 + 6 = [ ]`。
* **横排减法 (`horizontal-sub`)**：生成横向排列的减法算式，例如：`15 - 4 = [ ]`。
* **横排混合 (`horizontal-mixed`)**：生成横向排列的加减法混合算式。

### 1.2 出题逻辑 (Problem Generation)
* 核心数学逻辑与现有的竖排算式（`vertical-add`、`vertical-sub`、`vertical-mixed`）完全一致，包括：
  * 支持相同的**数值范围 (Range)** 选择：`11-20`、`21-30`、`10-50`、`10-100`。
  * 支持相同的**进退位 (Regroup)** 过滤选项：混合 (`mixed`)、无进退位 (`none`)、仅进退位 (`only`)。
  * 限制加 1 或减 1 的重复出现（不超过 1 次）。
* **题目数量限制**：横排算式每页生成 **20 道题**（相较于竖排算式的 25 道题）。

### 1.3 排版与样式 (Layout & Styling)
* **网格布局**：使用 4 列网格（`w-1/4`），每行 4 道题，共 5 行。
* **算式高度**：每个算式格高度为 `180px`（与“凑十法”等模式一致），提供充足的上下行距。
* **等号及答题框**：在算式右侧渲染 `=` 和一个边框大小为 `28px * 28px` 的空方框，用于学生手写答案。
* **大标题**：
  * 横排加法: `"HORIZONTAL ADDITION"`
  * 横排减法: `"HORIZONTAL SUBTRACTION"`
  * 横排混合: `"HORIZONTAL ARITHMETIC"`

---

## 2. 详细技术实现

### 2.1 类型定义扩展 (Types)
在 [src/App.tsx](file:///mnt/c/Users/qiuye/Desktop/mathtext/src/App.tsx) 中，扩展 `Mode` 联合类型：
```typescript
export type Mode = 
  | 'number-bonds' 
  | 'vertical-add' | 'vertical-sub' | 'vertical-mixed' 
  | 'horizontal-add' | 'horizontal-sub' | 'horizontal-mixed' // 新增横排类型
  | 'make-ten' | 'break-ten' | 'flat-ten';
```

### 2.2 出题逻辑整合 (`generateProblems`)
在 `generateProblems` 函数中重构条件分支，使横排模式复用竖排的数学题目生成逻辑：
* 合并判断：`const isVertical = ['vertical-add', 'vertical-sub', 'vertical-mixed'].includes(mode);` 和 `const isHorizontal = ['horizontal-add', 'horizontal-sub', 'horizontal-mixed'].includes(mode);`。
* 根据是否为竖排或横排，设置题目上限：
  ```typescript
  const maxProblems = isVertical ? 25 : 20;
  ```
* 所有的随机数字生成、进退位规则验证、去重逻辑完全共享。

### 2.3 渲染组件设计 (`HorizontalArithmetic`)
在 [src/App.tsx](file:///mnt/c/Users/qiuye/Desktop/mathtext/src/App.tsx) 中新增组件：
```typescript
const HorizontalArithmetic: React.FC<{ problem: any; index: number }> = ({ problem, index }) => {
  return (
    <div className="relative w-[160px] h-[60px] flex items-center justify-between px-2 border border-gray-100 rounded-sm">
      <span className="absolute top-1 left-1 text-[10px] text-gray-400 font-mono">{index + 1}.</span>
      <div className="flex items-center justify-center gap-2.5 w-full text-2xl font-normal text-black mt-2 select-none">
        <span>{problem.num1}</span>
        <span>{problem.operator}</span>
        <span>{problem.num2}</span>
        <span>=</span>
        <div className="w-[28px] h-[28px] border border-black bg-white shrink-0"></div>
      </div>
    </div>
  );
};
```

### 2.4 主页面及侧边栏适配
* **侧边栏选项**：
  * 修改 `<select id="mode">` 下拉框，加入 3 个横排模式的 `<option>`：
    ```html
    <option value="horizontal-add">横排加法 (Horizontal Addition)</option>
    <option value="horizontal-sub">横排减法 (Horizontal Subtraction)</option>
    <option value="horizontal-mixed">横排混合 (Horizontal Mixed)</option>
    ```
  * 修改难度 `range` 和进退位 `regroup` 的隐藏判断，允许横排模式下显示它们。
* **A4 预览页**：
  * 大标题展示逻辑加入横排判定。
  * 卡片布局适配（列数 `colClass` 为 `w-1/4`，`heightClass` 为 `h-[180px]`）。
  * 题目遍历逻辑中，若 `mode` 为横排模式，则使用 `<HorizontalArithmetic>` 渲染。

---

## 3. 测试计划

### 3.1 单元测试 ([src/App.test.ts](file:///mnt/c/Users/qiuye/Desktop/mathtext/src/App.test.ts))
扩展单元测试以验证新的出题逻辑：
* 测试在 `horizontal-add`、`horizontal-sub`、`horizontal-mixed` 模式下均生成 20 道题目。
* 验证加法范围、减法范围以及进退位过滤（混合/无进退位/有进退位）是否正确工作。

### 3.2 手工测试
* 在浏览器中切换到各个新模式，检查大标题是否正确、题目是否恰好为 20 道并呈现 4x5 的整齐网格。
* 检查移动端预览模式以及缩放是否良好。
* 测试“直接打印”和“下载 PDF”功能，确保导出的 PDF 中没有重叠、溢出或因缩放产生的模糊截断。
