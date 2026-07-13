import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Dices, Printer, Download } from 'lucide-react';

import { Language, Range, Mode, RegroupOption, Problem, translations } from './types';
import { generateProblems, getPrintTitle } from './utils/problemGenerator';
import { Sidebar } from './components/Sidebar';
import { Worksheet } from './components/Worksheet';

export { generateProblems } from './utils/problemGenerator';
export type { Problem } from './types';


const LANGUAGE_KEY = 'math-language';

const pdfFileNames: Record<Language, Record<Mode, string>> = {
  zh: {
    'number-bonds': '数字组合.pdf',
    'vertical-add': '竖排加法.pdf',
    'vertical-sub': '竖排减法.pdf',
    'vertical-mixed': '竖排混合.pdf',
    'horizontal-add': '横排加法.pdf',
    'horizontal-sub': '横排减法.pdf',
    'horizontal-mixed': '横排混合.pdf',
    'make-ten': '凑十法.pdf',
    'break-ten': '破十法.pdf',
    'flat-ten': '平十法.pdf',
  },
  en: {
    'number-bonds': 'number-bonds.pdf',
    'vertical-add': 'vertical-addition.pdf',
    'vertical-sub': 'vertical-subtraction.pdf',
    'vertical-mixed': 'vertical-arithmetic.pdf',
    'horizontal-add': 'horizontal-addition.pdf',
    'horizontal-sub': 'horizontal-subtraction.pdf',
    'horizontal-mixed': 'horizontal-arithmetic.pdf',
    'make-ten': 'make-ten.pdf',
    'break-ten': 'break-ten.pdf',
    'flat-ten': 'flat-ten.pdf',
  },
};

export default function App() {
  const [range, setRange] = useState<Range>('1-10');
  const [mode, setMode] = useState<Mode>('number-bonds');
  const [regroup, setRegroup] = useState<RegroupOption>('mixed');
  const [makeTenLeft, setMakeTenLeft] = useState<string>('mixed');
  const [hideTen, setHideTen] = useState<boolean>(false);
  const [hideBondParts, setHideBondParts] = useState<boolean>(false);
  const [bondNumber, setBondNumber] = useState<number | '2-10'>(2);
  const [bondUseType, setBondUseType] = useState<'practice' | 'study'>('practice');
  const [isBlankTemplate, setIsBlankTemplate] = useState<boolean>(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [generateCount, setGenerateCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'settings' | 'preview'>('settings');
  const [language, setLanguage] = useState<Language>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(LANGUAGE_KEY) : null;
    return saved === 'en' ? 'en' : 'zh';
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const worksheetRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const regenerate = (
    r = range, 
    m = mode, 
    rg = regroup, 
    mtl = makeTenLeft, 
    but = bondUseType, 
    bn = bondNumber,
    bt = isBlankTemplate
  ) => {
    setProblems(generateProblems(r, m, rg, mtl, but, bn, bt));
    setGenerateCount(c => c + 1);
  };

  useEffect(() => {
    regenerate(range, mode, regroup, makeTenLeft, bondUseType, bondNumber, isBlankTemplate);
  }, [range, mode, regroup, makeTenLeft, bondUseType, bondNumber, isBlankTemplate]);

  const handleRegenerate = () => {
    regenerate();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!worksheetRef.current || isGeneratingPdf) return;

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
          : (language === 'zh' ? `数字${bondNumber}的分解与组合.pdf` : `decomposition-composition-${bondNumber}.pdf`);
      } else if (range === '20-regroup') {
        fileName = `${getPrintTitle(mode, range, regroup, language, t)}.pdf`;
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
        range={range} setRange={setRange}
        mode={mode} setMode={setMode}
        regroup={regroup} setRegroup={setRegroup}
        makeTenLeft={makeTenLeft} setMakeTenLeft={setMakeTenLeft}
        hideTen={hideTen} setHideTen={setHideTen}
        hideBondParts={hideBondParts} setHideBondParts={setHideBondParts}
        bondNumber={bondNumber} setBondNumber={setBondNumber}
        bondUseType={bondUseType} setBondUseType={setBondUseType}
        isBlankTemplate={isBlankTemplate} setIsBlankTemplate={setIsBlankTemplate}
        language={language} setLanguage={setLanguage}
        isGeneratingPdf={isGeneratingPdf}
        handleRegenerate={handleRegenerate}
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
            onClick={handleRegenerate}
            className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-sm cursor-pointer"
          >
            <Dices size={16} />
            {t.mobileRegenerate}
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1 bg-white border border-emerald-200 text-emerald-700 py-3 rounded-xl font-semibold text-sm cursor-pointer"
          >
            <Printer size={16} /> 
            {t.mobilePrint}
          </button>
          <button 
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex-1 flex items-center justify-center gap-1 bg-white border border-purple-200 text-purple-750 py-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-sm cursor-pointer"
          >
            <Download size={16} /> 
            {isGeneratingPdf ? (language === 'zh' ? '生成中...' : '...') : t.mobileDownload}
          </button>
        </div>

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
      </div>
    </div>
  );
}
