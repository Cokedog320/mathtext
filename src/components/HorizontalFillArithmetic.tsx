import React from 'react';
import { HorizontalFillProblem } from '../types';

interface Props {
  problem: HorizontalFillProblem;
}

export const HORIZONTAL_FILL_TEXT_STYLE = 'text-xl md:text-2xl font-semibold text-gray-800 tracking-wide';

export const HorizontalFillArithmetic: React.FC<Props> = ({ problem }) => {
  const { num1, num2, result, operator, blankPosition } = problem;

  return (
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
  );
};
