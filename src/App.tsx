import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Dices, Printer, Download, Settings2, Sparkles } from 'lucide-react';

type Range = '11-20' | '21-30' | '10-50' | '10-100';
type Mode = 'number-bonds' | 'vertical-add' | 'vertical-sub' | 'vertical-mixed' | 'make-ten' | 'break-ten' | 'flat-ten';

type Problem = 
  | { id: number; type: 'bond'; top: number; left: number | string; right: number | string }
  | { id: number; type: 'arithmetic'; num1: number; num2: number; operator: '+' | '-' }
  | { id: number; type: 'method'; num1: number; num2: number; operator: '+' | '-'; method: 'make-ten' | 'break-ten' | 'flat-ten' };

const generateProblems = (range: Range, mode: Mode): Problem[] => {
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
    while (problems.length < 20) {
      const a = Math.floor(Math.random() * 8) + 2; // 2-9
      const b = Math.floor(Math.random() * 8) + 2; // 2-9
      if (a + b <= 10 || a + b >= 20) continue;
      const key = `${a}+${b}`;
      if (!seen.has(key)) {
        seen.add(key);
        problems.push({ id: problems.length, type: 'method', num1: a, num2: b, operator: '+', method: 'make-ten' });
      }
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
    // Vertical Arithmetic - 25 problems (5x5)
    let addOneCount = 0;
    let subOneCount = 0;
    
    while (problems.length < 25) {
      let operator: '+' | '-' = '+';
      if (mode === 'vertical-add') operator = '+';
      else if (mode === 'vertical-sub') operator = '-';
      else operator = Math.random() > 0.5 ? '+' : '-';

      let num1 = 0, num2 = 0;
      let isValid = false;
      let attempts = 0;

      while (!isValid && attempts < 100) {
        attempts++;
        if (operator === '+') {
          // Addition: result <= max, result >= min
          num1 = Math.floor(Math.random() * (max - 1)) + 1;
          num2 = Math.floor(Math.random() * (max - num1)) + 1;
          
          if (num1 % 10 + num2 % 10 > 9) continue; // No regrouping
          if (num1 + num2 < min) continue; // Ensure result is at least min
          
          isValid = true;
        } else {
          // Subtraction: num1 <= max, num1 >= min
          num1 = Math.floor(Math.random() * (max - min + 1)) + min;
          num2 = Math.floor(Math.random() * num1) + 1;
          
          if (num1 % 10 < num2 % 10) continue; // No regrouping
          
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

const MethodDiagram: React.FC<{ problem: any; index: number }> = ({ problem, index }) => {
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

      {/* Boxes */}
      {method === 'make-ten' ? (
        <>
          <div className="absolute top-[60px] left-[66px] w-[28px] h-[28px] border border-black bg-white"></div>
          <div className="absolute top-[60px] left-[106px] w-[28px] h-[28px] border border-black bg-white"></div>
          <div className="absolute top-[102px] left-[44px] w-[28px] h-[28px] border border-black bg-white flex items-center justify-center text-black text-xl">10</div>
        </>
      ) : method === 'break-ten' ? (
        <>
          <div className="absolute top-[60px] left-[6px] w-[28px] h-[28px] border border-black bg-white"></div>
          <div className="absolute top-[60px] left-[46px] w-[28px] h-[28px] border border-black bg-white flex items-center justify-center text-black text-xl">10</div>
          <div className="absolute top-[102px] left-[66px] w-[28px] h-[28px] border border-black bg-white"></div>
        </>
      ) : (
        // flat-ten
        <>
          <div className="absolute top-[60px] left-[66px] w-[28px] h-[28px] border border-black bg-white"></div>
          <div className="absolute top-[60px] left-[106px] w-[28px] h-[28px] border border-black bg-white"></div>
          <div className="absolute top-[102px] left-[46px] w-[28px] h-[28px] border border-black bg-white flex items-center justify-center text-black text-xl">10</div>
        </>
      )}
    </div>
  );
};

export default function App() {
  const [range, setRange] = useState<Range>('11-20');
  const [mode, setMode] = useState<Mode>('number-bonds');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [generateCount, setGenerateCount] = useState(0);
  const worksheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProblems(generateProblems(range, mode));
    setGenerateCount(c => c + 1);
  }, [mode]);

  const handleRegenerate = () => {
    setProblems(generateProblems(range, mode));
    setGenerateCount(c => c + 1);
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRange = e.target.value as Range;
    setRange(newRange);
    setProblems(generateProblems(newRange, mode));
    setGenerateCount(c => c + 1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!worksheetRef.current) return;
    
    const canvas = await html2canvas(worksheetRef.current, { 
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('数学练习题.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-10 flex flex-col items-center font-sans relative">
      
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-400/10 blur-[120px]"></div>
      </div>

      {/* Controls */}
      <div className="no-print w-full max-w-[794px] glass-panel p-6 rounded-2xl mb-8 flex flex-col gap-6 relative z-10 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shadow-sm border border-blue-200/50">
              <Settings2 size={20} />
            </div>
            <label htmlFor="mode" className="font-semibold text-gray-800">题型 (Mode)：</label>
            <select 
              id="mode" 
              value={mode} 
              onChange={(e) => setMode(e.target.value as Mode)}
              className="border border-white/60 shadow-sm rounded-xl px-4 py-2.5 bg-white/70 focus:bg-white hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-gray-700 cursor-pointer transition-all duration-200"
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
          
          {/* Only show difficulty range for modes that support it */}
          {!['make-ten', 'break-ten', 'flat-ten'].includes(mode) && (
            <div className="flex items-center gap-3 animate-fade-in-up">
              <label htmlFor="range" className="font-semibold text-gray-800">难度 (Range)：</label>
              <select 
                id="range" 
                value={range} 
                onChange={handleRangeChange}
                className="border border-white/60 shadow-sm rounded-xl px-4 py-2.5 bg-white/70 focus:bg-white hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-gray-700 cursor-pointer transition-all duration-200"
              >
                <option value="11-20">11 - 20</option>
                <option value="21-30">21 - 30</option>
                <option value="10-50">10 - 50</option>
                <option value="10-100">10 - 100</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={handleRegenerate}
            className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 font-semibold transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Dices size={22} className="group-hover:rotate-180 transition-transform duration-500" /> 
            重新生成题目
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white/80 border border-emerald-200 text-emerald-700 px-6 py-3 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md transition-all duration-300 font-semibold transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Printer size={20} /> 
            直接打印
          </button>
          <button 
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 bg-white/80 border border-purple-200 text-purple-700 px-6 py-3 rounded-xl hover:bg-purple-50 hover:border-purple-300 hover:shadow-md transition-all duration-300 font-semibold transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download size={20} /> 
            下载 PDF
          </button>
        </div>
      </div>

      {/* Worksheet */}
      <div 
        ref={worksheetRef}
        id="worksheet"
        className="print-area w-[794px] h-[1123px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] py-8 px-12 flex flex-col relative shrink-0 overflow-hidden z-10 transition-shadow duration-500 hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
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
            let heightClass = 'h-[180px]'; // Reduced from 195px to prevent 5th row cut off
            
            if (mode === 'number-bonds') {
              colClass = 'w-1/3';
              heightClass = 'h-[230px]'; // Reduced from 240px
            } else if (mode === 'make-ten' || mode === 'break-ten' || mode === 'flat-ten') {
              colClass = 'w-1/4';
              heightClass = 'h-[180px]'; // Reduced from 195px
            }

            return (
              <div key={problem.id} className={`${colClass} ${heightClass} flex justify-center items-center break-inside-avoid`}>
                {problem.type === 'bond' ? (
                  <NumberBond problem={problem} />
                ) : problem.type === 'arithmetic' ? (
                  <VerticalArithmetic problem={problem} index={idx} />
                ) : (
                  <MethodDiagram problem={problem} index={idx} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
