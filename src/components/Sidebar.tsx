import React, { useState, useEffect } from 'react';
import { Mode, Range, RegroupOption, LowerOperandDigits, Language, translations } from '../types';
import { isRegroupOptionAvailable } from '../utils/regroupOptions';
import { isExtendedVerticalRange } from '../utils/generator/worksheetRules';
import { Dices, Printer, Download, Settings2, ChevronRight, ChevronDown } from 'lucide-react';

interface SidebarProps {
  range: Range;
  setRange: (r: Range) => void;
  mode: Mode | null;
  setMode: (m: Mode) => void;
  regroup: RegroupOption;
  setRegroup: (rg: RegroupOption) => void;
  lowerOperandDigits: LowerOperandDigits;
  setLowerOperandDigits: (digits: LowerOperandDigits) => void;
  makeTenLeft: string;
  setMakeTenLeft: (mtl: string) => void;
  hideTen: boolean;
  setHideTen: (ht: boolean) => void;
  hideBondParts: boolean;
  setHideBondParts: (hbp: boolean) => void;
  bondNumber: number | 'mixed';
  setBondNumber: (bn: number | 'mixed') => void;
  bondUseType: 'practice' | 'study';
  setBondUseType: (but: 'practice' | 'study') => void;
  isBlankTemplate: boolean;
  setIsBlankTemplate: (ib: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isGeneratingPdf: boolean;
  hasWorksheet: boolean;
  regenerate: () => void;
  handlePrint: () => void;
  handleDownloadPdf: () => void;
  activeTab: 'settings' | 'preview';
  setActiveTab: (tab: 'settings' | 'preview') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  range, setRange,
  mode, setMode,
  regroup, setRegroup,
  lowerOperandDigits, setLowerOperandDigits,
  makeTenLeft, setMakeTenLeft,
  hideTen, setHideTen,
  hideBondParts, setHideBondParts,
  bondNumber, setBondNumber,
  bondUseType, setBondUseType,
  isBlankTemplate, setIsBlankTemplate,
  language, setLanguage,
  isGeneratingPdf,
  hasWorksheet,
  regenerate,
  handlePrint,
  handleDownloadPdf,
  activeTab,
  setActiveTab
}) => {
  const t = translations[language];

  // Group mappings
  const methodModes: Mode[] = ['number-bonds', 'make-ten', 'break-ten', 'flat-ten'];
  const arithmeticModes: Mode[] = [
    'vertical-add', 'vertical-sub', 'vertical-mixed',
    'horizontal-add', 'horizontal-sub', 'horizontal-mixed',
    'horizontal-chain-add', 'horizontal-chain-sub', 'horizontal-chain-mixed'
  ];
  const fillModes: Mode[] = [
    'horizontal-fill-add', 'horizontal-fill-sub', 'horizontal-fill-mixed'
  ];
  const isVerticalMode = mode?.startsWith('vertical-') ?? false;
  const isExtendedRange = isExtendedVerticalRange(range);
  const regroupOptions: RegroupOption[] = ['none', 'only', 'mixed'];
  const availableRegroupOptions = mode
    ? regroupOptions.filter(option => isRegroupOptionAvailable(range, mode, option, lowerOperandDigits))
    : regroupOptions;

  const modeGroups: { label: string; modes: Mode[] }[] = [
    { label: t.sectionMethod, modes: methodModes },
    { label: t.sectionArithmetic, modes: arithmeticModes },
    { label: t.sectionFill, modes: fillModes },
  ];

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  // Auto-expand the group containing the current mode
  useEffect(() => {
    if (!mode) return;
    const group = modeGroups.find(g => g.modes.includes(mode));
    if (group) {
      setExpandedGroups(prev => {
        if (prev.has(group.label)) return prev;
        const next = new Set(prev);
        next.add(group.label);
        return next;
      });
    }
  }, [mode]);

  return (
    <div
      className={`no-print w-full lg:w-[380px] lg:shrink-0 bg-white lg:border-r border-stone-200 lg:min-h-screen lg:sticky lg:top-0 z-20 flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-53px)] lg:max-h-screen ${
        activeTab === 'settings' ? 'flex' : 'hidden lg:flex'
      }`}
    >
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg border border-amber-200/50">
              <Settings2 size={20} />
            </div>
            <h2 className="text-xl font-bold text-stone-800">{t.worksheetTitle}</h2>
          </div>
          <div className="flex rounded-lg border border-stone-200 overflow-hidden">
            {(['zh', 'en'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                  language === lang
                    ? 'bg-amber-700 text-white'
                    : 'bg-white text-stone-500 hover:bg-stone-50'
                }`}
                aria-label={lang === 'zh' ? '切换到中文' : 'Switch to English'}
              >
                {lang === 'zh' ? '中' : 'EN'}
              </button>
            ))}
          </div>
        </div>

        {/* Mode grid */}
        <div className="flex flex-col gap-4">
          {modeGroups.map(group => (
            <div key={group.label}>
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 cursor-pointer hover:text-stone-600 transition-colors"
              >
                {group.label}
                {expandedGroups.has(group.label) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {expandedGroups.has(group.label) && (
                <div className="grid grid-cols-2 gap-1.5">
                  {group.modes.map(m => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                        mode === m
                          ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
                          : 'text-stone-600 hover:bg-stone-50 border border-transparent'
                      }`}
                    >
                      {t.modes[m]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Config section */}
        <div className="flex flex-col gap-5 border-t border-stone-200 pt-5">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t.sectionConfig}</div>
          {mode === 'number-bonds' && (
            <div className="flex flex-col gap-4 animate-fade-in-up">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="bondNumber" className="text-sm font-bold text-stone-700">{t.bondNumber}</label>
                <select
                  id="bondNumber"
                  value={bondNumber}
                  disabled={isBlankTemplate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBondNumber(val === 'mixed' ? 'mixed' : parseInt(val, 10));
                  }}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-medium text-stone-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, 'mixed'].map(n => (
                    <option key={n} value={n}>{n === 'mixed' ? (language === 'zh' ? '混合' : 'Mixed') : n}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="bondUseTypeStudy"
                    checked={bondUseType === 'study' && !isBlankTemplate}
                    disabled={isBlankTemplate}
                    onChange={(e) => setBondUseType(e.target.checked ? 'study' : 'practice')}
                    className="w-4 h-4 rounded border-stone-300 text-amber-700 focus:ring-amber-500/50 cursor-pointer accent-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="bondUseTypeStudy" className={`text-sm font-medium text-stone-700 cursor-pointer select-none ${isBlankTemplate ? 'opacity-50 cursor-not-allowed' : ''}`}>{t.bondUseTypeStudy}</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hideBondParts"
                    checked={hideBondParts && !isBlankTemplate}
                    disabled={isBlankTemplate}
                    onChange={(e) => setHideBondParts(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-amber-700 focus:ring-amber-500/50 cursor-pointer accent-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="hideBondParts" className={`text-sm font-medium text-stone-700 cursor-pointer select-none ${isBlankTemplate ? 'opacity-50 cursor-not-allowed' : ''}`}>{t.hideBondParts}</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isBlankTemplate"
                    checked={isBlankTemplate}
                    onChange={(e) => setIsBlankTemplate(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-amber-700 focus:ring-amber-500/50 cursor-pointer accent-amber-700"
                  />
                  <label htmlFor="isBlankTemplate" className="text-sm font-medium text-stone-700 cursor-pointer select-none">{t.blankTemplate}</label>
                </div>
              </div>
            </div>
          )}

          {mode === 'make-ten' && (
            <div className="flex flex-col gap-4 animate-fade-in-up">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="makeTenLeft" className="text-sm font-bold text-stone-700">{t.makeTenLeft}</label>
                <select
                  id="makeTenLeft"
                  value={makeTenLeft}
                  onChange={(e) => setMakeTenLeft(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-medium text-stone-700 cursor-pointer"
                >
                  <option value="mixed">{t.makeTenLeftOptions.mixed}</option>
                  <option value="9">{t.makeTenLeftOptions['9']}</option>
                  <option value="8">{t.makeTenLeftOptions['8']}</option>
                  <option value="7">{t.makeTenLeftOptions['7']}</option>
                  <option value="6">{t.makeTenLeftOptions['6']}</option>
                  <option value="5">{t.makeTenLeftOptions['5']}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hideTen"
                  checked={hideTen}
                  onChange={(e) => setHideTen(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-amber-700 focus:ring-amber-500/50 cursor-pointer accent-amber-700"
                />
                <label htmlFor="hideTen" className="text-sm font-medium text-stone-700 cursor-pointer select-none">{t.hideTen}</label>
              </div>
            </div>
          )}

          {['break-ten', 'flat-ten'].includes(mode) && (
            <div className="flex items-center gap-2 animate-fade-in-up">
              <input
                type="checkbox"
                id="hideTen"
                checked={hideTen}
                onChange={(e) => setHideTen(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-amber-700 focus:ring-amber-500/50 cursor-pointer accent-amber-700"
              />
              <label htmlFor="hideTen" className="text-sm font-medium text-stone-700 cursor-pointer select-none">{t.hideTen}</label>
            </div>
          )}

          {mode && (arithmeticModes.includes(mode) || fillModes.includes(mode)) && (
            <div className="flex flex-col gap-4 animate-fade-in-up">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-stone-700">{t.range}</label>
                <div className="flex flex-wrap gap-1.5">
                  {([
                    ...(!isVerticalMode ? ['1-10' as Range] : []),
                    '1-20' as Range,
                    '1-30' as Range,
                    '1-50' as Range,
                    '1-100' as Range,
                    ...(isVerticalMode ? ['1-200' as Range, '1-500' as Range] : []),
                  ]).map(r => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      disabled={r === '1-20' && isVerticalMode && lowerOperandDigits === 'two'}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                        range === r
                          ? 'bg-amber-700 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {language === 'zh' ? `${r.split('-')[1]}以内` : `≤${r.split('-')[1]}`}
                    </button>
                  ))}
                </div>
              </div>

              {range !== '1-10' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-stone-700">{t.regroup}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableRegroupOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => setRegroup(option)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          regroup === option
                            ? 'bg-amber-700 text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {t.regroupOptions[option]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isVerticalMode && !isExtendedRange && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-stone-700">{t.lowerOperandDigits}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['mixed', 'one', 'two'] as LowerOperandDigits[]).map(d => (
                      <button
                        key={d}
                        onClick={() => setLowerOperandDigits(d)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          lowerOperandDigits === d
                            ? 'bg-amber-700 text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {t.lowerOperandDigitOptions[d]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Buttons */}
      <div className="p-6 border-t border-stone-200 flex flex-col gap-3">
        <button
          onClick={regenerate}
          disabled={!hasWorksheet}
          className="w-full flex items-center justify-center gap-2 bg-amber-700 text-white py-3 rounded-lg hover:bg-amber-800 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed font-semibold cursor-pointer transition-colors"
        >
          <Dices size={18} />
          {t.regenerate}
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className="lg:hidden w-full flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-lg font-semibold cursor-pointer transition-colors"
        >
          {t.viewPreview} 📄
        </button>

        <div className="hidden lg:flex gap-3">
          <button
            onClick={handlePrint}
            disabled={!hasWorksheet}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-stone-300 text-stone-700 py-2.5 rounded-lg hover:bg-stone-50 disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed font-semibold text-sm cursor-pointer transition-colors"
          >
            <Printer size={16} />
            {t.print}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={!hasWorksheet || isGeneratingPdf}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-stone-300 text-stone-700 py-2.5 rounded-lg hover:bg-stone-50 disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed font-semibold text-sm cursor-pointer transition-colors"
          >
            <Download size={16} />
            {isGeneratingPdf ? (language === 'zh' ? '生成中...' : 'Generating...') : t.downloadPdf}
          </button>
        </div>
      </div>
    </div>
  );
};
