# Horizontal Arithmetic & Complete Test Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add horizontal addition, subtraction, and mixed arithmetic modes (20 problems, 4-column layout) and complete unit tests for all modes (including horizontal arithmetic, break-ten, flat-ten, and number-bonds).

**Architecture:** Extend the `Mode` type in `src/App.tsx` and integrate the horizontal modes into the existing arithmetic generator of `generateProblems()`. Create a new `HorizontalArithmetic` React component. Update the UI's mode dropdown and grid rendering. Finally, implement and run comprehensive tests in `src/App.test.ts` for all modes.

**Tech Stack:** React 19, Vite, Tailwind CSS, Vitest 4.

## Global Constraints

* Maintain documentation integrity. Preserve all existing comments and docstrings.
* All component files should be formatted cleanly.
* Clickable file links must be used to refer to any codebase files.

---

### Task 1: Mode Type and Problem Generation Logic

**Files:**
* Modify: [src/App.tsx](file:///mnt/c/Users/qiuye/Desktop/mathtext/src/App.tsx)
* Test: [src/App.test.ts](file:///mnt/c/Users/qiuye/Desktop/mathtext/src/App.test.ts)

**Interfaces:**
* Consumes: Existing types in [src/App.tsx](file:///mnt/c/Users/qiuye/Desktop/mathtext/src/App.tsx)
* Produces: Updated `Mode` type supporting `horizontal-add` | `horizontal-sub` | `horizontal-mixed`, updated `generateProblems` supporting these modes returning 20 arithmetic problems.

- [ ] **Step 1: Add failing test for horizontal modes**

  Modify [src/App.test.ts](file:///mnt/c/Users/qiuye/Desktop/mathtext/src/App.test.ts) to add:
  ```typescript
  describe('generateProblems - Horizontal Arithmetic', () => {
    it('should generate 20 problems in horizontal-add mode', () => {
      // @ts-expect-error - testing before type definition update
      const problems = generateProblems('11-20', 'horizontal-add');
      expect(problems.length).toBe(20);
      expect(problems.every(p => p.type === 'arithmetic' && p.operator === '+')).toBe(true);
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**

  Run: `npx vitest run`
  Expected: Compile error or failing test (since `horizontal-add` isn't fully supported/mapped to arithmetic and will default to generating 25 problems).

- [ ] **Step 3: Update Mode type and generateProblems logic**

  In [src/App.tsx](file:///mnt/c/Users/qiuye/Desktop/mathtext/src/App.tsx):
  1. Add `'horizontal-add' | 'horizontal-sub' | 'horizontal-mixed'` to the `Mode` type.
  2. In `generateProblems`, integrate horizontal modes into the arithmetic branch:
  ```typescript
  const isVertical = ['vertical-add', 'vertical-sub', 'vertical-mixed'].includes(mode);
  const isHorizontal = ['horizontal-add', 'horizontal-sub', 'horizontal-mixed'].includes(mode);

  if (isVertical || isHorizontal) {
    const maxProblems = isVertical ? 25 : 20;
    let addOneCount = 0;
    let subOneCount = 0;
    
    while (problems.length < maxProblems) {
      let operator: '+' | '-' = '+';
      if (mode === 'vertical-add' || mode === 'horizontal-add') operator = '+';
      else if (mode === 'vertical-sub' || mode === 'horizontal-sub') operator = '-';
      else operator = Math.random() > 0.5 ? '+' : '-';
      
      // ... (keep the rest of vertical arithmetic generation logic exactly as is)
  ```

- [ ] **Step 4: Run test to verify it passes**

  Run: `npx vitest run`
  Expected: PASS

- [ ] **Step 5: Commit changes**

  Run:
  ```bash
  git add src/App.tsx src/App.test.ts
  git commit -m "feat: add horizontal arithmetic modes to type and problem generator"
  ```

---

### Task 2: Component & Layout Implementation

**Files:**
* Modify: [src/App.tsx](file:///mnt/c/Users/qiuye/Desktop/mathtext/src/App.tsx)

**Interfaces:**
* Consumes: `Problem` type
* Produces: `HorizontalArithmetic` component, updated option dropdown and grid layout rendering in `App` component.

- [ ] **Step 1: Define HorizontalArithmetic component**

  In [src/App.tsx](file:///mnt/c/Users/qiuye/Desktop/mathtext/src/App.tsx), add `HorizontalArithmetic` after `VerticalArithmetic`:
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

- [ ] **Step 2: Update A4 grid layout logic and rendering**

  Update columns selection and layout in [src/App.tsx](file:///mnt/c/Users/qiuye/Desktop/mathtext/src/App.tsx):
  1. Update `colClass` and `heightClass` block:
  ```typescript
  let colClass = 'w-1/5';
  let heightClass = 'h-[180px]';
  
  if (mode === 'number-bonds') {
    colClass = 'w-1/3';
    heightClass = 'h-[230px]';
  } else if (
    mode === 'make-ten' || mode === 'break-ten' || mode === 'flat-ten' ||
    mode.startsWith('horizontal-')
  ) {
    colClass = 'w-1/4';
    heightClass = 'h-[180px]';
  }
  ```
  2. Update problem component mapper inside `.map` loop:
  ```typescript
  return (
    <div key={problem.id} className={`${colClass} ${heightClass} flex justify-center items-center break-inside-avoid`}>
      {problem.type === 'bond' ? (
        <NumberBond problem={problem} />
      ) : mode.startsWith('horizontal-') ? (
        <HorizontalArithmetic problem={problem} index={idx} />
      ) : problem.type === 'arithmetic' ? (
        <VerticalArithmetic problem={problem} index={idx} />
      ) : (
        <MethodDiagram problem={problem} index={idx} hideTen={hideTen} />
      )}
    </div>
  );
  ```

- [ ] **Step 3: Update Titles and Dropdown Options**

  1. Update header H1 text mapping in the A4 sheet:
  ```typescript
  <h1 className="text-3xl font-black tracking-widest text-black uppercase">
    {mode === 'number-bonds' ? 'NUMBER BONDS' : 
      mode === 'vertical-add' ? 'VERTICAL ADDITION' :
      mode === 'vertical-sub' ? 'VERTICAL SUBTRACTION' :
      mode === 'vertical-mixed' ? 'VERTICAL ARITHMETIC' :
      mode === 'horizontal-add' ? 'HORIZONTAL ADDITION' :
      mode === 'horizontal-sub' ? 'HORIZONTAL SUBTRACTION' :
      mode === 'horizontal-mixed' ? 'HORIZONTAL ARITHMETIC' :
      mode === 'make-ten' ? 'MAKE-TEN METHOD' :
      mode === 'break-ten' ? 'BREAK-TEN METHOD' :
      'FLAT-TEN METHOD'}
  </h1>
  ```
  2. Add new options to `<select id="mode">`:
  ```html
  <option value="number-bonds">数字组合 (Number Bonds)</option>
  <option value="vertical-add">竖排加法 (Vertical Addition)</option>
  <option value="vertical-sub">竖排减法 (Vertical Subtraction)</option>
  <option value="vertical-mixed">竖排混合 (Vertical Mixed)</option>
  <option value="horizontal-add">横排加法 (Horizontal Addition)</option>
  <option value="horizontal-sub">横排减法 (Horizontal Subtraction)</option>
  <option value="horizontal-mixed">横排混合 (Horizontal Mixed)</option>
  <option value="make-ten">凑十法 (Make-Ten Method)</option>
  <option value="break-ten">破十法 (Break-Ten Method)</option>
  <option value="flat-ten">平十法 (Flat-Ten Method)</option>
  ```
  3. Update parameters display condition so range and regroup options are shown for horizontal modes:
  ```typescript
  {!['make-ten', 'break-ten', 'flat-ten'].includes(mode) && (
  ```
  and:
  ```typescript
  {['vertical-add', 'vertical-sub', 'vertical-mixed', 'horizontal-add', 'horizontal-sub', 'horizontal-mixed'].includes(mode) && (
  ```

- [ ] **Step 4: Verify rendering and styles**

  Check that types compile: `npm run lint`.
  Verify local dev server has no React runtime errors.

- [ ] **Step 5: Commit changes**

  Run:
  ```bash
  git add src/App.tsx
  git commit -m "feat: render horizontal arithmetic equations and update UI dropdown/labels"
  ```

---

### Task 3: Comprehensive Unit Tests Coverage

**Files:**
* Modify: [src/App.test.ts](file:///mnt/c/Users/qiuye/Desktop/mathtext/src/App.test.ts)

**Interfaces:**
* None (tests only)

- [ ] **Step 1: Write additional unit tests for all modes**

  Modify [src/App.test.ts](file:///mnt/c/Users/qiuye/Desktop/mathtext/src/App.test.ts) to cover:
  1. **Horizontal Arithmetic**: addition, subtraction, mixed modes with carry/borrow configurations (same assertions as vertical).
  2. **Break-Ten and Flat-Ten Methods**: Verify generated problem bounds (11-19 minus 1-9, difference in range 1-9).
  3. **Number Bonds**: Verify generated problems have `type: 'bond'`, bounds fit range parameter, and one side (left/right) is empty string.
  
  Add the following blocks to [src/App.test.ts](file:///mnt/c/Users/qiuye/Desktop/mathtext/src/App.test.ts):
  ```typescript
  describe('generateProblems - Horizontal Arithmetic Details', () => {
    it('should generate a mix of carry and no-carry addition problems', () => {
      const problems = generateProblems('11-20', 'horizontal-add');
      const arithmetic = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '+');
      expect(arithmetic.length).toBe(20);
      const hasCarry = arithmetic.some(p => (p.num1 % 10) + (p.num2 % 10) > 9);
      const hasNoCarry = arithmetic.some(p => (p.num1 % 10) + (p.num2 % 10) <= 9);
      expect(hasCarry).toBe(true);
      expect(hasNoCarry).toBe(true);
    });

    it('should generate mixed carry/borrow in horizontal-mixed mode', () => {
      const problems = generateProblems('11-20', 'horizontal-mixed');
      const arithmetic = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');
      expect(arithmetic.length).toBe(20);
      const hasCarry = arithmetic.some(p => p.operator === '+' && (p.num1 % 10) + (p.num2 % 10) > 9);
      const hasBorrow = arithmetic.some(p => p.operator === '-' && (p.num1 % 10) < (p.num2 % 10));
      expect(hasCarry).toBe(true);
      expect(hasBorrow).toBe(true);
    });

    it('should respect regroup settings in horizontal mode', () => {
      const problems = generateProblems('11-20', 'horizontal-add', 'none');
      const arithmetic = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '+');
      expect(arithmetic.every(p => (p.num1 % 10) + (p.num2 % 10) <= 9)).toBe(true);
    });
  });

  describe('generateProblems - Break-Ten and Flat-Ten Methods', () => {
    it('should generate problems satisfying break-ten properties', () => {
      const problems = generateProblems('11-20', 'break-ten');
      expect(problems.length).toBe(20);
      expect(problems.every(p => {
        if (p.type !== 'method') return false;
        return p.num1 >= 11 && p.num1 <= 19 && p.num2 >= 1 && p.num2 <= 9 && (p.num1 - p.num2) < 10 && (p.num1 - p.num2) > 0;
      })).toBe(true);
    });

    it('should generate problems satisfying flat-ten properties', () => {
      const problems = generateProblems('11-20', 'flat-ten');
      expect(problems.length).toBe(20);
      expect(problems.every(p => {
        if (p.type !== 'method') return false;
        return p.num1 >= 11 && p.num1 <= 19 && p.num2 >= 1 && p.num2 <= 9 && (p.num1 - p.num2) < 10 && (p.num1 - p.num2) > 0;
      })).toBe(true);
    });
  });

  describe('generateProblems - Number Bonds', () => {
    it('should generate 12 number bond problems within selected range bounds', () => {
      const problems = generateProblems('11-20', 'number-bonds');
      expect(problems.length).toBe(12);
      expect(problems.every(p => {
        if (p.type !== 'bond') return false;
        const validTop = p.top >= 11 && p.top <= 20;
        const oneSideMissing = (p.left === '' && typeof p.right === 'number') || (p.right === '' && typeof p.left === 'number');
        return validTop && oneSideMissing;
      })).toBe(true);
    });
  });
  ```

- [ ] **Step 2: Run test to verify it passes**

  Run: `npx vitest run`
  Expected: All tests (existing + new) pass successfully.

- [ ] **Step 3: Commit changes**

  Run:
  ```bash
  git add src/App.test.ts
  git commit -m "test: complete unit test coverage for horizontal arithmetic, number bonds, break-ten, and flat-ten"
  ```
