import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Dices, Printer, Download, FileQuestion } from 'lucide-react';

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
        cacheBust: true,
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col lg:flex-row font-sans relative">
      {/* Abstract Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-400/10 blur-[120px]"></div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="no-print lg:hidden w-full bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 flex">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-all duration-200 ${
            activeTab === 'settings'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30'
              : 'text-gray-500 hover:text-gray-750'
          }`}
        >
          🛠️ {t.settings}
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-all duration-200 ${
            activeTab === 'preview'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30'
              : 'text-gray-500 hover:text-gray-750'
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
        className={`flex-1 flex-col items-center py-6 px-4 lg:py-10 z-10 overflow-y-auto bg-slate-100/40 min-h-[calc(100vh-53px)] lg:min-h-screen print-preview-container ${
          activeTab === 'preview' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Floating action bar for Mobile Preview Tab */}
        <div className="lg:hidden w-full max-w-[400px] mb-4 flex gap-3 no-print">
          <button
            onClick={regenerate}
            disabled={!hasWorksheet}
            className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-semibold text-sm cursor-pointer"
          >
            <Dices size={16} />
            {t.mobileRegenerate}
          </button>
          <button
            onClick={handlePrint}
            disabled={!hasWorksheet}
            className="flex-1 flex items-center justify-center gap-1 bg-white border border-emerald-200 text-emerald-700 py-3 rounded-xl disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold text-sm cursor-pointer"
          >
            <Printer size={16} />
            {t.mobilePrint}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={!hasWorksheet || isGeneratingPdf}
            className="flex-1 flex items-center justify-center gap-1 bg-white border border-purple-200 text-purple-700 py-3 rounded-xl disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold text-sm cursor-pointer"
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
          <div className="flex flex-1 min-h-[60vh] w-full max-w-2xl items-center justify-center px-6 text-center">
            <div className="flex flex-col items-center gap-4 text-slate-500 animate-fade-in-up">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <FileQuestion size={48} className="text-blue-400" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-700">{t.selectProblemType}</h2>
                <p className="mt-2 text-sm text-slate-500">{t.selectProblemTypeHint}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
