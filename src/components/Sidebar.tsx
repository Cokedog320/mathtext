import React, { useState, useEffect } from 'react';
import { Mode, Range, RegroupOption, LowerOperandDigits, Language, translations } from '../types';
import { Dices, Printer, Download, Settings2, ChevronDown, ChevronUp } from 'lucide-react';

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
  bondNumber: number | '2-10';
  setBondNumber: (bn: number | '2-10') => void;
  bondUseType: 'practice' | 'study';
  setBondUseType: (but: 'practice' | 'study') => void;
  isBlankTemplate: boolean;
  setIsBlankTemplate: (ib: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isGeneratingPdf: boolean;
  hasWorksheet: boolean;
  handleRegenerate: () => void;
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
  handleRegenerate,
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
    'horizontal-add', 'horizontal-sub', 'horizontal-mixed'
  ];
  const isVerticalMode = mode?.startsWith('vertical-') ?? false;

  // Accordion active sections
  const [methodExpanded, setMethodExpanded] = useState(false);
  const [arithmeticExpanded, setArithmeticExpanded] = useState(false);

  // Sync expanded status when mode changes externally
  useEffect(() => {
    if (mode && methodModes.includes(mode)) {
      setMethodExpanded(true);
      setArithmeticExpanded(false);
    } else if (mode && arithmeticModes.includes(mode)) {
      setArithmeticExpanded(true);
      setMethodExpanded(false);
    }
  }, [mode]);

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRange(e.target.value as Range);
  };

  const handleRegroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRegroup(e.target.value as RegroupOption);
  };

  return (
    <div 
      className={`no-print w-full lg:w-[380px] lg:shrink-0 bg-white/80 backdrop-blur-md lg:border-r border-gray-200 lg:min-h-screen lg:sticky lg:top-0 z-20 flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-53px)] lg:max-h-screen ${
        activeTab === 'settings' ? 'flex' : 'hidden lg:flex'
      }`}
    >
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-gray-200/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shadow-sm border border-blue-200/50">
              <Settings2 size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{t.worksheetTitle}</h2>
          </div>
          <button
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            className="relative w-16 h-8 rounded-full bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
            aria-label={language === 'zh' ? 'Switch to English' : '切换到中文'}
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-bold transition-transform duration-200 ${
                language === 'en' ? 'translate-x-8' : 'translate-x-0'
              }`}
            >
              {language === 'zh' ? '中' : 'EN'}
            </span>
          </button>
        </div>

        {/* Menu Navigation */}
        <div className="flex flex-col gap-3">
          {/* Method Training Accordion */}
          <div className="border border-gray-200/80 rounded-xl overflow-hidden shadow-sm bg-white">
            <button
              onClick={() => {
                setMethodExpanded(!methodExpanded);
                if (!methodExpanded) setArithmeticExpanded(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100/70 transition-all text-sm font-bold text-gray-700 cursor-pointer"
            >
              <span>{language === 'zh' ? '🧠 方法训练' : '🧠 Method Training'}</span>
              {methodExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {methodExpanded && (
              <div className="p-2 flex flex-col gap-1 bg-white animate-fade-in-up">
                {methodModes.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                      mode === m
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {t.modes[m]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Arithmetic Practice Accordion */}
          <div className="border border-gray-200/80 rounded-xl overflow-hidden shadow-sm bg-white">
            <button
              onClick={() => {
                setArithmeticExpanded(!arithmeticExpanded);
                if (!arithmeticExpanded) setMethodExpanded(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100/70 transition-all text-sm font-bold text-gray-700 cursor-pointer"
            >
              <span>{language === 'zh' ? '📝 算式练习' : '📝 Arithmetic Practice'}</span>
              {arithmeticExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {arithmeticExpanded && (
              <div className="p-2 flex flex-col gap-1 bg-white animate-fade-in-up">
                {arithmeticModes.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                      mode === m
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {t.modes[m]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Configurations based on mode selection */}
        <div className="flex flex-col gap-5 border-t border-gray-100 pt-5">
          {mode === 'number-bonds' && (
            <div className="flex flex-col gap-5 animate-fade-in-up">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="bondNumber" className="text-sm font-bold text-gray-700">{t.bondNumber}</label>
                <select 
                  id="bondNumber" 
                  value={bondNumber} 
                  disabled={isBlankTemplate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBondNumber(val === '2-10' ? '2-10' : parseInt(val, 10));
                  }}
                  className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-gray-700 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, '2-10'].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="bondUseTypeStudy"
                    checked={bondUseType === 'study' && !isBlankTemplate}
                    disabled={isBlankTemplate}
                    onChange={(e) => setBondUseType(e.target.checked ? 'study' : 'practice')}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/50 cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="bondUseTypeStudy" className={`text-sm font-semibold text-gray-700 cursor-pointer select-none ${isBlankTemplate ? 'opacity-50 cursor-not-allowed' : ''}`}>{t.bondUseTypeStudy}</label>
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="hideBondParts"
                    checked={hideBondParts && !isBlankTemplate}
                    disabled={isBlankTemplate}
                    onChange={(e) => setHideBondParts(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/50 cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="hideBondParts" className={`text-sm font-semibold text-gray-700 cursor-pointer select-none ${isBlankTemplate ? 'opacity-50 cursor-not-allowed' : ''}`}>{t.hideBondParts}</label>
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="isBlankTemplate"
                    checked={isBlankTemplate}
                    onChange={(e) => setIsBlankTemplate(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/50 cursor-pointer accent-blue-600"
                  />
                  <label htmlFor="isBlankTemplate" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">{t.blankTemplate}</label>
                </div>
              </div>
            </div>
          )}

          {mode === 'make-ten' && (
            <div className="flex flex-col gap-5 animate-fade-in-up">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="makeTenLeft" className="text-sm font-bold text-gray-800">{t.makeTenLeft}</label>
                <select 
                  id="makeTenLeft" 
                  value={makeTenLeft} 
                  onChange={(e) => setMakeTenLeft(e.target.value)}
                  className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-gray-700 cursor-pointer transition-all duration-200"
                >
                  <option value="mixed">{t.makeTenLeftOptions.mixed}</option>
                  <option value="9">{t.makeTenLeftOptions['9']}</option>
                  <option value="8">{t.makeTenLeftOptions['8']}</option>
                  <option value="7">{t.makeTenLeftOptions['7']}</option>
                  <option value="6">{t.makeTenLeftOptions['6']}</option>
                  <option value="5">{t.makeTenLeftOptions['5']}</option>
                </select>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="hideTen"
                  checked={hideTen}
                  onChange={(e) => setHideTen(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/50 cursor-pointer accent-blue-600"
                />
                <label htmlFor="hideTen" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">{t.hideTen}</label>
              </div>
            </div>
          )}

          {['break-ten', 'flat-ten'].includes(mode) && (
            <div className="flex items-center gap-2.5 pt-2 animate-fade-in-up">
              <input
                type="checkbox"
                id="hideTen"
                checked={hideTen}
                onChange={(e) => setHideTen(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/50 cursor-pointer accent-blue-600"
              />
              <label htmlFor="hideTen" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">{t.hideTen}</label>
            </div>
          )}

          {mode && arithmeticModes.includes(mode) && (
            <div className="flex flex-col gap-5 animate-fade-in-up">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="range" className="text-sm font-bold text-gray-800">{t.range}</label>
                <select 
                  id="range" 
                  value={range} 
                  onChange={handleRangeChange}
                  className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-gray-700 cursor-pointer transition-all duration-200"
                >
                  {!isVerticalMode && (
                    <option value="1-10">
                      {language === 'zh' ? '10以内' : 'Within 10'}
                    </option>
                  )}
                  <option value="1-20" disabled={isVerticalMode && lowerOperandDigits === 'two'}>
                    {language === 'zh' ? '20以内' : 'Within 20'}
                  </option>
                  <option value="1-30">
                    {language === 'zh' ? '30以内' : 'Within 30'}
                  </option>
                  <option value="1-50">
                    {language === 'zh' ? '50以内' : 'Within 50'}
                  </option>
                  <option value="1-100">
                    {language === 'zh' ? '100以内' : 'Within 100'}
                  </option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="regroup" className="text-sm font-bold text-gray-800">{t.regroup}</label>
                <select 
                  id="regroup" 
                  value={regroup} 
                  onChange={handleRegroupChange}
                  className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-gray-700 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="mixed">{t.regroupOptions.mixed}</option>
                  <option value="none">{t.regroupOptions.none}</option>
                  <option value="only">{t.regroupOptions.only}</option>
                </select>
              </div>

              {isVerticalMode && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lowerOperandDigits" className="text-sm font-bold text-gray-800">{t.lowerOperandDigits}</label>
                  <select
                    id="lowerOperandDigits"
                    value={lowerOperandDigits}
                    onChange={(event) => setLowerOperandDigits(event.target.value as LowerOperandDigits)}
                    className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-gray-700 cursor-pointer transition-all duration-200"
                  >
                    <option value="mixed">{t.lowerOperandDigitOptions.mixed}</option>
                    <option value="one">{t.lowerOperandDigitOptions.one}</option>
                    <option value="two">{t.lowerOperandDigitOptions.two}</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Buttons */}
      <div className="p-6 border-t border-gray-200 bg-white/60 flex flex-col gap-3">
        <button 
          onClick={handleRegenerate}
          disabled={!hasWorksheet}
          className="w-full group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-md disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 font-semibold cursor-pointer"
        >
          <Dices size={18} className="group-hover:rotate-180 transition-transform duration-500" /> 
          {t.regenerate}
        </button>

        <button 
          onClick={() => setActiveTab('preview')}
          className="lg:hidden w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl transition-all duration-200 font-semibold cursor-pointer"
        >
          {t.viewPreview} 📄
        </button>

        <div className="hidden lg:flex gap-3">
          <button 
            onClick={handlePrint}
            disabled={!hasWorksheet}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-emerald-200 text-emerald-700 py-2.5 rounded-xl hover:bg-emerald-50 disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm cursor-pointer"
          >
            <Printer size={16} /> 
            {t.print}
          </button>
          <button 
            onClick={handleDownloadPdf}
            disabled={!hasWorksheet || isGeneratingPdf}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-purple-200 text-purple-700 py-2.5 rounded-xl hover:bg-purple-50 disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm cursor-pointer"
          >
            <Download size={16} /> 
            {isGeneratingPdf ? (language === 'zh' ? '生成中...' : 'Generating...') : t.downloadPdf}
          </button>
        </div>
      </div>
    </div>
  );
};
