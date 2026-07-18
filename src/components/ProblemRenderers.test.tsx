import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { VerticalArithmetic } from './ProblemRenderers';

const renderVertical = (operator: '+' | '-', regroup: 'mixed' | 'none' | 'only') =>
  renderToStaticMarkup(
    <VerticalArithmetic
      problem={{ id: 1, type: 'arithmetic', num1: 43, num2: 18, operator }}
      index={0}
      regroup={regroup}
    />,
  );

describe('VerticalArithmetic work boxes', () => {
  it('renders one tens-column carry box for addition', () => {
    const markup = renderVertical('+', 'mixed');
    expect(markup.match(/data-work-box=/g)).toHaveLength(1);
    expect(markup).toContain('data-work-box="carry-tens"');
  });

  it('renders tens and ones rewrite boxes for subtraction', () => {
    const markup = renderVertical('-', 'only');
    expect(markup.match(/data-work-box=/g)).toHaveLength(2);
    expect(markup).toContain('data-work-box="borrow-tens"');
    expect(markup).toContain('data-work-box="borrow-ones"');
  });

  it('hides all work boxes when regrouping is disabled', () => {
    expect(renderVertical('+', 'none')).not.toContain('data-work-box=');
    expect(renderVertical('-', 'none')).not.toContain('data-work-box=');
  });
});
