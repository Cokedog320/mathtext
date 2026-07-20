import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from './Sidebar';
import type { Mode, Range } from '../types';

const renderSidebar = (
  language: 'zh' | 'en',
  mode: Mode,
  range: Range = '1-20'
) => renderToStaticMarkup(
  <Sidebar
    range={range}
    setRange={vi.fn()}
    mode={mode}
    setMode={vi.fn()}
    regroup="mixed"
    setRegroup={vi.fn()}
    lowerOperandDigits="mixed"
    setLowerOperandDigits={vi.fn()}
    makeTenLeft="mixed"
    setMakeTenLeft={vi.fn()}
    hideTen={false}
    setHideTen={vi.fn()}
    hideBondParts={false}
    setHideBondParts={vi.fn()}
    bondNumber={5}
    setBondNumber={vi.fn()}
    bondUseType="practice"
    setBondUseType={vi.fn()}
    isBlankTemplate={false}
    setIsBlankTemplate={vi.fn()}
    language={language}
    setLanguage={vi.fn()}
    isGeneratingPdf={false}
    hasWorksheet
    handleRegenerate={vi.fn()}
    handlePrint={vi.fn()}
    handleDownloadPdf={vi.fn()}
    activeTab="settings"
    setActiveTab={vi.fn()}
  />,
);

const renderVerticalSidebar = (language: 'zh' | 'en') => renderSidebar(language, 'vertical-add');

describe('Sidebar vertical arithmetic settings', () => {
  it('shows the lower-operand selector and omits Within 10 in Chinese', () => {
    const html = renderVerticalSidebar('zh');
    expect(html).toContain('下方数位数');
    expect(html).toContain('一位数与两位数混合');
    expect(html).not.toContain('10以内');
  });

  it('provides the complete equivalent English controls', () => {
    const html = renderVerticalSidebar('en');
    expect(html).toContain('Lower Operand Digits');
    expect(html).toContain('Mixed One- and Two-Digit');
    expect(html).toContain('One Digit');
    expect(html).toContain('Two Digits');
    expect(html).not.toContain('>Within 10<');
  });
});

describe('Sidebar chained arithmetic settings', () => {
  it('shows range and regroup controls without vertical operand settings', () => {
    const html = renderSidebar('zh', 'horizontal-chain-add');

    expect(html).toContain('练习区间');
    expect(html).toContain('进退位');
    expect(html).not.toContain('下方数位数');
  });

  it('hides regroup controls only within 10', () => {
    expect(renderSidebar('zh', 'horizontal-chain-add', '1-10')).not.toContain('进退位');
    expect(renderSidebar('zh', 'horizontal-chain-add', '1-20')).toContain('进退位');
    expect(renderSidebar('zh', 'horizontal-chain-add', '1-30')).toContain('进退位');
  });
});
