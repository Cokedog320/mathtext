import React from 'react';
import { Problem, RegroupOption } from '../types';
import {
  HorizontalFillArithmetic as HorizontalFillComponent,
  HORIZONTAL_FILL_TEXT_STYLE,
} from './HorizontalFillArithmetic';

export const NumberBond: React.FC<{ problem: Extract<Problem, { type: 'bond' }>; large?: boolean; hideParts?: boolean }> = ({ problem, large = false, hideParts = false }) => {
  if (large) {
    return (
      <div className="relative w-[220px] h-[260px]">
        <svg className="absolute inset-0 z-0" width="220" height="260" viewBox="0 0 220 260" xmlns="http://www.w3.org/2000/svg">
          <line x1="110" y1="100" x2="50" y2="160" stroke="black" strokeWidth="4" />
          <line x1="110" y1="100" x2="170" y2="160" stroke="black" strokeWidth="4" />
        </svg>
        <div className="absolute top-0 left-[60px] z-10 w-[100px] h-[100px] bg-white border-4 border-black rounded-full flex items-center justify-center text-4xl font-bold text-black">
          {problem.top}
        </div>
        <div className="absolute bottom-0 left-0 z-10 w-[100px] h-[100px] bg-white border-4 border-black rounded-full flex items-center justify-center text-4xl font-bold text-black">
          {hideParts ? '' : problem.left}
        </div>
        <div className="absolute bottom-0 right-0 z-10 w-[100px] h-[100px] bg-white border-4 border-black rounded-full flex items-center justify-center text-4xl font-bold text-black">
          {hideParts ? '' : problem.right}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[160px] h-[180px]">
      <svg className="absolute inset-0 z-0" width="160" height="180" viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
        <line x1="80" y1="70" x2="35" y2="110" stroke="black" strokeWidth="3" />
        <line x1="80" y1="70" x2="125" y2="110" stroke="black" strokeWidth="3" />
      </svg>
      <div className="absolute top-0 left-[45px] z-10 w-[70px] h-[70px] bg-white border-[3px] border-black rounded-full flex items-center justify-center text-3xl font-bold text-black">
        {problem.top}
      </div>
      <div className="absolute bottom-0 left-0 z-10 w-[70px] h-[70px] bg-white border-[3px] border-black rounded-full flex items-center justify-center text-3xl font-bold text-black">
        {hideParts ? '' : problem.left}
      </div>
      <div className="absolute bottom-0 right-0 z-10 w-[70px] h-[70px] bg-white border-[3px] border-black rounded-full flex items-center justify-center text-3xl font-bold text-black">
        {hideParts ? '' : problem.right}
      </div>
    </div>
  );
};

export const VerticalArithmetic: React.FC<{
  problem: Extract<Problem, { type: 'arithmetic' }>;
  index: number;
  regroup: RegroupOption;
}> = ({ problem, index, regroup }) => {
  const showWorkBoxes = regroup !== 'none';
  const topTens = Math.floor(problem.num1 / 10);
  const topOnes = problem.num1 % 10;
  const lowerTens = problem.num2 >= 10 ? Math.floor(problem.num2 / 10) : '';
  const lowerOnes = problem.num2 % 10;

  return (
    <div className="relative w-[150px] h-[185px] flex items-center justify-center border border-gray-100 rounded-sm">
      <span className="absolute top-2 left-2 text-[10px] text-gray-400">{index + 1}.</span>
      <div className="grid grid-cols-[30px_42px_42px] grid-rows-[26px_45px_45px_4px] items-center text-center font-mono text-black">
        <span />
        {showWorkBoxes && problem.operator === '+' ? (
          <span data-work-box="carry-tens" className="fill-box mx-auto" />
        ) : showWorkBoxes && problem.operator === '-' ? (
          <span data-work-box="borrow-tens" className="fill-box mx-auto" />
        ) : <span />}
        {showWorkBoxes && problem.operator === '-' ? (
          <span data-work-box="borrow-ones" className="fill-box mx-auto" />
        ) : <span />}

        <span />
        <span className="text-4xl">{topTens}</span>
        <span className="text-4xl">{topOnes}</span>

        <span className="text-4xl">{problem.operator}</span>
        <span className="text-4xl">{lowerTens}</span>
        <span className="text-4xl">{lowerOnes}</span>

        <span className="col-span-3 h-[3px] w-full bg-black" />
      </div>
    </div>
  );
};

export const HorizontalArithmetic: React.FC<{ problem: Extract<Problem, { type: 'arithmetic' }>; index: number }> = ({ problem, index }) => {
  return (
    <div className="relative w-[160px] h-full flex items-center justify-between px-1 border border-gray-100 rounded-sm">
      <span className="absolute top-1 left-1 text-[10px] text-gray-400 font-mono">{index + 1}.</span>
      <div className="flex min-w-0 items-center justify-center gap-1 w-full text-lg font-semibold text-gray-800 mt-2 select-none whitespace-nowrap">
        <span>{problem.num1}</span>
        <span>{problem.operator}</span>
        <span>{problem.num2}</span>
        <span>=</span>
        <span className="fill-box shrink-0" aria-label="answer" />
      </div>
    </div>
  );
};

export const HorizontalFillArithmetic: React.FC<{
  problem: Extract<Problem, { type: 'horizontal-fill' }>;
  index: number;
}> = ({ problem, index }) => {
  return (
    <div className="relative w-[160px] h-full flex items-center justify-between px-2 border border-gray-100 rounded-sm">
      <span className="absolute top-1 left-1 text-[10px] text-gray-400 font-mono">{index + 1}.</span>
      <div className="flex items-center justify-center w-full mt-2 select-none">
        <HorizontalFillComponent problem={problem} />
      </div>
    </div>
  );
};

export const ChainedArithmetic: React.FC<{
  problem: Extract<Problem, { type: 'arithmetic-chain' }>;
  index: number;
}> = ({ problem, index }) => {
  return (
    <div className="relative w-[220px] h-full flex items-center justify-between px-2 border border-gray-100 rounded-sm">
      <span className="absolute top-1 left-1 text-[10px] text-gray-400 font-mono">{index + 1}.</span>
      <div className={`flex items-center justify-center gap-2 w-full ${HORIZONTAL_FILL_TEXT_STYLE} mt-2 select-none whitespace-nowrap`}>
        <span>{problem.operands[0]}</span>
        <span>{problem.operators[0]}</span>
        <span>{problem.operands[1]}</span>
        <span>{problem.operators[1]}</span>
        <span>{problem.operands[2]}</span>
        <span>=</span>
        <div className="w-[28px] h-[28px] border border-black bg-white shrink-0"></div>
      </div>
    </div>
  );
};

export const MethodDiagram: React.FC<{ problem: Extract<Problem, { type: 'method' }>; index?: number; hideTen?: boolean }> = ({ problem, hideTen = false }) => {
  const { num1, num2, operator, method } = problem;

  return (
    <div className="relative w-[180px] h-[160px] font-sans">
      <div className="absolute top-0 left-[30px] text-2xl font-normal text-black">{num1}</div>
      <div className="absolute top-0 left-[62px] text-2xl font-normal text-black">{operator}</div>
      <div className="absolute top-0 left-[94px] text-2xl font-normal text-black">{num2}</div>
      <div className="absolute top-0 left-[126px] text-2xl font-normal text-black">=</div>
      <div className="absolute top-[2px] left-[150px] w-[28px] h-[28px] border border-black bg-white"></div>

      <svg className="absolute inset-0 top-[32px]" width="180" height="118" viewBox="0 0 180 118">
        {method === 'make-ten' ? (
          <>
            <line x1="100" y1="0" x2="80" y2="28" stroke="black" strokeWidth="1.5" />
            <line x1="100" y1="0" x2="120" y2="28" stroke="black" strokeWidth="1.5" />
            <line x1="36" y1="0" x2="36" y2="70" stroke="black" strokeWidth="1.5" />
            <line x1="80" y1="56" x2="80" y2="70" stroke="black" strokeWidth="1.5" />
            <line x1="36" y1="70" x2="80" y2="70" stroke="black" strokeWidth="1.5" />
            <text x="58" y="62" fontSize="20" fontWeight="normal" fill="black" textAnchor="middle">+</text>
          </>
        ) : method === 'break-ten' ? (
          <>
            <line x1="40" y1="0" x2="20" y2="28" stroke="black" strokeWidth="1.5" />
            <line x1="40" y1="0" x2="60" y2="28" stroke="black" strokeWidth="1.5" />
            <line x1="60" y1="56" x2="60" y2="70" stroke="black" strokeWidth="1.5" />
            <line x1="100" y1="0" x2="100" y2="70" stroke="black" strokeWidth="1.5" />
            <line x1="60" y1="70" x2="100" y2="70" stroke="black" strokeWidth="1.5" />
            <text x="80" y="66" fontSize="20" fontWeight="normal" fill="black" textAnchor="middle">-</text>
            <line x1="20" y1="56" x2="20" y2="110" stroke="black" strokeWidth="1.5" />
            <line x1="80" y1="98" x2="80" y2="110" stroke="black" strokeWidth="1.5" />
            <line x1="20" y1="110" x2="80" y2="110" stroke="black" strokeWidth="1.5" />
            <text x="50" y="106" fontSize="20" fontWeight="normal" fill="black" textAnchor="middle">+</text>
          </>
        ) : (
          <>
            <line x1="100" y1="0" x2="80" y2="28" stroke="black" strokeWidth="1.5" />
            <line x1="100" y1="0" x2="120" y2="28" stroke="black" strokeWidth="1.5" />
            <line x1="36" y1="0" x2="36" y2="70" stroke="black" strokeWidth="1.5" />
            <line x1="80" y1="56" x2="80" y2="70" stroke="black" strokeWidth="1.5" />
            <line x1="36" y1="70" x2="80" y2="70" stroke="black" strokeWidth="1.5" />
            <line x1="60" y1="98" x2="60" y2="110" stroke="black" strokeWidth="1.5" />
            <line x1="120" y1="56" x2="120" y2="110" stroke="black" strokeWidth="1.5" />
            <line x1="60" y1="110" x2="120" y2="110" stroke="black" strokeWidth="1.5" />
            <text x="58" y="62" fontSize="20" fontWeight="normal" fill="black" textAnchor="middle">-</text>
            <text x="90" y="106" fontSize="20" fontWeight="normal" fill="black" textAnchor="middle">-</text>
          </>
        )}
      </svg>

      <svg className="absolute inset-0" width="180" height="160" viewBox="0 0 180 160">
        {method === 'make-ten' ? (
          <>
            <line x1="120" y1="88" x2="120" y2="116" stroke="black" strokeWidth="1.5" />
            <line x1="72" y1="116" x2="120" y2="116" stroke="black" strokeWidth="1.5" />
            <text x="96" y="112" fontSize="20" fontWeight="normal" fill="black" textAnchor="middle">+</text>
            <line x1="120" y1="116" x2="164" y2="116" stroke="black" strokeWidth="1.5" />
            <line x1="164" y1="116" x2="164" y2="30" stroke="black" strokeWidth="1.5" />
          </>
        ) : method === 'break-ten' ? (
          <>
            <line x1="80" y1="142" x2="164" y2="142" stroke="black" strokeWidth="1.5" />
            <line x1="164" y1="142" x2="164" y2="30" stroke="black" strokeWidth="1.5" />
          </>
        ) : (
          <>
            <line x1="120" y1="142" x2="164" y2="142" stroke="black" strokeWidth="1.5" />
            <line x1="164" y1="142" x2="164" y2="30" stroke="black" strokeWidth="1.5" />
          </>
        )}
      </svg>

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
