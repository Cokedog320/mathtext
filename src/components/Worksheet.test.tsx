import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Worksheet } from './Worksheet';
import type { Problem, Range } from '../types';

const renderWorksheet = (
  mode: 'horizontal-add' | 'horizontal-chain-add' | 'number-bonds',
  problems: Problem[],
  bondNumber: number | 'mixed' = 5,
  isBlankTemplate = false,
  range: Range = '1-10',
) =>
  renderToStaticMarkup(
    <Worksheet
      mode={mode}
      range={range}
      regroup="mixed"
      language="zh"
      bondNumber={bondNumber}
      isBlankTemplate={isBlankTemplate}
      hideBondParts={false}
      hideTen={false}
      problems={problems}
      generateCount={1}
      worksheetRef={React.createRef<HTMLDivElement>()}
    />
  );

describe('Worksheet arithmetic layout', () => {
  it('fills the page with a four-column, five-row grid for 20 horizontal problems', () => {
    const problems: Problem[] = Array.from({ length: 20 }, (_, id) => ({
      id,
      type: 'arithmetic',
      num1: 2,
      num2: 3,
      operator: '+',
    }));
    const markup = renderWorksheet('horizontal-add', problems);

    expect(markup).toContain('grid-template-columns:repeat(4, minmax(0, 1fr))');
    expect(markup).toContain('grid-template-rows:repeat(5, minmax(0, 1fr))');
    expect(markup).toContain('flex-1');
    expect(markup).toContain('text-2xl');
  });

  it('uses the medium horizontal typography for 1-20 worksheets', () => {
    const problems: Problem[] = [{
      id: 0,
      type: 'arithmetic',
      num1: 19,
      num2: 10,
      operator: '-',
    }];
    const markup = renderWorksheet('horizontal-add', problems, 5, false, '1-20');

    expect(markup).toContain('gap-1.5');
    expect(markup).toContain('text-xl');
  });

  it('fills the page with a three-column, seven-row grid for 20 chained problems', () => {
    const problems: Problem[] = Array.from({ length: 20 }, (_, id) => ({
      id,
      type: 'arithmetic-chain',
      operands: [2, 3, 4],
      operators: ['+', '+'],
    }));
    const markup = renderWorksheet('horizontal-chain-add', problems);

    expect(markup).toContain('grid-template-columns:repeat(3, minmax(0, 1fr))');
    expect(markup).toContain('grid-template-rows:repeat(7, minmax(0, 1fr))');
    expect(markup).toContain('flex-1');
  });

  it('uses the shared 1-20 count and medium typography for chained worksheets', () => {
    const problems: Problem[] = Array.from({ length: 30 }, (_, id) => ({
      id,
      type: 'arithmetic-chain',
      operands: [12, 3, 2],
      operators: ['+', '-'],
    }));
    const markup = renderWorksheet('horizontal-chain-add', problems, 5, false, '1-20');

    expect(markup).toContain('grid-template-rows:repeat(10, minmax(0, 1fr))');
    expect(markup).toContain('gap-1.5');
    expect(markup).toContain('text-xl');
  });
});

describe('Worksheet mixed number-bond layout', () => {
  it('spreads twelve mixed problems across three columns and four rows', () => {
    const problems: Problem[] = Array.from({ length: 12 }, (_, id) => ({
      id,
      type: 'bond',
      top: 3,
      left: 1,
      right: '',
    }));
    const markup = renderWorksheet('number-bonds', problems, 'mixed');

    expect(markup).toContain('w-1/3 h-[180px]');
    expect(markup).toContain('content-between');
  });
});

describe('Worksheet blank number-bond layout', () => {
  it('uses the mixed layout to spread blank-template problems across the page', () => {
    const problems: Problem[] = Array.from({ length: 9 }, (_, id) => ({
      id,
      type: 'bond',
      top: '',
      left: '',
      right: '',
      isBlank: true,
    }));
    const markup = renderWorksheet('number-bonds', problems, 5, true);

    expect(markup).toContain('w-1/3 h-[180px]');
    expect(markup).toContain('content-between');
  });
});

describe('Worksheet single-target number-bond layout', () => {
  it('uses the shared regular layout for target number 5', () => {
    const problems: Problem[] = Array.from({ length: 4 }, (_, id) => ({
      id,
      type: 'bond',
      top: 5,
      left: id + 1,
      right: 4 - id,
    }));
    const markup = renderWorksheet('number-bonds', problems, 5);

    expect(markup).toContain('w-1/3 h-[230px]');
    expect(markup).not.toContain('w-[220px] h-[260px]');
    expect(markup).toContain('content-center');
  });
});
