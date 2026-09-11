import React, { useRef, useState, useEffect } from 'react';
import { Mode, Range, RegroupOption, Language, Problem, translations } from '../types';
import { getPrintTitle } from '../utils/problemGenerator';
import { NumberBond, VerticalArithmetic, HorizontalArithmetic, HorizontalFillArithmetic, ChainedArithmetic, MethodDiagram } from './ProblemRenderers';

export const A4PreviewWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const parentWidth = containerRef.current.clientWidth;
      const targetWidth = 794;
      if (parentWidth < targetWidth) {
        setScale(parentWidth / targetWidth);
      } else {
        setScale(1);
      }
    };

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    handleResize();
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center items-start overflow-hidden py-4 print-preview-wrapper"
      style={{ height: `${1123 * scale + 32}px` }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          width: '794px',
          height: '1123px',
          transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="shrink-0 print-preview-content animate-fade-in-up"
      >
        {children}
      </div>
    </div>
  );
};

type RendererProps = {
  problem: Problem;
  index: number;
  bondNumber: number | 'mixed';
  isBlankTemplate: boolean;
  hideParts: boolean;
  hideTen: boolean;
  regroup: RegroupOption;
  range: Range;
};

type ProblemRenderer = (props: RendererProps) => React.ReactElement;

const bondRenderer: ProblemRenderer = ({ problem, bondNumber, isBlankTemplate, hideParts }) => {
  const isLarge = typeof bondNumber === 'number' && bondNumber <= 4 && !isBlankTemplate;
  return <NumberBond problem={problem as Extract<Problem, { type: 'bond' }>} large={isLarge} hideParts={hideParts} />;
};

const methodRenderer: ProblemRenderer = ({ problem, hideTen }) =>
  <MethodDiagram problem={problem as Extract<Problem, { type: 'method' }>} hideTen={hideTen} />;

const verticalRenderer: ProblemRenderer = ({ problem, index, regroup }) =>
  <VerticalArithmetic problem={problem as Extract<Problem, { type: 'arithmetic' }>} index={index} regroup={regroup} />;

const horizontalRenderer: ProblemRenderer = ({ problem, index, range }) =>
  <HorizontalArithmetic problem={problem as Extract<Problem, { type: 'arithmetic' }>} index={index} range={range} />;

const chainRenderer: ProblemRenderer = ({ problem, index, range }) =>
  <ChainedArithmetic problem={problem as Extract<Problem, { type: 'arithmetic-chain' }>} index={index} range={range} />;

const fillRenderer: ProblemRenderer = ({ problem, index, range }) =>
  <HorizontalFillArithmetic problem={problem as Extract<Problem, { type: 'horizontal-fill' }>} index={index} range={range} />;

const RENDERERS: Record<Mode, ProblemRenderer> = {
  'number-bonds': bondRenderer,
  'make-ten': methodRenderer,
  'break-ten': methodRenderer,
  'flat-ten': methodRenderer,
  'vertical-add': verticalRenderer,
  'vertical-sub': verticalRenderer,
  'vertical-mixed': verticalRenderer,
  'horizontal-add': horizontalRenderer,
  'horizontal-sub': horizontalRenderer,
  'horizontal-mixed': horizontalRenderer,
  'horizontal-chain-add': chainRenderer,
  'horizontal-chain-sub': chainRenderer,
  'horizontal-chain-mixed': chainRenderer,
  'horizontal-fill-add': fillRenderer,
  'horizontal-fill-sub': fillRenderer,
  'horizontal-fill-mixed': fillRenderer,
};

// 仅 number-bonds 走 flex-wrap 布局消费 col/height 类；其余模式 fillsPage 网格不使用
const getBondLayout = ({ bondNumber, isBlankTemplate }: {
  bondNumber: number | 'mixed';
  isBlankTemplate: boolean;
}): { colClass: string; heightClass: string } => {
  if (bondNumber === 'mixed' || isBlankTemplate) {
    return { colClass: 'w-1/3', heightClass: 'h-[180px]' };
  }
  const isLarge = typeof bondNumber === 'number' && bondNumber <= 4;
  const colClass = isLarge
    ? (bondNumber === 2 ? 'w-full' : bondNumber === 3 ? 'w-1/2' : 'w-1/3')
    : 'w-1/3';
  return { colClass, heightClass: isLarge ? 'h-[320px]' : 'h-[230px]' };
};

// number-bonds 的练习卷标题（App 的 PDF 文件名也从这里推导）
export const getBondWorksheetName = (
  language: Language,
  bondNumber: number | 'mixed',
  isBlankTemplate: boolean,
): string => {
  if (isBlankTemplate) return language === 'zh' ? '数字的分解与组合' : 'Decomposition & Composition';
  if (bondNumber === 'mixed') return language === 'zh' ? '混合数字的分解与组合' : 'Mixed Decomposition & Composition';
  return language === 'zh' ? `数字 ${bondNumber} 的分解与组合` : `Decomposition & Composition of ${bondNumber}`;
};

interface WorksheetProps {
  mode: Mode;
  range: Range;
  regroup: RegroupOption;
  language: Language;
  bondNumber: number | 'mixed';
  isBlankTemplate: boolean;
  hideBondParts: boolean;
  hideTen: boolean;
  problems: Problem[];
  generateCount: number;
  worksheetRef: React.RefObject<HTMLDivElement | null>;
}

export const Worksheet: React.FC<WorksheetProps> = ({
  mode, range, regroup, language,
  bondNumber, isBlankTemplate, hideBondParts, hideTen,
  problems, generateCount, worksheetRef
}) => {
  const t = translations[language];
  const RenderProblem = RENDERERS[mode];
  const { colClass, heightClass } = getBondLayout({ bondNumber, isBlankTemplate });
  const fillsPage = mode !== 'number-bonds';
  const usesMixedBondLayout = mode === 'number-bonds' && (bondNumber === 'mixed' || isBlankTemplate);
  const columnCount = mode.startsWith('horizontal-chain-') ? 3 : 4;
  const rowCount = Math.max(1, Math.ceil(problems.length / columnCount));
  const problemGridStyle = fillsPage
    ? {
      gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))`,
    }
    : undefined;
  const worksheetTitle = mode === 'number-bonds'
    ? getBondWorksheetName(language, bondNumber, isBlankTemplate)
    : getPrintTitle(mode, range, regroup, language, t);

  return (
    <A4PreviewWrapper>
      <div
        ref={worksheetRef}
        id="worksheet"
        className="print-area w-[794px] h-[1123px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] py-8 px-12 flex flex-col relative shrink-0 overflow-hidden transition-shadow duration-500 hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
      >
        <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-2 relative z-10 gap-4">
          <h1 className={`text-3xl font-black tracking-widest text-black ${worksheetTitle.includes('\n') ? 'whitespace-pre' : ''}`}>
            {worksheetTitle}
          </h1>
          <div className="flex gap-6 text-sm font-bold text-black whitespace-nowrap flex-shrink-0">
            <span>{t.date}: ________________</span>
            <span>{t.name}: ________________</span>
            <span>{t.score}: ____ / {problems.length}</span>
          </div>
        </div>

        <div
          key={generateCount}
          style={problemGridStyle}
          className={`w-full py-2 relative z-10 animate-fade-in-up ${fillsPage
            ? 'grid flex-1 min-h-0'
            : `flex flex-wrap flex-1 min-h-0 items-center ${usesMixedBondLayout ? 'content-between' : 'content-center'} justify-center`
            }`}
        >
          {problems.map((problem, idx) => (
            <div
              key={problem.id}
              className={`${fillsPage ? 'min-h-0' : `${colClass} ${heightClass}`} flex justify-center items-center break-inside-avoid`}
            >
              <RenderProblem
                problem={problem}
                index={idx}
                hideParts={hideBondParts}
                bondNumber={bondNumber}
                isBlankTemplate={isBlankTemplate}
                hideTen={hideTen}
                regroup={regroup}
                range={range}
              />
            </div>
          ))}
        </div>
      </div>
    </A4PreviewWrapper>
  );
};
