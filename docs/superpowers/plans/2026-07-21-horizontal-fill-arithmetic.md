# Horizontal Fill-in-the-Blank Arithmetic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement "Horizontal Fill-in-the-Blank Arithmetic" (横排算式填空) in `mathtext`, supporting `horizontal-fill-add`, `horizontal-fill-sub`, and `horizontal-fill-mixed` modes with strict Candidate Pool generation and CSS-drawn square box (`□`) UI.

**Architecture:** 
- `types.ts`: Define `HorizontalFillProblem` & new `Mode` variants (`horizontal-fill-add`, `horizontal-fill-sub`, `horizontal-fill-mixed`).
- `fillCandidates.ts` & `horizontalFill.ts`: Generate candidate pools for addition & subtraction without zero operands/results, filter by practice band and regrouping rules, duplicate each valid equation into `blankPosition` 1 & 2, shuffle, and sample without fallback or repetition.
- `HorizontalFillArithmetic.tsx` & `ProblemRenderers.tsx`: Render fill problems using CSS-styled square boxes aligned to text baseline, maintaining A4 print/PDF grid layout.
- `Sidebar.tsx`, `Worksheet.tsx`, `App.tsx`: Enable mode selection, display range & regroup options, and show non-blocking truncation notices when candidate pool is exhausted.

**Tech Stack:** React 18, TypeScript, Vitest, CSS, jsPDF / html-to-image.

## Global Constraints

- Mode names: `'horizontal-fill-add'`, `'horizontal-fill-sub'`, `'horizontal-fill-mixed'`
- Data structure: `HorizontalFillProblem` with `type: 'horizontal-fill'`, `num1`, `num2`, `result`, `operator: '+' | '-'`, `blankPosition: 1 | 2`
- Positive integers only: `num1 >= 1`, `num2 >= 1`, `result >= 1` (no zero anywhere, no exceptions for 10-以内)
- Exclude degenerate problems (e.g. `x + 0 = x`, `x - 0 = x`, `x - x = 0`)
- Unique key: `${num1}-${operator}-${num2}-${blankPosition}`
- Candidate pool generation strategy: NO fallback, NO duplicates when candidate pool is smaller than requested count
- Square box UI: CSS border box, baseline aligned, pixel-accurate across screen, print, canvas, and PDF
- Preserving existing functionality: all existing vertical, horizontal, method, and bond tests must remain 100% passing

---

### Task 1: Type Definitions & Domain Documentation

**Files:**
- Create: `docs/adr/0001-horizontal-fill-problems.md`
- Modify: `src/types.ts`
- Modify: `CONTEXT.md`

**Interfaces:**
- Consumes: Existing `Mode`, `Problem`, `pdfFileNames`, `translations` structures
- Produces: `HorizontalFillProblem`, extended `Mode`, translation dictionary entries

- [ ] **Step 1: Update CONTEXT.md with domain terms**

Add `算式填空` and `填空位置` definitions to `CONTEXT.md`.

- [ ] **Step 2: Create ADR 0001 for Horizontal Fill Architecture**

Create `docs/adr/0001-horizontal-fill-problems.md` documenting the decision to use a strict candidate pool without fallback, random `blankPosition` assignment (1 or 2), positive integer constraints ($\ge 1$), and CSS square box rendering.

- [ ] **Step 3: Update `src/types.ts`**

Add `'horizontal-fill-add' | 'horizontal-fill-sub' | 'horizontal-fill-mixed'` to `Mode`.
Define `HorizontalFillProblem`:
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
Add `HorizontalFillProblem` to `Problem` union type.
Add translation keys and `pdfFileNames` for all three modes.

- [ ] **Step 4: Verify type checking**

Run: `npx tsc --noEmit`
Expected: PASS (or only existing missing mode warnings in generator/UI to be fixed in next tasks)

- [ ] **Step 5: Commit Task 1**

```bash
git add CONTEXT.md docs/adr/0001-horizontal-fill-problems.md src/types.ts
git commit -m "feat(types): add HorizontalFillProblem data structure and modes"
```

---

### Task 2: Candidate Pool & Problem Generator Implementation (TDD)

**Files:**
- Create: `src/utils/generator/fillCandidates.ts`
- Create: `src/utils/generator/horizontalFill.ts`
- Modify: `src/utils/generator/index.ts`
- Modify: `src/utils/generator/printTitle.ts`
- Create: `src/utils/problemGenerator.fill.test.ts`

**Interfaces:**
- Consumes: `Range`, `RegroupOption`, `PRACTICE_BANDS`, `additionRequiresRegroup`, `subtractionRequiresRegroup`
- Produces: `buildFillCandidates()`, `generateHorizontalFillProblems()`, `FillGenerationResult`

- [ ] **Step 1: Write failing unit tests in `src/utils/problemGenerator.fill.test.ts`**

Write tests for:
1. `horizontal-fill-add`, `horizontal-fill-sub`, `horizontal-fill-mixed` generation.
2. All `num1`, `num2`, `result` $\ge 1$ (no zeros).
3. Range compliance (Addition `result` within band, Subtraction `num1` within band).
4. Regrouping compliance (`none` vs `only`).
5. `blankPosition` values are only `1` or `2`, and both positions appear.
6. Unique keys `${num1}-${operator}-${num2}-${blankPosition}` without duplication.
7. Mixed mode加减划分（甚至平分或差1，候选不足用另一种补足不重复）。
8. Candidate insufficiency handling (truncation without fallback or duplication).

- [ ] **Step 2: Run tests to confirm they fail**

Run: `npx vitest run src/utils/problemGenerator.fill.test.ts`
Expected: FAIL (modules not found / function not implemented)

- [ ] **Step 3: Implement `fillCandidates.ts`**

Implement `buildFillCandidates(range: Range, mode: 'add' | 'sub', regroup: RegroupOption)`:
- Addition candidates: `target` from `minTarget` to `maxTarget`. `num1` from 1 to `target - 1`. `num2 = target - num1`. `result = target`. Check regrouping. Generate 2 entries: `blankPosition = 1` and `blankPosition = 2`.
- Subtraction candidates: `num1` from `minTarget` to `maxTarget`. `num2` from 1 to `num1 - 1`. `result = num1 - num2`. Check regrouping. Generate 2 entries: `blankPosition = 1` and `blankPosition = 2`.
- Key format: `${num1}-${operator}-${num2}-${blankPosition}`.

- [ ] **Step 4: Implement `horizontalFill.ts`**

Implement `generateHorizontalFillProblems(...)` and `FillGenerationResult`:
```ts
export type FillGenerationResult = {
  problems: HorizontalFillProblem[];
  requestedCount: number;
  availableCount: number;
  truncated: boolean;
};
```
Support `horizontal-fill-add`, `horizontal-fill-sub`, `horizontal-fill-mixed`.
For `mixed`, build addition candidates and subtraction candidates separately, sample $\lceil N/2 \rceil$ and $\lfloor N/2 \rfloor$, fill deficit from other candidate set if needed without duplicate keys, and shuffle.

- [ ] **Step 5: Integrate into `src/utils/generator/index.ts` & `printTitle.ts`**

Update `generateProblems`, `getRequestedProblemCount`, and `getPrintTitle` to handle the 3 fill modes.

- [ ] **Step 6: Run tests to verify all tests pass**

Run: `npx vitest run`
Expected: PASS (all 10 test files + new fill test file pass)

- [ ] **Step 7: Commit Task 2**

```bash
git add src/utils/generator/ src/utils/problemGenerator.fill.test.ts
git commit -m "feat(generator): add fillCandidates and generateHorizontalFillProblems with candidate pool strategy"
```

---

### Task 3: UI Component, Worksheet, Sidebar & Styling

**Files:**
- Create: `src/components/HorizontalFillArithmetic.tsx`
- Modify: `src/components/ProblemRenderers.tsx`
- Modify: `src/components/Worksheet.tsx`
- Modify: `src/components/Sidebar.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`
- Modify: `src/components/ProblemRenderers.test.tsx`
- Modify: `src/components/Sidebar.test.tsx`
- Modify: `src/components/Worksheet.test.tsx`

**Interfaces:**
- Consumes: `HorizontalFillProblem`, `Mode`, `generationLimit`
- Produces: CSS-styled `<HorizontalFillArithmetic problem={p} />`, updated `Sidebar` and `Worksheet` renderers

- [ ] **Step 1: Add CSS square box styling in `src/index.css`**

Add CSS classes for `.fill-box`:
```css
.fill-box {
  display: inline-block;
  width: 1.6em;
  height: 1.6em;
  border: 1.5px solid #1e293b;
  border-radius: 4px;
  vertical-align: -0.3em;
  margin: 0 0.15em;
  background-color: #ffffff;
  box-sizing: border-box;
}
```

- [ ] **Step 2: Implement `src/components/HorizontalFillArithmetic.tsx`**

Render equation based on `blankPosition`:
- `blankPosition === 1`: `<span className="fill-box" /> {operator} {num2} = {result}`
- `blankPosition === 2`: `{num1} {operator} <span className="fill-box" /> = {result}`

- [ ] **Step 3: Update `ProblemRenderers.tsx` & `Worksheet.tsx`**

Add case for `type === 'horizontal-fill'` in `ProblemRenderers.tsx`.
Ensure grid layout in `Worksheet.tsx` handles 30 horizontal fill problems cleanly per page matching horizontal arithmetic grid layout.

- [ ] **Step 4: Update `Sidebar.tsx` & `App.tsx`**

Add `横排填空` category in `Sidebar` with options for `horizontal-fill-add`, `horizontal-fill-sub`, `horizontal-fill-mixed`.
Ensure `range` and `regroup` options are visible when fill modes are active.
Ensure non-blocking truncation notice appears when `generationLimit` is set.

- [ ] **Step 5: Run UI component tests and full Vitest suite**

Run: `npm test`
Expected: PASS (all tests pass)

- [ ] **Step 6: Commit Task 3**

```bash
git add src/components/ src/App.tsx src/index.css
git commit -m "feat(ui): render horizontal fill arithmetic with CSS square box and integrate into Sidebar & Worksheet"
```

---

### Task 7: Verification & Final Audit

**Files:**
- All touched files

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: All tests pass cleanly

- [ ] **Step 2: Run typecheck and production build**

Run: `npx tsc --noEmit && npm run build`
Expected: Build succeeds with 0 errors

- [ ] **Step 3: Commit Task 4**

```bash
git commit --allow-empty -m "chore: verify horizontal fill arithmetic feature completion"
```
