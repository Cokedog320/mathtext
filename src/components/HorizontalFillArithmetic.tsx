import React from 'react';
import { HorizontalFillProblem } from '../types';

interface Props {
  problem: HorizontalFillProblem;
  index: number;
}

export const HORIZONTAL_FILL_TEXT_STYLE = 'text-xl md:text-2xl font-semibold text-gray-800 tracking-wide';

export const HorizontalFillArithmetic: React.FC<Props> = ({ problem, index }) => {
  const { num1, num2, result, operator, blankPosition } = problem;

  return (
    <div className="relative w-[160px] h-full flex items-center justify-between px-2 border border-gray-100 rounded-sm">
      <span className="absolute top-1 left-1 text-[10px] text-gray-400 font-mono">{index + 1}.</span>
      <div className="flex items-center justify-center w-full mt-2 select-none">
        <div className={`flex items-center justify-start ${HORIZONTAL_FILL_TEXT_STYLE} select-none`}>
          {blankPosition === 1 ? (
            <>
              <span className="fill-box" aria-label="blank" />
              <span className="mx-1.5">{operator}</span>
              <span>{num2}</span>
              <span className="mx-1.5">=</span>
              <span>{result}</span>
            </>
          ) : (
            <>
              <span>{num1}</span>
              <span className="mx-1.5">{operator}</span>
              <span className="fill-box" aria-label="blank" />
              <span className="mx-1.5">=</span>
              <span>{result}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
