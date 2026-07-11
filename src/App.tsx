import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Dices, Printer, Download, Settings2 } from 'lucide-react';

export type Language = 'zh' | 'en';
export type Range = '1-10' | '11-20' | '21-30' | '10-50' | '10-100';
export type Mode = 'number-bonds' | 'vertical-add' | 'vertical-sub' | 'vertical-mixed' | 'make-ten' | 'break-ten' | 'flat-ten' | 'horizontal-add' | 'horizontal-sub' | 'horizontal-mixed';
export type RegroupOption = 'mixed' | 'none' | 'only';

export type Problem = 
  | { id: number; type: 'bond'; top: number | string; left: number | string; right: number | string; isBlank?: boolean }
  | { id: number; type: 'arithmetic'; num1: number; num2: number; operator: '+' | '-' }
  | { id: number; type: 'method'; num1: number; num2: number; operator: '+' | '-'; method: 'make-ten' | 'break-ten' | 'flat-ten' };

const pdfFileNames: Record<Language, Record<Mode, string>> = {
  zh: {
    'number-bonds': '数字组合.pdf',
    'vertical-add': '竖排加法.pdf',
    'vertical-sub': '竖排减法.pdf',
    'vertical-mixed': '竖排混合.pdf',
    'horizontal-add': '横排加法.pdf',
    'horizontal-sub': '横排减法.pdf',
    'horizontal-mixed': '横排混合.pdf',
    'make-ten': '凑十法.pdf',
    'break-ten': '破十法.pdf',
    'flat-ten': '平十法.pdf',
  },
  en: {
    'number-bonds': 'number-bonds.pdf',
    'vertical-add': 'vertical-addition.pdf',
    'vertical-sub': 'vertical-subtraction.pdf',
    'vertical-mixed': 'vertical-arithmetic.pdf',
    'horizontal-add': 'horizontal-addition.pdf',
    'horizontal-sub': 'horizontal-subtraction.pdf',
    'horizontal-mixed': 'horizontal-arithmetic.pdf',
    'make-ten': 'make-ten.pdf',
    'break-ten': 'break-ten.pdf',
    'flat-ten': 'flat-ten.pdf',
  },
};

const translations = {
  zh: {
    settings: '参数配置',
    preview: '打印预览',
    worksheetTitle: '习题定制',
    mode: '题型',
    range: '难度',
    regroup: '进退位',
    makeTenLeft: '左加数',
    hideTen: '隐藏“10”辅助数字',
    hideBondParts: '隐藏底部分解数字',
    regenerate: '重新生成题目',
    viewPreview: '查看打印预览',
    print: '直接打印',
    downloadPdf: '下载 PDF',
    mobileRegenerate: '换一批',
    mobilePrint: '打印',
    mobileDownload: '下载',
    date: '日期',
    name: '姓名',
    score: '得分',
    modes: {
      'number-bonds': '数字组合',
      'vertical-add': '竖排加法',
      'vertical-sub': '竖排减法',
      'vertical-mixed': '竖排混合',
      'horizontal-add': '横排加法',
      'horizontal-sub': '横排减法',
      'horizontal-mixed': '横排混合',
      'make-ten': '凑十法',
      'break-ten': '破十法',
      'flat-ten': '平十法',
    },
    regroupOptions: {
      mixed: '混合',
      none: '无进/退位',
      only: '进/退位',
    },
    makeTenLeftOptions: {
      mixed: '随机',
      '9': '9',
      '8': '8',
      '7': '7',
      '6': '6',
      '5': '5',
    },
    printTitles: {
      'number-bonds': '数字组合',
      'vertical-add': '竖排加法',
      'vertical-sub': '竖排减法',
      'vertical-mixed': '竖排混合',
      'horizontal-add': '横排加法',
      'horizontal-sub': '横排减法',
      'horizontal-mixed': '横排混合',
      'make-ten': '凑十法',
      'break-ten': '破十法',
      'flat-ten': '平十法',
    },
    bondNumber: '目标数字',
    bondUseTypeStudy: '学习卡片模式',
    blankTemplate: '空白模板模式',
  },
  en: {
    settings: 'Settings',
    preview: 'Preview',
    worksheetTitle: 'Worksheet Settings',
    mode: 'Mode',
    range: 'Range',
    regroup: 'Regroup',
    makeTenLeft: 'Left Addend',
    hideTen: 'Hide helper "10"',
    hideBondParts: 'Hide bottom parts',
    regenerate: 'Regenerate Problems',
    viewPreview: 'View Preview',
    print: 'Print',
    downloadPdf: 'Download PDF',
    mobileRegenerate: 'New Set',
    mobilePrint: 'Print',
    mobileDownload: 'Download',
    date: 'Date',
    name: 'Name',
    score: 'Score',
    modes: {
      'number-bonds': 'Number Bonds',
      'vertical-add': 'Vertical Addition',
      'vertical-sub': 'Vertical Subtraction',
      'vertical-mixed': 'Vertical Mixed',
      'horizontal-add': 'Horizontal Addition',
      'horizontal-sub': 'Horizontal Subtraction',
      'horizontal-mixed': 'Horizontal Mixed',
      'make-ten': 'Make-Ten Method',
      'break-ten': 'Break-Ten Method',
      'flat-ten': 'Flat-Ten Method',
    },
    regroupOptions: {
      mixed: 'Mixed',
      none: 'No Regroup',
      only: 'Regroup Only',
    },
    makeTenLeftOptions: {
      mixed: 'Mixed',
      '9': '9',
      '8': '8',
      '7': '7',
      '6': '6',
      '5': '5',
    },
    printTitles: {
      'number-bonds': 'Number Bonds',
      'vertical-add': 'Vertical Addition',
      'vertical-sub': 'Vertical Subtraction',
      'vertical-mixed': 'Vertical Arithmetic',
      'horizontal-add': 'Horizontal Addition',
      'horizontal-sub': 'Horizontal Subtraction',
      'horizontal-mixed': 'Horizontal Arithmetic',
      'make-ten': 'Make-Ten Method',
      'break-ten': 'Break-Ten Method',
      'flat-ten': 'Flat-Ten Method',
    },
    bondNumber: 'Target Number',
    bondUseTypeStudy: 'Learning Card Mode',
    blankTemplate: 'Blank Template Mode',
  },
};

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const generateProblems = (
  range: Range, 
  mode: Mode, 
  regroup: RegroupOption = 'mixed',
  makeTenLeft: string = 'mixed',
  bondUseType: 'practice' | 'study' = 'practice',
  bondNumber: number | '2-10' = 5,
  isBlankTemplate: boolean = false
): Problem[] => {
  let min = 11, max = 20;
  if (range === '1-10') { min = 1; max = 10; }
  else if (range === '21-30') { min = 21; max = 30; }
  else if (range === '10-50') { min = 10; max = 50; }
  else if (range === '10-100') { min = 10; max = 100; }

  const problems: Problem[] = [];

  if (mode === 'number-bonds') {
    if (bondNumber === '2-10' && !isBlankTemplate) {
      for (let n = 2; n <= 10; n++) {
        const k = Math.floor(Math.random() * (n - 1)) + 1;
        const leftVal = k;
        const rightVal = n - k;
        let left: number | string = leftVal;
        let right: number | string = rightVal;
        if (bondUseType === 'practice') {
          const isLeftKnown = Math.random() > 0.5;
          left = isLeftKnown ? leftVal : '';
          right = isLeftKnown ? '' : rightVal;
        }
        problems.push({ id: n - 2, type: 'bond', top: n, left, right });
      }
      return problems;
    }

    const targetNumber = (isBlankTemplate || bondNumber === '2-10') ? 10 : bondNumber;
    for (let k = 1; k < targetNumber; k++) {
      const leftVal = k;
      const rightVal = targetNumber - k;
      let left: number | string = leftVal;
      let right: number | string = rightVal;
      if (bondUseType === 'practice') {
        const isLeftKnown = Math.random() > 0.5;
        left = isLeftKnown ? leftVal : '';
        right = isLeftKnown ? '' : rightVal;
      }
      problems.push({ 
        id: k - 1, 
        type: 'bond', 
        top: isBlankTemplate ? '' : targetNumber, 
        left: isBlankTemplate ? '' : left, 
        right: isBlankTemplate ? '' : right, 
        isBlank: isBlankTemplate 
      });
    }
    return problems;
  } else if (mode === 'make-ten') {
    const candidates: { a: number; b: number }[] = [];
    const aValues: number[] = [];
    if (makeTenLeft === 'mixed') {
      for (let val = 5; val <= 9; val++) {
        aValues.push(val);
      }
    } else {
      aValues.push(parseInt(makeTenLeft, 10));
    }

    for (const a of aValues) {
      const minB = Math.max(2, 11 - a);
      const maxB = Math.min(9, 19 - a);
      for (let b = minB; b <= maxB; b++) {
        candidates.push({ a, b });
      }
    }

    const shuffled = shuffle(candidates);
    let index = 0;
    while (problems.length < 20) {
      if (index >= shuffled.length) {
        shuffle(shuffled);
        index = 0;
      }
      const { a, b } = shuffled[index++];
      problems.push({ id: problems.length, type: 'method', num1: a, num2: b, operator: '+', method: 'make-ten' });
    }
  } else if (mode === 'break-ten' || mode === 'flat-ten') {
    const candidates: { a: number; b: number }[] = [];
    for (let a = 11; a <= 18; a++) {
      for (let b = Math.max(1, a - 9); b <= Math.min(9, a - 1); b++) {
        candidates.push({ a, b });
      }
    }

    const shuffled = shuffle(candidates);
    let index = 0;
    while (problems.length < 20) {
      if (index >= shuffled.length) {
        shuffle(shuffled);
        index = 0;
      }
      const { a, b } = shuffled[index++];
      problems.push({ id: problems.length, type: 'method', num1: a, num2: b, operator: '-', method: mode });
    }
  } else {
    const isVertical = ['vertical-add', 'vertical-sub', 'vertical-mixed'].includes(mode);
    const isHorizontal = ['horizontal-add', 'horizontal-sub', 'horizontal-mixed'].includes(mode);

    if (isVertical || isHorizontal) {
      const maxProblems = isVertical ? 25 : 20;
      let addOneCount = 0;
      let subOneCount = 0;

      const candidates: { num1: number; num2: number; operator: '+' | '-' }[] = [];
      const includeAdd = mode === 'vertical-add' || mode === 'horizontal-add' || mode === 'vertical-mixed' || mode === 'horizontal-mixed';
      const includeSub = mode === 'vertical-sub' || mode === 'horizontal-sub' || mode === 'vertical-mixed' || mode === 'horizontal-mixed';

      if (includeAdd) {
        for (let num1 = 1; num1 <= max - 1; num1++) {
          for (let num2 = 1; num2 <= max - num1; num2++) {
            if (num1 + num2 < min) continue;
            const isCarry = (num1 % 10) + (num2 % 10) > 9;
            if (regroup === 'none' && isCarry) continue;
            if (regroup === 'only' && !isCarry) continue;
            candidates.push({ num1, num2, operator: '+' });
          }
        }
      }

      if (includeSub) {
        for (let num1 = min; num1 <= max; num1++) {
          for (let num2 = 1; num2 < num1; num2++) {
            const isBorrow = (num1 % 10) < (num2 % 10);
            if (regroup === 'none' && isBorrow) continue;
            if (regroup === 'only' && !isBorrow) continue;
            candidates.push({ num1, num2, operator: '-' });
          }
        }
      }

      const shuffled = shuffle(candidates);
      let index = 0;
      let reshuffles = 0;
      while (problems.length < maxProblems && reshuffles < 10) {
        if (index >= shuffled.length) {
          shuffle(shuffled);
          index = 0;
          reshuffles++;
        }
        const { num1, num2, operator } = shuffled[index++];
        const isAddOne = operator === '+' && (num1 === 1 || num2 === 1);
        const isSubOne = operator === '-' && num2 === 1;
        if (isAddOne && addOneCount >= 1) continue;
        if (isSubOne && subOneCount >= 1) continue;
        problems.push({ id: problems.length, type: 'arithmetic', num1, num2, operator });
        if (isAddOne) addOneCount++;
        if (isSubOne) subOneCount++;
      }
    }
  }
  return problems;
};

const NumberBond: React.FC<{ problem: any; large?: boolean; hideParts?: boolean }> = ({ problem, large = false, hideParts = false }) => {
  if (large) {
    return (
      <div className="relative w-[220px] h-[260px]">
        {/* SVG Lines */}
        <svg className="absolute inset-0 z-0" width="220" height="260" viewBox="0 0 220 260" xmlns="http://www.w3.org/2000/svg">
          <line x1="110" y1="100" x2="50" y2="160" stroke="black" strokeWidth="4" />
          <line x1="110" y1="100" x2="170" y2="160" stroke="black" strokeWidth="4" />
        </svg>

        {/* Top Circle */}
        <div className="absolute top-0 left-[60px] z-10 w-[100px] h-[100px] bg-white border-4 border-black rounded-full flex items-center justify-center text-4xl font-bold text-black">
          {problem.top}
        </div>

        {/* Bottom Left Circle */}
        <div className="absolute bottom-0 left-0 z-10 w-[100px] h-[100px] bg-white border-4 border-black rounded-full flex items-center justify-center text-4xl font-bold text-black">
          {hideParts ? '' : problem.left}
        </div>

        {/* Bottom Right Circle */}
        <div className="absolute bottom-0 right-0 z-10 w-[100px] h-[100px] bg-white border-4 border-black rounded-full flex items-center justify-center text-4xl font-bold text-black">
          {hideParts ? '' : problem.right}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[160px] h-[180px]">
      {/* SVG Lines */}
      <svg className="absolute inset-0 z-0" width="160" height="180" viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
        <line x1="80" y1="70" x2="35" y2="110" stroke="black" strokeWidth="3" />
        <line x1="80" y1="70" x2="125" y2="110" stroke="black" strokeWidth="3" />
      </svg>
      
      {/* Top Circle */}
      <div className="absolute top-0 left-[45px] z-10 w-[70px] h-[70px] bg-white border-[3px] border-black rounded-full flex items-center justify-center text-3xl font-bold text-black">
        {problem.top}
      </div>
      
      {/* Bottom Left Circle */}
      <div className="absolute bottom-0 left-0 z-10 w-[70px] h-[70px] bg-white border-[3px] border-black rounded-full flex items-center justify-center text-3xl font-bold text-black">
        {hideParts ? '' : problem.left}
      </div>
      
      {/* Bottom Right Circle */}
      <div className="absolute bottom-0 right-0 z-10 w-[70px] h-[70px] bg-white border-[3px] border-black rounded-full flex items-center justify-center text-3xl font-bold text-black">
        {hideParts ? '' : problem.right}
      </div>
    </div>
  );
};

const VerticalArithmetic: React.FC<{ problem: any; index: number }> = ({ problem, index }) => {
  return (
    <div className="relative w-[120px] h-[140px] flex flex-col items-end justify-center pr-4 border border-gray-100 rounded-sm">
      <span className="absolute top-1 left-1 text-[10px] text-gray-400">{index + 1}.</span>
      <div className="text-4xl font-mono tracking-widest text-black mb-1">{problem.num1}</div>
      <div className="flex items-center gap-4 text-4xl font-mono tracking-widest text-black">
        <span>{problem.operator}</span>
        <span>{problem.num2}</span>
      </div>
      <div className="w-full h-[3px] bg-black mt-2"></div>
    </div>
  );
};

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

const MethodDiagram: React.FC<{ problem: any; index: number; hideTen?: boolean }> = ({ problem, index, hideTen = false }) => {
  const { num1, num2, operator, method } = problem;
  const boxSize = 28;

  return (
    <div className="relative w-[180px] h-[160px] font-sans">
      {/* Equation */}
      <div className="absolute top-0 left-[30px] text-2xl font-normal text-black">{num1}</div>
      <div className="absolute top-0 left-[62px] text-2xl font-normal text-black">{operator}</div>
      <div className="absolute top-0 left-[94px] text-2xl font-normal text-black">{num2}</div>
      <div className="absolute top-0 left-[126px] text-2xl font-normal text-black">=</div>
      <div className="absolute top-[2px] left-[150px] w-[28px] h-[28px] border border-black bg-white"></div>

      {/* SVG Lines */}
      <svg className="absolute inset-0 top-[32px]" width="180" height="118" viewBox="0 0 180 118">
        {method === 'make-ten' ? (
          <>
            {/* Split lines from num2 (center 100) to boxes (centers 80, 120) */}
            <line x1="100" y1="0" x2="80" y2="28" stroke="black" strokeWidth="1.5" />
            <line x1="100" y1="0" x2="120" y2="28" stroke="black" strokeWidth="1.5" />

            {/* Make 10 lines */}
            <line x1="36" y1="0" x2="36" y2="70" stroke="black" strokeWidth="1.5" /> {/* From num1 down */}
            <line x1="80" y1="56" x2="80" y2="70" stroke="black" strokeWidth="1.5" /> {/* From part1 down */}
            <line x1="36" y1="70" x2="80" y2="70" stroke="black" strokeWidth="1.5" /> {/* Horizontal connect */}

            <text x="58" y="62" fontSize="20" fontWeight="normal" fill="black" textAnchor="middle">+</text>
          </>
        ) : method === 'break-ten' ? (
          <>
            {/* Split lines from num1 (center 40) to boxes (centers 20, 60) */}
            <line x1="40" y1="0" x2="20" y2="28" stroke="black" strokeWidth="1.5" />
            <line x1="40" y1="0" x2="60" y2="28" stroke="black" strokeWidth="1.5" />

            {/* Minus 10 lines: from 10 box (x=60) and num2 (x=100) */}
            <line x1="60" y1="56" x2="60" y2="70" stroke="black" strokeWidth="1.5" />
            <line x1="100" y1="0" x2="100" y2="70" stroke="black" strokeWidth="1.5" />
            <line x1="60" y1="70" x2="100" y2="70" stroke="black" strokeWidth="1.5" />
            <text x="80" y="66" fontSize="20" fontWeight="normal" fill="black" textAnchor="middle">-</text>

            {/* Plus lines: from first box (x=20) and intermediate box (x=80) */}
            <line x1="20" y1="56" x2="20" y2="110" stroke="black" strokeWidth="1.5" />
            <line x1="80" y1="98" x2="80" y2="110" stroke="black" strokeWidth="1.5" />
            <line x1="20" y1="110" x2="80" y2="110" stroke="black" strokeWidth="1.5" />
            <text x="50" y="106" fontSize="20" fontWeight="normal" fill="black" textAnchor="middle">+</text>
          </>
        ) : (
          // flat-ten
          <>
            {/* Split lines from num2 (center 100) to boxes (centers 80, 120) */}
            <line x1="100" y1="0" x2="80" y2="28" stroke="black" strokeWidth="1.5" />
            <line x1="100" y1="0" x2="120" y2="28" stroke="black" strokeWidth="1.5" />

            {/* Flat 10 lines */}
            <line x1="36" y1="0" x2="36" y2="70" stroke="black" strokeWidth="1.5" /> {/* From num1 down */}
            <line x1="80" y1="56" x2="80" y2="70" stroke="black" strokeWidth="1.5" /> {/* From part1 down */}
            <line x1="36" y1="70" x2="80" y2="70" stroke="black" strokeWidth="1.5" /> {/* Horizontal connect */}

            {/* Final subtraction lines */}
            <line x1="60" y1="98" x2="60" y2="110" stroke="black" strokeWidth="1.5" /> {/* From intermediate down */}
            <line x1="120" y1="56" x2="120" y2="110" stroke="black" strokeWidth="1.5" /> {/* From part2 down */}
            <line x1="60" y1="110" x2="120" y2="110" stroke="black" strokeWidth="1.5" /> {/* Horizontal connect */}

            <text x="58" y="62" fontSize="20" fontWeight="normal" fill="black" textAnchor="middle">-</text>
            <text x="90" y="106" fontSize="20" fontWeight="normal" fill="black" textAnchor="middle">-</text>
          </>
        )}
      </svg>

      {/* Connector: routes the final computed result over to the answer box after "=" */}
      <svg className="absolute inset-0" width="180" height="160" viewBox="0 0 180 160">
        {method === 'make-ten' ? (
          <>
            {/* Second addition: part2 (box, bottom center 120,88) + 10 (box, right-mid 72,116) */}
            <line x1="120" y1="88" x2="120" y2="116" stroke="black" strokeWidth="1.5" />
            <line x1="72" y1="116" x2="120" y2="116" stroke="black" strokeWidth="1.5" />
            <text x="96" y="112" fontSize="20" fontWeight="normal" fill="black" textAnchor="middle">+</text>
            <line x1="120" y1="116" x2="164" y2="116" stroke="black" strokeWidth="1.5" />
            <line x1="164" y1="116" x2="164" y2="30" stroke="black" strokeWidth="1.5" />
          </>
        ) : method === 'break-ten' ? (
          <>
            {/* Extend the existing "+" result over to the answer box */}
            <line x1="80" y1="142" x2="164" y2="142" stroke="black" strokeWidth="1.5" />
            <line x1="164" y1="142" x2="164" y2="30" stroke="black" strokeWidth="1.5" />
          </>
        ) : (
          <>
            {/* Extend the existing final "-" result over to the answer box */}
            <line x1="120" y1="142" x2="164" y2="142" stroke="black" strokeWidth="1.5" />
            <line x1="164" y1="142" x2="164" y2="30" stroke="black" strokeWidth="1.5" />
          </>
        )}
      </svg>

      {/* Boxes */}
      {method === 'make-ten' ? (
        <>
          <div className="absolute top-[60px] left-[66px] w-[28px] h-[28px] border border-black bg-white"></div>
          <div className="absolute top-[60px] left-[106px] w-[28px] h-[28px] border border-black bg-white"></div>
          <div className="absolute top-[102px] left-[44px] w-[28px] h-[28px] border border-black bg-white flex items-center justify-center text-black text-xl">
            {hideTen ? '' : '10'}
          </div>
        </>
      ) : method === 'break-ten' ? (
        <>
          <div className="absolute top-[60px] left-[6px] w-[28px] h-[28px] border border-black bg-white"></div>
          <div className="absolute top-[60px] left-[46px] w-[28px] h-[28px] border border-black bg-white flex items-center justify-center text-black text-xl">
            {hideTen ? '' : '10'}
          </div>
          <div className="absolute top-[102px] left-[66px] w-[28px] h-[28px] border border-black bg-white"></div>
        </>
      ) : (
        // flat-ten
        <>
          <div className="absolute top-[60px] left-[66px] w-[28px] h-[28px] border border-black bg-white"></div>
          <div className="absolute top-[60px] left-[106px] w-[28px] h-[28px] border border-black bg-white"></div>
          <div className="absolute top-[102px] left-[46px] w-[28px] h-[28px] border border-black bg-white flex items-center justify-center text-black text-xl">
            {hideTen ? '' : '10'}
          </div>
        </>
      )}
    </div>
  );
};

const A4PreviewWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const parentWidth = containerRef.current.clientWidth;
      const targetWidth = 794; // A4 print area width
      if (parentWidth < targetWidth) {
        setScale(parentWidth / targetWidth);
      } else {
        setScale(1);
      }
    };

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full flex justify-center items-start overflow-hidden py-4 print-preview-wrapper"
      style={{ height: `${1123 * scale + 32}px` }}
    >
      <div 
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'top center',
          width: '794px',
          height: '1123px',
          transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="shrink-0 print-preview-content animate-fade-in-up"
      >
        {children}
      </div>
    </div>
  );
};

const LANGUAGE_KEY = 'math-language';

export default function App() {
  const [range, setRange] = useState<Range>('1-10');
  const [mode, setMode] = useState<Mode>('number-bonds');
  const [regroup, setRegroup] = useState<RegroupOption>('mixed');
  const [makeTenLeft, setMakeTenLeft] = useState<string>('mixed');
  const [hideTen, setHideTen] = useState<boolean>(false);
  const [hideBondParts, setHideBondParts] = useState<boolean>(false);
  const [bondNumber, setBondNumber] = useState<number | '2-10'>(2);
  const [bondUseType, setBondUseType] = useState<'practice' | 'study'>('practice');
  const [isBlankTemplate, setIsBlankTemplate] = useState<boolean>(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [generateCount, setGenerateCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'settings' | 'preview'>('settings');
  const [language, setLanguage] = useState<Language>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(LANGUAGE_KEY) : null;
    return saved === 'en' ? 'en' : 'zh';
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const worksheetRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  // Helper to regenerate problems with current settings
  const regenerate = (
    r = range, 
    m = mode, 
    rg = regroup, 
    mtl = makeTenLeft, 
    but = bondUseType, 
    bn = bondNumber,
    bt = isBlankTemplate
  ) => {
    setProblems(generateProblems(r, m, rg, mtl, but, bn, bt));
    setGenerateCount(c => c + 1);
  };

  useEffect(() => {
    regenerate(range, mode, regroup, makeTenLeft, bondUseType, bondNumber, isBlankTemplate);
  }, [range, mode, regroup, makeTenLeft, bondUseType, bondNumber, isBlankTemplate]);

  const handleRegenerate = () => {
    regenerate();
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRange = e.target.value as Range;
    setRange(newRange);
  };

  const handleRegroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegroup = e.target.value as RegroupOption;
    setRegroup(newRegroup);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!worksheetRef.current || isGeneratingPdf) return;

    setIsGeneratingPdf(true);
    try {
      const worksheet = worksheetRef.current;
      const dataUrl = await toPng(worksheet, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (img.height * pdfWidth) / img.width;

      if (!Number.isFinite(pdfHeight) || pdfHeight <= 0) {
        throw new Error(`Invalid PDF height: ${pdfHeight}`);
      }

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const fileName = mode === 'number-bonds'
        ? (isBlankTemplate
            ? (language === 'zh' ? '数字分解与组合模板.pdf' : 'decomposition-composition-template.pdf')
            : (language === 'zh' ? `数字${bondNumber}的分解与组合.pdf` : `decomposition-composition-${bondNumber}.pdf`))
        : pdfFileNames[language][mode];
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert(language === 'zh' ? 'PDF 生成失败，请重试。' : 'Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col lg:flex-row font-sans relative">
      
      {/* Abstract Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-400/10 blur-[120px]"></div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="no-print lg:hidden w-full bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 flex">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-all duration-200 ${
            activeTab === 'settings' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' 
              : 'text-gray-500 hover:text-gray-750'
          }`}
        >
          🛠️ {t.settings}
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-all duration-200 ${
            activeTab === 'preview' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' 
              : 'text-gray-500 hover:text-gray-750'
          }`}
        >
          📄 {t.preview}
        </button>
      </div>

      {/* Left Settings Sidebar */}
      <div 
        className={`no-print w-full lg:w-[380px] lg:shrink-0 bg-white/80 backdrop-blur-md lg:border-r border-gray-200 lg:min-h-screen lg:sticky lg:top-0 z-20 flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-53px)] lg:max-h-screen ${
          activeTab === 'settings' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-gray-200/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shadow-sm border border-blue-200/50">
                <Settings2 size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{t.worksheetTitle}</h2>
            </div>
            <button
              onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
              className="relative w-16 h-8 rounded-full bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              aria-label={language === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-bold transition-transform duration-200 ${
                  language === 'en' ? 'translate-x-8' : 'translate-x-0'
                }`}
              >
                {language === 'zh' ? '中' : 'EN'}
              </span>
            </button>
          </div>

          {/* Form Options */}
          <div className="flex flex-col gap-5">
            {/* Mode Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="mode" className="text-sm font-bold text-gray-750">{t.mode}</label>
              <select 
                id="mode" 
                value={mode} 
                onChange={(e) => {
                  const newMode = e.target.value as Mode;
                  setMode(newMode);
                  if (newMode !== 'number-bonds' && range === '1-10') {
                    setRange('11-20');
                  }
                }}
                className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-gray-700 cursor-pointer transition-all duration-200"
              >
                <option value="number-bonds">{t.modes['number-bonds']}</option>
                <option value="vertical-add">{t.modes['vertical-add']}</option>
                <option value="vertical-sub">{t.modes['vertical-sub']}</option>
                <option value="vertical-mixed">{t.modes['vertical-mixed']}</option>
                <option value="horizontal-add">{t.modes['horizontal-add']}</option>
                <option value="horizontal-sub">{t.modes['horizontal-sub']}</option>
                <option value="horizontal-mixed">{t.modes['horizontal-mixed']}</option>
                <option value="make-ten">{t.modes['make-ten']}</option>
                <option value="break-ten">{t.modes['break-ten']}</option>
                <option value="flat-ten">{t.modes['flat-ten']}</option>
              </select>
            </div>

            {/* Range / Bond inputs based on mode */}
            {mode === 'number-bonds' ? (
              <div className="flex flex-col gap-1.5 animate-fade-in-up">
                <label htmlFor="bondNumber" className="text-sm font-bold text-gray-750">{t.bondNumber}</label>
                <select 
                  id="bondNumber" 
                  value={bondNumber} 
                  disabled={isBlankTemplate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBondNumber(val === '2-10' ? '2-10' : parseInt(val, 10));
                  }}
                  className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-gray-700 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, '2-10'].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            ) : (
              !['make-ten', 'break-ten', 'flat-ten'].includes(mode) && (
                <div className="flex flex-col gap-1.5 animate-fade-in-up">
                  <label htmlFor="range" className="text-sm font-bold text-gray-750">{t.range}</label>
                  <select 
                    id="range" 
                    value={range} 
                    onChange={handleRangeChange}
                    className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-gray-700 cursor-pointer transition-all duration-200"
                  >
                    <option value="11-20">11 - 20</option>
                    <option value="21-30">21 - 30</option>
                    <option value="10-50">10 - 50</option>
                    <option value="10-100">10 - 100</option>
                  </select>
                </div>
              )
            )}

            {/* Regroup Select (only for vertical/horizontal arithmetic) */}
            {['vertical-add', 'vertical-sub', 'vertical-mixed', 'horizontal-add', 'horizontal-sub', 'horizontal-mixed'].includes(mode) && (
              <div className="flex flex-col gap-1.5 animate-fade-in-up">
                <label htmlFor="regroup" className="text-sm font-bold text-gray-755">{t.regroup}</label>
                <select 
                  id="regroup" 
                  value={regroup} 
                  onChange={handleRegroupChange}
                  className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-gray-700 cursor-pointer transition-all duration-200"
                >
                  <option value="mixed">{t.regroupOptions.mixed}</option>
                  <option value="none">{t.regroupOptions.none}</option>
                  <option value="only">{t.regroupOptions.only}</option>
                </select>
              </div>
            )}

            {/* Make Ten Left (only for make-ten) */}
            {mode === 'make-ten' && (
              <div className="flex flex-col gap-1.5 animate-fade-in-up">
                <label htmlFor="makeTenLeft" className="text-sm font-bold text-gray-755">{t.makeTenLeft}</label>
                <select 
                  id="makeTenLeft" 
                  value={makeTenLeft} 
                  onChange={(e) => setMakeTenLeft(e.target.value)}
                  className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-gray-700 cursor-pointer transition-all duration-200"
                >
                  <option value="mixed">{t.makeTenLeftOptions.mixed}</option>
                  <option value="9">{t.makeTenLeftOptions['9']}</option>
                  <option value="8">{t.makeTenLeftOptions['8']}</option>
                  <option value="7">{t.makeTenLeftOptions['7']}</option>
                  <option value="6">{t.makeTenLeftOptions['6']}</option>
                  <option value="5">{t.makeTenLeftOptions['5']}</option>
                </select>
              </div>
            )}

            {/* Hide Ten Checkbox (only for make-ten, break-ten, flat-ten) */}
            {['make-ten', 'break-ten', 'flat-ten'].includes(mode) && (
              <div className="flex items-center gap-2.5 pt-2 animate-fade-in-up">
                <input
                  type="checkbox"
                  id="hideTen"
                  checked={hideTen}
                  onChange={(e) => setHideTen(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/50 cursor-pointer accent-blue-600"
                />
                <label htmlFor="hideTen" className="text-sm font-semibold text-gray-750 cursor-pointer select-none">{t.hideTen}</label>
              </div>
            )}

            {/* Study Card Mode, Hide Bond Parts, & Blank Template Checkboxes (only for number-bonds) */}
            {mode === 'number-bonds' && (
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-2.5 animate-fade-in-up">
                  <input
                    type="checkbox"
                    id="bondUseTypeStudy"
                    checked={bondUseType === 'study' && !isBlankTemplate}
                    disabled={isBlankTemplate}
                    onChange={(e) => setBondUseType(e.target.checked ? 'study' : 'practice')}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/50 cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="bondUseTypeStudy" className={`text-sm font-semibold text-gray-750 cursor-pointer select-none ${isBlankTemplate ? 'opacity-50 cursor-not-allowed' : ''}`}>{t.bondUseTypeStudy}</label>
                </div>

                <div className="flex items-center gap-2.5 animate-fade-in-up">
                  <input
                    type="checkbox"
                    id="hideBondParts"
                    checked={hideBondParts && !isBlankTemplate}
                    disabled={isBlankTemplate}
                    onChange={(e) => setHideBondParts(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/50 cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="hideBondParts" className={`text-sm font-semibold text-gray-750 cursor-pointer select-none ${isBlankTemplate ? 'opacity-50 cursor-not-allowed' : ''}`}>{t.hideBondParts}</label>
                </div>

                <div className="flex items-center gap-2.5 animate-fade-in-up">
                  <input
                    type="checkbox"
                    id="isBlankTemplate"
                    checked={isBlankTemplate}
                    onChange={(e) => setIsBlankTemplate(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/50 cursor-pointer accent-blue-600"
                  />
                  <label htmlFor="isBlankTemplate" className="text-sm font-semibold text-gray-750 cursor-pointer select-none">{t.blankTemplate}</label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Sticky/Fixed Action Buttons */}
        <div className="p-6 border-t border-gray-200 bg-white/60 flex flex-col gap-3">
          <button 
            onClick={handleRegenerate}
            className="w-full group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-md transition-all duration-200 font-semibold cursor-pointer"
          >
            <Dices size={18} className="group-hover:rotate-180 transition-transform duration-500" /> 
            {t.regenerate}
          </button>

          {/* On Mobile settings, show a button to switch to preview */}
          <button 
            onClick={() => setActiveTab('preview')}
            className="lg:hidden w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl transition-all duration-200 font-semibold cursor-pointer"
          >
            {t.viewPreview} 📄
          </button>

          <div className="hidden lg:flex gap-3">
            <button 
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-emerald-200 text-emerald-700 py-2.5 rounded-xl hover:bg-emerald-50 transition-all duration-200 font-semibold text-sm cursor-pointer"
            >
              <Printer size={16} /> 
              {t.print}
            </button>
            <button 
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-purple-200 text-purple-700 py-2.5 rounded-xl hover:bg-purple-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm cursor-pointer"
            >
              <Download size={16} /> 
              {isGeneratingPdf ? (language === 'zh' ? '生成中...' : 'Generating...') : t.downloadPdf}
            </button>
          </div>
        </div>
      </div>

      {/* Right Preview Area */}
      <div 
        className={`flex-1 flex-col items-center py-6 px-4 lg:py-10 z-10 overflow-y-auto bg-slate-100/40 min-h-[calc(100vh-53px)] lg:min-h-screen print-preview-container ${
          activeTab === 'preview' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Floating action bar for Mobile Preview Tab */}
        <div className="lg:hidden w-full max-w-[400px] mb-4 flex gap-3 no-print">
          <button 
            onClick={handleRegenerate}
            className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-sm cursor-pointer"
          >
            <Dices size={16} />
            {t.mobileRegenerate}
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1 bg-white border border-emerald-200 text-emerald-700 py-3 rounded-xl font-semibold text-sm cursor-pointer"
          >
            <Printer size={16} /> 
            {t.mobilePrint}
          </button>
          <button 
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex-1 flex items-center justify-center gap-1 bg-white border border-purple-200 text-purple-700 py-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-sm cursor-pointer"
          >
            <Download size={16} /> 
            {isGeneratingPdf ? (language === 'zh' ? '生成中...' : '...') : t.mobileDownload}
          </button>
        </div>

        {/* Interactive A4 Sheet with Responsive Wrapper */}
        <A4PreviewWrapper>
          <div 
            ref={worksheetRef}
            id="worksheet"
            className="print-area w-[794px] h-[1123px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] py-8 px-12 flex flex-col relative shrink-0 overflow-hidden transition-shadow duration-500 hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
          >
            <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-2 relative z-10 gap-4">
              <h1 className="text-3xl font-black tracking-widest text-black">
                {mode === 'number-bonds'
                  ? (isBlankTemplate
                      ? (language === 'zh' ? '数字的分解与组合' : 'Decomposition & Composition')
                      : (language === 'zh' ? `数字 ${bondNumber} 的分解与组合` : `Decomposition & Composition of ${bondNumber}`))
                  : t.printTitles[mode]}
              </h1>
              <div className="flex gap-6 text-sm font-bold text-black whitespace-nowrap flex-shrink-0">
                <span>{t.date}: ________________</span>
                <span>{t.name}: ________________</span>
                <span>{t.score}: ____ / {problems.length}</span>
              </div>
            </div>
            
            <div key={generateCount} className={`flex flex-wrap w-full pt-2 relative z-10 animate-fade-in-up ${
              mode === 'number-bonds' 
                ? 'h-[750px] items-center content-center justify-center' 
                : 'content-start'
            }`}>
              {problems.map((problem, idx) => {
                let colClass = 'w-1/5';
                let heightClass = 'h-[180px]';
                const isLargeBonds = mode === 'number-bonds' && typeof bondNumber === 'number' && bondNumber <= 4 && !isBlankTemplate;
                
                if (mode === 'number-bonds') {
                  const effectiveNumber = (isBlankTemplate || bondNumber === '2-10') ? 10 : bondNumber;
                  colClass = effectiveNumber === 2 
                    ? 'w-full' 
                    : effectiveNumber === 3 
                      ? 'w-1/2' 
                      : 'w-1/3';
                  heightClass = isLargeBonds ? 'h-[320px]' : 'h-[230px]';
                } else if (
                  mode === 'make-ten' || mode === 'break-ten' || mode === 'flat-ten' ||
                  mode.startsWith('horizontal-')
                ) {
                  colClass = 'w-1/4';
                  heightClass = 'h-[180px]';
                }

                return (
                  <div key={problem.id} className={`${colClass} ${heightClass} flex justify-center items-center break-inside-avoid`}>
                    {problem.type === 'bond' ? (
                      <NumberBond problem={problem} large={isLargeBonds} hideParts={hideBondParts} />
                    ) : mode.startsWith('horizontal-') ? (
                      <HorizontalArithmetic problem={problem} index={idx} />
                    ) : problem.type === 'arithmetic' ? (
                      <VerticalArithmetic problem={problem} index={idx} />
                    ) : (
                      <MethodDiagram problem={problem} index={idx} hideTen={hideTen} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </A4PreviewWrapper>
      </div>
    </div>
  );
}
