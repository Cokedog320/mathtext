import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ChainedArithmetic, HorizontalArithmetic, HorizontalFillArithmetic, MethodDiagram, VerticalArithmetic } from './ProblemRenderers';

const renderVertical = (
  operator: '+' | '-',
  regroup: 'mixed' | 'none' | 'only',
  num1 = 43,
  num2 = 18,
) =>
  renderToStaticMarkup(
    <VerticalArithmetic
      problem={{ id: 1, type: 'arithmetic', num1, num2, operator }}
      index={0}
      regroup={regroup}
    />,
  );

describe('VerticalArithmetic work boxes', () => {
  it('renders one tens-column carry box for addition', () => {
    const markup = renderVertical('+', 'mixed');
    expect(markup.match(/data-work-box=/g)).toHaveLength(1);
    expect(markup).toContain('data-work-box="carry-tens"');
    expect(markup).toContain('fill-box');
  });

  it('renders tens and ones rewrite boxes for subtraction', () => {
    const markup = renderVertical('-', 'only');
    expect(markup.match(/data-work-box=/g)).toHaveLength(2);
    expect(markup).toContain('data-work-box="borrow-tens"');
    expect(markup).toContain('data-work-box="borrow-ones"');
    expect(markup.match(/fill-box/g)).toHaveLength(2);
  });

  it('hides all work boxes when regrouping is disabled', () => {
    expect(renderVertical('+', 'none')).not.toContain('data-work-box=');
    expect(renderVertical('-', 'none')).not.toContain('data-work-box=');
  });

  it('keeps work boxes on every non-regrouping equation in a mixed worksheet', () => {
    expect(renderVertical('+', 'mixed', 43, 15)).toContain('data-work-box="carry-tens"');
    expect(renderVertical('-', 'mixed', 43, 12)).toContain('data-work-box="borrow-tens"');
    expect(renderVertical('-', 'mixed', 43, 12)).toContain('data-work-box="borrow-ones"');
  });

  it('renders three aligned columns and carry boxes for three-digit addition', () => {
    const markup = renderVertical('+', 'mixed', 198, 27);
    const visibleText = markup.replace(/<[^>]+>/g, '').replace(/\s+/g, '');

    expect(visibleText).toContain('1.198+27');
    expect(markup).toContain('grid-cols-[30px_42px_42px_42px]');
    expect(markup.match(/data-work-box=/g)).toHaveLength(2);
    expect(markup).toContain('data-work-box="carry-hundreds"');
    expect(markup).toContain('data-work-box="carry-tens"');
    expect(markup).not.toContain('data-work-box="carry-ones"');
  });

  it('uses the three-digit result width for two-digit addition operands', () => {
    const markup = renderVertical('+', 'mixed', 99, 99);

    expect(markup).toContain('grid-cols-[30px_42px_42px_42px]');
    expect(markup.match(/data-work-box=/g)).toHaveLength(2);
    expect(markup).toContain('data-work-box="carry-hundreds"');
    expect(markup).toContain('data-work-box="carry-tens"');
  });

  it('renders three rewrite boxes for three-digit subtraction', () => {
    const markup = renderVertical('-', 'only', 402, 187);
    const visibleText = markup.replace(/<[^>]+>/g, '').replace(/\s+/g, '');

    expect(visibleText).toContain('1.402-187');
    expect(markup.match(/data-work-box=/g)).toHaveLength(3);
    expect(markup).toContain('data-work-box="borrow-hundreds"');
    expect(markup).toContain('data-work-box="borrow-tens"');
    expect(markup).toContain('data-work-box="borrow-ones"');
  });
});

describe('ChainedArithmetic', () => {
  it('renders all three operands and both operators in order', () => {
    const markup = renderToStaticMarkup(
      <ChainedArithmetic
        problem={{
          id: 1,
          type: 'arithmetic-chain',
          operands: [8, 2, 3],
          operators: ['+', '-'],
        }}
        index={0}
        range="1-10"
      />,
    );
    const visibleText = markup.replace(/<[^>]+>/g, '').replace(/\s+/g, '');

    expect(visibleText).toContain('1.8+2-3=');
    expect(markup).toContain('gap-2');
    expect(markup).toContain('text-2xl');
    expect(markup).toContain('fill-box');
    expect(markup).not.toContain('w-[28px] h-[28px]');
  });

  it('uses compact typography for longer chained worksheets', () => {
    const markup = renderToStaticMarkup(
      <ChainedArithmetic
        problem={{
          id: 1,
          type: 'arithmetic-chain',
          operands: [100, 20, 10],
          operators: ['+', '-'],
        }}
        index={0}
        range="1-100"
      />,
    );

    expect(markup).toContain('gap-1');
    expect(markup).toContain('text-lg');
  });
});

describe('HorizontalArithmetic', () => {
  const renderHorizontal = (range: '1-10' | '1-20' | '1-100', num1 = 100, num2 = 99) =>
    renderToStaticMarkup(
      <HorizontalArithmetic
        problem={{ id: 1, type: 'arithmetic', num1, num2, operator: '-' }}
        index={0}
        range={range}
      />,
    );

  it('uses larger typography for the 1-10 and 1-20 worksheets', () => {
    const tenMarkup = renderHorizontal('1-10', 8, 2);
    const twentyMarkup = renderHorizontal('1-20', 19, 10);

    expect(tenMarkup).toContain('gap-2');
    expect(tenMarkup).toContain('text-2xl');
    expect(twentyMarkup).toContain('gap-1.5');
    expect(twentyMarkup).toContain('text-xl');
  });

  it('uses compact typography that keeps ordinary equations inside their cards', () => {
    const markup = renderHorizontal('1-100');

    expect(markup).toContain('px-1');
    expect(markup).toContain('gap-1');
    expect(markup).toContain('text-lg');
    expect(markup).toContain('whitespace-nowrap');
    expect(markup).not.toContain('gap-1.5');
    expect(markup).not.toContain('text-xl');
    expect(markup).not.toContain('gap-2.5');
    expect(markup).not.toContain('md:text-2xl');
    expect(markup).toContain('fill-box');
  });
});

describe('HorizontalFillArithmetic', () => {
  const renderFill = (range: '1-10' | '1-20' | '1-100') =>
    renderToStaticMarkup(
      <HorizontalFillArithmetic
        problem={{
          id: 1,
          type: 'horizontal-fill',
          num1: 12,
          num2: 7,
          result: 19,
          operator: '+',
          blankPosition: 2,
        }}
        index={0}
        range={range}
      />,
    );

  it('uses the same range-based typography and spacing as horizontal arithmetic', () => {
    const tenMarkup = renderFill('1-10');
    const hundredMarkup = renderFill('1-100');

    expect(tenMarkup).toContain('px-1');
    expect(tenMarkup).toContain('gap-2');
    expect(tenMarkup).toContain('text-2xl');
    expect(hundredMarkup).toContain('gap-1');
    expect(hundredMarkup).toContain('text-lg');
    expect(hundredMarkup).toContain('whitespace-nowrap');
    expect(hundredMarkup).not.toContain('tracking-wide');
    expect(hundredMarkup).not.toContain('md:text-2xl');
  });
});

describe('MethodDiagram', () => {
  it('matches the make-ten connector geometry used by dev', () => {
    const markup = renderToStaticMarkup(
      <MethodDiagram
        problem={{ id: 1, type: 'method', num1: 7, num2: 3, operator: '+', method: 'make-ten' }}
      />,
    );

    expect(markup).toContain('x1="120" y1="88" x2="120" y2="116"');
    expect(markup).toContain('x1="72" y1="116" x2="120" y2="116"');
    expect(markup).toContain('x1="120" y1="116" x2="164" y2="116"');
    expect(markup).toContain('x1="164" y1="116" x2="164" y2="30"');
    expect(markup).toContain('x="96" y="112"');
  });
});
