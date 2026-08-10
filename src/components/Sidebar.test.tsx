import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from './Sidebar';
import type { Mode, Range } from '../types';

const renderSidebar = (
  language: 'zh' | 'en',
  mode: Mode,
  range: Range = '1-20',
  lowerOperandDigits: 'mixed' | 'one' | 'two' = 'mixed',
) => renderToStaticMarkup(
  <Sidebar
    range={range}
    setRange={vi.fn()}
    mode={mode}
    setMode={vi.fn()}
    regroup="mixed"
    setRegroup={vi.fn()}
    lowerOperandDigits={lowerOperandDigits}
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
    regenerate={vi.fn()}
    handlePrint={vi.fn()}
    handleDownloadPdf={vi.fn()}
    activeTab="settings"
    setActiveTab={vi.fn()}
  />,
);

const renderVerticalSidebar = (language: 'zh' | 'en') => renderSidebar(language, 'vertical-add');

describe('Sidebar exercise type selection', () => {
  it('shows the selected exercise type when its group is collapsed while retaining its configuration', () => {
    const html = renderSidebar('zh', 'vertical-add');

    expect(html).toContain('算式练习 · 竖排加法');
    expect(html).toContain('练习区间');
  });
});

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

  it('uses the requested regrouping title and option order', () => {
    const chinese = renderSidebar('zh', 'vertical-sub');
    const english = renderSidebar('en', 'vertical-sub');

    expect(chinese).toContain('进退位');
    expect(chinese).toMatch(/不进退位[\s\S]*需进退位[\s\S]*混合/);
    expect(english).toContain('Regrouping');
    expect(english).toMatch(/Without Regrouping[\s\S]*With Regrouping[\s\S]*Mixed/);
  });

  it('hides With Regrouping only for vertical addition within 20', () => {
    expect(renderSidebar('zh', 'vertical-add', '1-20')).not.toContain('需进退位');
    expect(renderSidebar('zh', 'vertical-sub', '1-20')).toContain('需进退位');
    expect(renderSidebar('zh', 'vertical-mixed', '1-20')).toContain('需进退位');
    expect(renderSidebar('zh', 'vertical-add', '1-30', 'one')).toContain('需进退位');
  });

  it('hides With Regrouping for mixed or two-digit vertical addition within 30', () => {
    expect(renderSidebar('zh', 'vertical-add', '1-30', 'mixed')).not.toContain('需进退位');
    expect(renderSidebar('zh', 'vertical-add', '1-30', 'two')).not.toContain('需进退位');
    expect(renderSidebar('zh', 'vertical-add', '1-30', 'one')).toContain('需进退位');
    expect(renderSidebar('zh', 'vertical-add', '1-50', 'two')).toContain('需进退位');
  });

  it('offers Within 200 and Within 500 only for extended vertical practice', () => {
    const chinese = renderSidebar('zh', 'vertical-add', '1-200');
    const english = renderSidebar('en', 'vertical-sub', '1-500');

    expect(chinese).toContain('200以内');
    expect(chinese).toContain('500以内');
    expect(chinese).not.toContain('下方数位数');
    expect(english).toContain('≤200');
    expect(english).toContain('≤500');
    expect(english).not.toContain('Lower Operand Digits');
  });

  it('does not expose the extended ranges to horizontal or fill-in practice', () => {
    for (const mode of [
      'horizontal-add',
      'horizontal-chain-add',
      'horizontal-fill-add',
    ] as const) {
      const html = renderSidebar('zh', mode, '1-200');
      expect(html).not.toContain('200以内');
      expect(html).not.toContain('500以内');
    }
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
