# Design Spec: Sidebar Refactoring and Codebase Modularization

This document outlines the design and architecture for refactoring the left sidebar into an accordion-style category selector, modularizing the single-file codebase ([App.tsx](file:///home/cokedog/mathtext/src/App.tsx)) into clean, reusable modules, and eliminating excessive `if-else` conditionals using the Strategy and Config Registry patterns.

---

## 1. Architectural Changes & File Structure

Currently, all application code resides in a single file: `src/App.tsx`. We will decompose this into the following clean modular structure:

```
src/
├── types.ts                      # Common TypeScript definitions & translations
├── utils/
│   └── problemGenerator.ts        # Strategy-based problem generators
├── components/
│   ├── ProblemRenderers.tsx      # Problem component renderers (NumberBond, etc.)
│   ├── Sidebar.tsx               # Accordion navigation and setting inputs
│   └── Worksheet.tsx             # A4 print preview and PDF triggers
├── App.tsx                       # App orchestrator (State & high-level layout)
├── main.tsx                      # Entry point
└── index.css                     # Global styles
```

---

## 2. Refactoring Nested Conditionals (If-Else Removal)

### 2.1 Strategy Pattern for Problem Generators
We will replace the giant `if-else if` block inside `generateProblems` with a Strategy Map:

```typescript
// src/utils/problemGenerator.ts
export interface GeneratorSettings {
  range: Range;
  regroup: RegroupOption;
  makeTenLeft: string;
  bondUseType: 'practice' | 'study';
  bondNumber: number | '2-10';
  isBlankTemplate: boolean;
}

export type GeneratorFn = (settings: GeneratorSettings) => Problem[];

export const GENERATOR_STRATEGIES: Record<Mode, GeneratorFn> = {
  'number-bonds': generateNumberBonds,
  'make-ten': generateMakeTen,
  'break-ten': generateBreakTen,
  'flat-ten': generateFlatTen,
  'vertical-add': generateArithmetic,
  'vertical-sub': generateArithmetic,
  'vertical-mixed': generateArithmetic,
  'horizontal-add': generateArithmetic,
  'horizontal-sub': generateArithmetic,
  'horizontal-mixed': generateArithmetic,
};

export const generateProblems = (mode: Mode, settings: GeneratorSettings): Problem[] => {
  const strategy = GENERATOR_STRATEGIES[mode];
  return strategy ? strategy(settings) : [];
};
```

### 2.2 Config Registry for Problem Layout and Rendering
In `src/components/Worksheet.tsx`, instead of hardcoded conditional classes for column sizing, height, and matching components, we will use a configuration mapping:

```typescript
export interface ModeConfig {
  component: React.FC<{ problem: Problem; index: number; [key: string]: any }>;
  getLayoutClass: (settings: { bondNumber: number | '2-10'; isBlankTemplate: boolean }) => {
    colClass: string;
    heightClass: string;
  };
}

export const MODE_RENDER_CONFIG: Record<Mode, ModeConfig> = {
  'number-bonds': {
    component: NumberBondRenderer,
    getLayoutClass: ({ bondNumber, isBlankTemplate }) => {
      const effectiveNumber = (isBlankTemplate || bondNumber === '2-10') ? 10 : bondNumber;
      const isLarge = typeof bondNumber === 'number' && bondNumber <= 4 && !isBlankTemplate;
      return {
        colClass: effectiveNumber === 2 ? 'w-full' : effectiveNumber === 3 ? 'w-1/2' : 'w-1/3',
        heightClass: isLarge ? 'h-[320px]' : 'h-[230px]',
      };
    },
  },
  'make-ten': {
    component: MethodDiagramRenderer,
    getLayoutClass: () => ({ colClass: 'w-1/4', heightClass: 'h-[180px]' }),
  },
  // Same configuration for other modes...
};
```

---

## 3. Sidebar UI Redesign (Accordion Sub-menus)

The sidebar will expose a clean, category-based navigation tree.

### 3.1 Two Main Accordion Categories
1. **方法训练 (Method Training)**
   * 数字组合 (Number Bonds)
   * 凑十法 (Make-Ten Method)
   * 破十法 (Break-Ten Method)
   * 平十法 (Flat-Ten Method)
2. **算式练习 (Arithmetic Practice)**
   * 竖式加法 / Subtraction / Mixed
   * 横式加法 / Subtraction / Mixed

### 3.2 Accordion Interactions
* **State**: A state variable `activeCategory` ('method' | 'arithmetic') determines which section is expanded.
* **Auto-expansion**: When the page loads, `activeCategory` is set to match the current `mode`'s category.
* **Selection**: Clicking a sub-mode selects it and triggers problem generation.
* **Visuals**: Modern buttons with smooth hover animations, selection indicators, and Lucide icons (Chevrons for toggles, Dices, Settings).

### 3.3 Dynamic Settings Panel
Based on the currently selected `mode`, relevant settings inputs appear dynamically below the accordion:
* **For `number-bonds`**: Target Number selector, Study Card checkbox, Hide Bottom Parts checkbox, Blank Template checkbox.
* **For `make-ten` / `break-ten` / `flat-ten`**: Left Addend selector (only for `make-ten`), Hide Helper "10" checkbox.
* **For arithmetics**: Range selector, Regroup selector (disabled if range is "20-regroup").

---

## 4. Execution & Verification Plan

### Phase 1: File Decomposition
Create new files `src/types.ts`, `src/utils/problemGenerator.ts`, `src/components/ProblemRenderers.tsx`, `src/components/Sidebar.tsx`, and `src/components/Worksheet.tsx`, populating them with code extracted from `App.tsx`.

### Phase 2: Refactoring logic & App Integration
Rewrite `App.tsx` to orchestrate these components and import the strategy pattern. Clean up all unneeded conditionals.

### Phase 3: Verification
* Run unit tests (`npm run test` / `vitest`) to verify logic correctness.
* Build the application using `npm run build` to verify compiling/types check.
* Manually inspect the UI functionality (generating, downloading PDF).
