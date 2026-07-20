import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Worksheet } from './Worksheet';
import type { Problem } from '../types';

const renderWorksheet = (mode: 'horizontal-add' | 'horizontal-chain-add', problems: Problem[]) =>
  renderToStaticMarkup(
    <Worksheet
      mode={mode}
      range="1-10"
      regroup="mixed"
      language="zh"
      bondNumber={5}
      isBlankTemplate={false}
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
});
