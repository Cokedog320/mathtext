import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Dices, Printer, Download } from 'lucide-react';

import { Language, Range, Mode, RegroupOption, LowerOperandDigits, Problem, translations, pdfFileNames } from './types';
import { generateProblems, getRequestedProblemCount } from './utils/problemGenerator';
import { DEFAULT_REGROUP_OPTION, normalizeRegroupOption } from './utils/regroupOptions';
import { normalizeRangeForMode } from './utils/generator/worksheetRules';
import { Sidebar } from './components/Sidebar';
import { Worksheet } from './components/Worksheet';

export { generateProblems } from './utils/problemGenerator';
export type { Problem } from './types';


const LANGUAGE_KEY = 'math-language';

export default function App() {
  const [range, setRange] = useState<Range>('1-10');
  const [mode, setMode] = useState<Mode | null>(null);
  const [regroup, setRegroup] = useState<RegroupOption>(DEFAULT_REGROUP_OPTION);
  const [lowerOperandDigits, setLowerOperandDigits] = useState<LowerOperandDigits>('mixed');
  const [makeTenLeft, setMakeTenLeft] = useState<string>('mixed');
  const [hideTen, setHideTen] = useState<boolean>(false);
  const [hideBondParts, setHideBondParts] = useState<boolean>(false);
  const [bondNumber, setBondNumber] = useState<number | 'mixed'>(2);
  const [bondUseType, setBondUseType] = useState<'practice' | 'study'>('practice');
  const [isBlankTemplate, setIsBlankTemplate] = useState<boolean>(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [generationLimit, setGenerationLimit] = useState<{ actual: number; requested: number } | null>(null);
  const [generateCount, setGenerateCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'settings' | 'preview'>('settings');
  const [language, setLanguage] = useState<Language>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(LANGUAGE_KEY) : null;
    return saved === 'en' ? 'en' : 'zh';
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const worksheetRef = useRef<HTMLDivElement>(null);

  const t = translations[language];
  const hasWorksheet = mode !== null && problems.length > 0;

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const regenerate = () => {
    if (!mode) return;
    const generated = generateProblems(
      range,
      mode,
      regroup,
      makeTenLeft,
      bondUseType,
      bondNumber,
      isBlankTemplate,
      lowerOperandDigits,
    );
    const requestedCount = getRequestedProblemCount(range, mode, bondNumber, isBlankTemplate);
    setProblems(generated);
    setGenerationLimit(
      generated.length < requestedCount
        ? { actual: generated.length, requested: requestedCount }
        : null
    );
    setGenerateCount(c => c + 1);
  };

  useEffect(() => {
    if (mode) {
      regenerate();
    }
  }, [range, mode, regroup, makeTenLeft, bondUseType, bondNumber, isBlankTemplate, lowerOperandDigits]);

  const handleRangeChange = (nextRange: Range) => {
    const normalizedRange = mode ? normalizeRangeForMode(nextRange, mode) : nextRange;
    setRange(normalizedRange);
    if (mode) {
      setRegroup(normalizeRegroupOption(normalizedRange, mode, regroup, lowerOperandDigits));
    }
  };

  const handleModeChange = (nextMode: Mode) => {
    if (nextMode === mode) return;

    setProblems([]);
    setGenerationLimit(null);
    const adjustedRange = nextMode.startsWith('vertical-') && (range === '1-10' || (range === '1-20' && lowerOperandDigits === 'two'))
      ? (lowerOperandDigits === 'two' ? '1-30' : '1-20')
      : range;
    const nextRange = normalizeRangeForMode(adjustedRange, nextMode);
    if (nextRange !== range) {
      setRange(nextRange);
    }
    setRegroup(normalizeRegroupOption(nextRange, nextMode, regroup, lowerOperandDigits));
    setMode(nextMode);
  };

  const handleLowerOperandDigitsChange = (digits: LowerOperandDigits) => {
    const nextRange = digits === 'two' && range === '1-20' ? '1-30' : range;
    if (nextRange !== range) setRange(nextRange);
    if (mode) setRegroup(normalizeRegroupOption(nextRange, mode, regroup, digits));
    setLowerOperandDigits(digits);
  };

  const handlePrint = () => {
    if (hasWorksheet) window.print();
  };

  const handleDownloadPdf = async () => {
    if (!mode || !worksheetRef.current || !hasWorksheet || isGeneratingPdf) return;

    setIsGeneratingPdf(true);
    try {
      const worksheet = worksheetRef.current;
      const dataUrl = await toPng(worksheet, {
        cacheBust: false,
        pixelRatio: 2,
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (img.height * pdfWidth) / img.width;

      if (!Number.isFinite(pdfHeight) || pdfHeight <= 0) {
        throw new Error(`Invalid PDF height: ${pdfHeight}`);
      }

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      let fileName = pdfFileNames[language][mode];
      if (mode === 'number-bonds') {
        fileName = isBlankTemplate
          ? (language === 'zh' ? '数字分解与组合模板.pdf' : 'decomposition-composition-template.pdf')
          : bondNumber === 'mixed'
            ? (language === 'zh' ? '混合数字的分解与组合.pdf' : 'mixed-decomposition-composition.pdf')
            : (language === 'zh' ? `数字${bondNumber}的分解与组合.pdf` : `decomposition-composition-${bondNumber}.pdf`);
      }
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert(language === 'zh' ? 'PDF 生成失败，请重试。' : 'Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col lg:flex-row font-sans relative">

      {/* Mobile Tab Switcher */}
      <div className="no-print lg:hidden w-full bg-white border-b border-stone-200 sticky top-0 z-30 flex">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'text-amber-700 border-b-2 border-amber-700'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          🛠️ {t.settings}
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-colors cursor-pointer ${
            activeTab === 'preview'
              ? 'text-amber-700 border-b-2 border-amber-700'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          📄 {t.preview}
        </button>
      </div>

      {/* Settings Sidebar */}
      <Sidebar
        range={range} setRange={handleRangeChange}
        mode={mode} setMode={handleModeChange}
        regroup={regroup} setRegroup={setRegroup}
        lowerOperandDigits={lowerOperandDigits} setLowerOperandDigits={handleLowerOperandDigitsChange}
        makeTenLeft={makeTenLeft} setMakeTenLeft={setMakeTenLeft}
        hideTen={hideTen} setHideTen={setHideTen}
        hideBondParts={hideBondParts} setHideBondParts={setHideBondParts}
        bondNumber={bondNumber} setBondNumber={setBondNumber}
        bondUseType={bondUseType} setBondUseType={setBondUseType}
        isBlankTemplate={isBlankTemplate} setIsBlankTemplate={setIsBlankTemplate}
        language={language} setLanguage={setLanguage}
        isGeneratingPdf={isGeneratingPdf}
        hasWorksheet={hasWorksheet}
        regenerate={regenerate}
        handlePrint={handlePrint}
        handleDownloadPdf={handleDownloadPdf}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Preview area */}
      <div
        className={`flex-1 flex-col items-center py-6 px-4 lg:py-10 z-10 overflow-y-auto min-h-[calc(100vh-53px)] lg:min-h-screen print-preview-container ${
          activeTab === 'preview' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Floating action bar for Mobile Preview Tab */}
        <div className="lg:hidden w-full max-w-[400px] mb-4 flex gap-3 no-print">
          <button
            onClick={regenerate}
            disabled={!hasWorksheet}
            className="flex-1 flex items-center justify-center gap-1 bg-amber-700 text-white py-3 rounded-lg hover:bg-amber-800 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed font-semibold text-sm cursor-pointer transition-colors"
          >
            <Dices size={16} />
            {t.mobileRegenerate}
          </button>
          <button
            onClick={handlePrint}
            disabled={!hasWorksheet}
            className="flex-1 flex items-center justify-center gap-1 bg-white border border-stone-300 text-stone-700 py-3 rounded-lg hover:bg-stone-50 disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed font-semibold text-sm cursor-pointer transition-colors"
          >
            <Printer size={16} />
            {t.mobilePrint}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={!hasWorksheet || isGeneratingPdf}
            className="flex-1 flex items-center justify-center gap-1 bg-white border border-stone-300 text-stone-700 py-3 rounded-lg hover:bg-stone-50 disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed font-semibold text-sm cursor-pointer transition-colors"
          >
            <Download size={16} />
            {isGeneratingPdf ? (language === 'zh' ? '生成中...' : '...') : t.mobileDownload}
          </button>
        </div>

        {mode ? (
          <>
            {generationLimit && (
              <div role="status" className="no-print mb-3 w-full max-w-[794px] rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                {t.limitedProblemCount(generationLimit.actual, generationLimit.requested)}
              </div>
            )}
            <Worksheet
              mode={mode}
              range={range}
              regroup={regroup}
              language={language}
              bondNumber={bondNumber}
              isBlankTemplate={isBlankTemplate}
              hideBondParts={hideBondParts}
              hideTen={hideTen}
              problems={problems}
              generateCount={generateCount}
              worksheetRef={worksheetRef}
            />
          </>
        ) : (
          <div className="flex flex-1 min-h-[60vh] w-full max-w-2xl items-center justify-center px-6">
            <div className="w-full max-w-[400px] border-2 border-dashed border-stone-300 rounded-lg bg-white/60 p-8 flex flex-col items-center gap-6 animate-fade-in-up">
              <div className="w-full flex flex-col gap-3 opacity-30">
                <div className="h-3 bg-stone-300 rounded w-1/3 mx-auto"></div>
                <div className="h-2 bg-stone-200 rounded w-full"></div>
                <div className="h-2 bg-stone-200 rounded w-full"></div>
                <div className="h-2 bg-stone-200 rounded w-2/3"></div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="h-8 border border-stone-200 rounded"></div>
                  <div className="h-8 border border-stone-200 rounded"></div>
                  <div className="h-8 border border-stone-200 rounded"></div>
                  <div className="h-8 border border-stone-200 rounded"></div>
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-stone-600">{t.selectProblemType}</h2>
                <p className="mt-2 text-sm text-stone-400">{t.selectProblemTypeHint}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
