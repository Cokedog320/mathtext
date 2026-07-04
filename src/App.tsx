import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Dices, Printer, Download, Settings2, Sparkles, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

export type Range = '11-20' | '21-30' | '10-50' | '10-100';
export type Mode = 'number-bonds' | 'vertical-add' | 'vertical-sub' | 'vertical-mixed' | 'make-ten' | 'break-ten' | 'flat-ten' | 'horizontal-add' | 'horizontal-sub' | 'horizontal-mixed';
export type RegroupOption = 'mixed' | 'none' | 'only';

export type Problem = 
  | { id: number; type: 'bond'; top: number; left: number | string; right: number | string }
  | { id: number; type: 'arithmetic'; num1: number; num2: number; operator: '+' | '-' }
  | { id: number; type: 'method'; num1: number; num2: number; operator: '+' | '-'; method: 'make-ten' | 'break-ten' | 'flat-ten' };

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
  makeTenLeft: string = 'mixed'
): Problem[] => {
  let min = 11, max = 20;
  if (range === '21-30') { min = 21; max = 30; }
  else if (range === '10-50') { min = 10; max = 50; }
  else if (range === '10-100') { min = 10; max = 100; }

  const problems: Problem[] = [];
  const seen = new Set<string>();
  
  if (mode === 'number-bonds') {
    let zeroCount = 0;
    while (problems.length < 12) {
      const top = Math.floor(Math.random() * (max - min + 1)) + min;
      const knownPart = Math.floor(Math.random() * (top + 1));
      
      const involvesZero = knownPart === 0 || knownPart === top;
      if (involvesZero && zeroCount >= 1) {
        continue;
      }

      const isLeftKnown = Math.random() > 0.5;
      const left = isLeftKnown ? knownPart : '';
      const right = isLeftKnown ? '' : knownPart;
      const key = `${top}-${left}-${right}`;

      if (!seen.has(key)) {
        seen.add(key);
        if (involvesZero) zeroCount++;
        problems.push({ id: problems.length, type: 'bond', top, left, right });
      }
    }
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
      let minB = Math.max(2, 11 - a);
      let maxB = Math.min(9, 19 - a);
      if (minB > maxB) {
        minB = 11 - a;
        maxB = 19 - a;
      }
      for (let b = minB; b <= maxB; b++) {
        candidates.push({ a, b });
      }
    }

    let shuffled = shuffle(candidates);
    let index = 0;
    while (problems.length < 20) {
      if (index >= shuffled.length) {
        shuffled = shuffle(candidates);
        index = 0;
      }
      const { a, b } = shuffled[index++];
      problems.push({ id: problems.length, type: 'method', num1: a, num2: b, operator: '+', method: 'make-ten' });
    }
  } else if (mode === 'break-ten' || mode === 'flat-ten') {
    while (problems.length < 20) {
      const a = Math.floor(Math.random() * 9) + 11; // 11-19
      const b = Math.floor(Math.random() * 9) + 1; // 1-9
      if (a - b >= 10 || a - b <= 0) continue;
      const key = `${a}-${b}`;
      if (!seen.has(key)) {
        seen.add(key);
        problems.push({ id: problems.length, type: 'method', num1: a, num2: b, operator: '-', method: mode });
      }
    }
  } else {
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

        let num1 = 0, num2 = 0;
        let isValid = false;
        let attempts = 0;

        while (!isValid && attempts < 100) {
          attempts++;
          if (operator === '+') {
            num1 = Math.floor(Math.random() * (max - 1)) + 1;
            num2 = Math.floor(Math.random() * (max - num1)) + 1;
            
            if (num1 + num2 < min) continue;
            
            // Carry logic check
            const isCarry = (num1 % 10) + (num2 % 10) > 9;
            if (regroup === 'none' && isCarry) continue;
            if (regroup === 'only' && !isCarry) continue;
            
            isValid = true;
          } else {
            num1 = Math.floor(Math.random() * (max - min + 1)) + min;
            num2 = Math.floor(Math.random() * num1) + 1;
            
            // Borrow logic check
            const isBorrow = (num1 % 10) < (num2 % 10);
            if (regroup === 'none' && isBorrow) continue;
            if (regroup === 'only' && !isBorrow) continue;
            
            isValid = true;
          }
        }

        // Fallback if strict rules fail
        if (!isValid) {
          if (operator === '+') {
            num1 = Math.floor(Math.random() * (max - 1)) + 1;
            num2 = Math.floor(Math.random() * (max - num1)) + 1;
          } else {
            num1 = Math.floor(Math.random() * (max - min + 1)) + min;
            num2 = Math.floor(Math.random() * num1) + 1;
          }
        }

        const isAddOne = operator === '+' && (num1 === 1 || num2 === 1);
        const isSubOne = operator === '-' && num2 === 1;

        if (isAddOne && addOneCount >= 1) continue;
        if (isSubOne && subOneCount >= 1) continue;

        const key = `${num1}${operator}${num2}`;
        if (!seen.has(key)) {
          seen.add(key);
          if (isAddOne) addOneCount++;
          if (isSubOne) subOneCount++;
          problems.push({ id: problems.length, type: 'arithmetic', num1, num2, operator });
        }
      }
    }
  }
  return problems;
};

const NumberBond: React.FC<{ problem: any }> = ({ problem }) => {
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
        {problem.left}
      </div>
      
      {/* Bottom Right Circle */}
      <div className="absolute bottom-0 right-0 z-10 w-[70px] h-[70px] bg-white border-[3px] border-black rounded-full flex items-center justify-center text-3xl font-bold text-black">
        {problem.right}
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
            {/* Horizontal line from 10 box (bottom center 58, 130) to answer column (164) at y=130 */}
            <line x1="58" y1="130" x2="164" y2="130" stroke="black" strokeWidth="1.5" />
            {/* Vertical line from part2 box (bottom center 120, 88) down to meet the horizontal line at y=130 */}
            <line x1="120" y1="88" x2="120" y2="130" stroke="black" strokeWidth="1.5" />
            {/* Vertical line from y=130 up to the bottom of the answer box (y=30) at x=164 */}
            <line x1="164" y1="130" x2="164" y2="30" stroke="black" strokeWidth="1.5" />
            {/* Plus sign centered between the 10 box and the vertical drop line */}
            <text x="89" y="122" fontSize="20" fontWeight="normal" fill="black" textAnchor="middle">+</text>
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

export default function App() {
  const [range, setRange] = useState<Range>('11-20');
  const [mode, setMode] = useState<Mode>('number-bonds');
  const [regroup, setRegroup] = useState<RegroupOption>('mixed');
  const [makeTenLeft, setMakeTenLeft] = useState<string>('mixed');
  const [hideTen, setHideTen] = useState<boolean>(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [generateCount, setGenerateCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'settings' | 'preview'>('settings');
  const worksheetRef = useRef<HTMLDivElement>(null);

  // Helper to regenerate problems with current settings
  const regenerate = (r = range, m = mode, rg = regroup, mtl = makeTenLeft) => {
    setProblems(generateProblems(r, m, rg, mtl));
    setGenerateCount(c => c + 1);
  };

  useEffect(() => {
    regenerate(range, mode, regroup, makeTenLeft);
  }, [range, mode, regroup, makeTenLeft]);

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
    if (!worksheetRef.current) return;
    
    const canvas = await html2canvas(worksheetRef.current, { 
      scale: 2,
      useCORS: true,
      logging: false,
      onclone: (clonedDoc) => {
        const clonedWorksheet = clonedDoc.getElementById('worksheet');
        if (clonedWorksheet && clonedWorksheet.parentElement) {
          clonedWorksheet.parentElement.style.transform = 'none';
        }
      }
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('数学练习题.pdf');
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
          🛠️ 参数配置 (Settings)
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-all duration-200 ${
            activeTab === 'preview' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' 
              : 'text-gray-500 hover:text-gray-750'
          }`}
        >
          📄 打印预览 (Preview)
        </button>
      </div>

      {/* Left Settings Sidebar */}
      <div 
        className={`no-print w-full lg:w-[380px] lg:shrink-0 bg-white/80 backdrop-blur-md lg:border-r border-gray-200 lg:min-h-screen lg:sticky lg:top-0 z-20 flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-53px)] lg:max-h-screen ${
          activeTab === 'settings' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-gray-200/60 pb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shadow-sm border border-blue-200/50">
              <Settings2 size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">习题定制</h2>
          </div>

          {/* Form Options */}
          <div className="flex flex-col gap-5">
            {/* Mode Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="mode" className="text-sm font-bold text-gray-750">题型 (Mode)</label>
              <select 
                id="mode" 
                value={mode} 
                onChange={(e) => setMode(e.target.value as Mode)}
                className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-gray-700 cursor-pointer transition-all duration-200"
              >
                <option value="number-bonds">数字组合 (Number Bonds)</option>
                <option value="vertical-add">竖排加法 (Vertical Addition)</option>
                <option value="vertical-sub">竖排减法 (Vertical Subtraction)</option>
                <option value="vertical-mixed">竖排混合 (Vertical Mixed)</option>
                <option value="make-ten">凑十法 (Make-Ten Method)</option>
                <option value="break-ten">破十法 (Break-Ten Method)</option>
                <option value="flat-ten">平十法 (Flat-Ten Method)</option>
              </select>
            </div>

            {/* Range Select (only for number-bonds, vertical-add, vertical-sub, vertical-mixed) */}
            {!['make-ten', 'break-ten', 'flat-ten'].includes(mode) && (
              <div className="flex flex-col gap-1.5 animate-fade-in-up">
                <label htmlFor="range" className="text-sm font-bold text-gray-750">难度 (Range)</label>
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
            )}

            {/* Regroup Select (only for vertical arithmetic) */}
            {['vertical-add', 'vertical-sub', 'vertical-mixed'].includes(mode) && (
              <div className="flex flex-col gap-1.5 animate-fade-in-up">
                <label htmlFor="regroup" className="text-sm font-bold text-gray-755">进退位 (Regroup)</label>
                <select 
                  id="regroup" 
                  value={regroup} 
                  onChange={handleRegroupChange}
                  className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-gray-700 cursor-pointer transition-all duration-200"
                >
                  <option value="mixed">混合 (Mixed)</option>
                  <option value="none">无进/退位 (No Regroup)</option>
                  <option value="only">进/退位 (Regroup Only)</option>
                </select>
              </div>
            )}

            {/* Make Ten Left (only for make-ten) */}
            {mode === 'make-ten' && (
              <div className="flex flex-col gap-1.5 animate-fade-in-up">
                <label htmlFor="makeTenLeft" className="text-sm font-bold text-gray-755">左加数 (Left Addend)</label>
                <select 
                  id="makeTenLeft" 
                  value={makeTenLeft} 
                  onChange={(e) => setMakeTenLeft(e.target.value)}
                  className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-gray-700 cursor-pointer transition-all duration-200"
                >
                  <option value="mixed">随机 (Mixed)</option>
                  <option value="9">9</option>
                  <option value="8">8</option>
                  <option value="7">7</option>
                  <option value="6">6</option>
                  <option value="5">5</option>
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
                <label htmlFor="hideTen" className="text-sm font-semibold text-gray-750 cursor-pointer select-none">隐藏“10”辅助数字</label>
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
            重新生成题目
          </button>

          {/* On Mobile settings, show a button to switch to preview */}
          <button 
            onClick={() => setActiveTab('preview')}
            className="lg:hidden w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl transition-all duration-200 font-semibold cursor-pointer"
          >
            查看打印预览 📄
          </button>

          <div className="hidden lg:flex gap-3">
            <button 
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-emerald-200 text-emerald-700 py-2.5 rounded-xl hover:bg-emerald-50 transition-all duration-200 font-semibold text-sm cursor-pointer"
            >
              <Printer size={16} /> 
              直接打印
            </button>
            <button 
              onClick={handleDownloadPdf}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-purple-200 text-purple-700 py-2.5 rounded-xl hover:bg-purple-50 transition-all duration-200 font-semibold text-sm cursor-pointer"
            >
              <Download size={16} /> 
              下载 PDF
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
            换一批
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1 bg-white border border-emerald-200 text-emerald-700 py-3 rounded-xl font-semibold text-sm cursor-pointer"
          >
            <Printer size={16} /> 
            打印
          </button>
          <button 
            onClick={handleDownloadPdf}
            className="flex-1 flex items-center justify-center gap-1 bg-white border border-purple-200 text-purple-700 py-3 rounded-xl font-semibold text-sm cursor-pointer"
          >
            <Download size={16} /> 
            下载
          </button>
        </div>

        {/* Interactive A4 Sheet with Responsive Wrapper */}
        <A4PreviewWrapper>
          <div 
            ref={worksheetRef}
            id="worksheet"
            className="print-area w-[794px] h-[1123px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] py-8 px-12 flex flex-col relative shrink-0 overflow-hidden transition-shadow duration-500 hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
          >
            {/* Subtle Paper Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}></div>

            <div className="no-print absolute top-4 right-4 text-xs text-gray-400/60 font-mono flex items-center gap-1">
              <Sparkles size={12} /> A4 Preview
            </div>
            
            <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-2 relative z-10">
              <h1 className="text-3xl font-black tracking-widest text-black uppercase">
                {mode === 'number-bonds' ? 'NUMBER BONDS' : 
                  mode === 'vertical-add' ? 'VERTICAL ADDITION' :
                  mode === 'vertical-sub' ? 'VERTICAL SUBTRACTION' :
                  mode === 'vertical-mixed' ? 'VERTICAL ARITHMETIC' :
                  mode === 'make-ten' ? 'MAKE-TEN METHOD' :
                  mode === 'break-ten' ? 'BREAK-TEN METHOD' :
                  'FLAT-TEN METHOD'}
              </h1>
              <div className="flex gap-6 text-sm font-bold text-black">
                <span>Date: ________________</span>
                <span>Name: ________________</span>
                <span>Score: ____ / {problems.length}</span>
              </div>
            </div>
            
            <div key={generateCount} className="flex flex-wrap w-full content-start pt-2 relative z-10 animate-fade-in-up">
              {problems.map((problem, idx) => {
                let colClass = 'w-1/5';
                let heightClass = 'h-[180px]';
                
                if (mode === 'number-bonds') {
                  colClass = 'w-1/3';
                  heightClass = 'h-[230px]';
                } else if (mode === 'make-ten' || mode === 'break-ten' || mode === 'flat-ten') {
                  colClass = 'w-1/4';
                  heightClass = 'h-[180px]';
                }

                return (
                  <div key={problem.id} className={`${colClass} ${heightClass} flex justify-center items-center break-inside-avoid`}>
                    {problem.type === 'bond' ? (
                      <NumberBond problem={problem} />
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
