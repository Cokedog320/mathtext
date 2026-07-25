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
    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
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

// Layout configurations for different modes
interface LayoutSettings {
  bondNumber: number | 'mixed';
  isBlankTemplate: boolean;
  range: Range;
}

interface RenderConfig {
  component: React.FC<{
    problem: Problem;
    index: number;
    large?: boolean;
    hideParts?: boolean;
    hideTen?: boolean;
    bondNumber?: number | 'mixed';
    isBlankTemplate?: boolean;
    regroup?: RegroupOption;
    range?: Range;
  }>;
  getLayoutClass: (settings: LayoutSettings) => { colClass: string; heightClass: string };
}

const RENDER_REGISTRY: Record<Mode, RenderConfig> = {
  'number-bonds': {
    component: ({ problem, hideParts, bondNumber, isBlankTemplate }) => {
      const isLarge = typeof bondNumber === 'number' && bondNumber <= 4 && !isBlankTemplate;
      return <NumberBond problem={problem as any} large={isLarge} hideParts={hideParts} />;
    },
    getLayoutClass: ({ bondNumber, isBlankTemplate }) => {
      if (bondNumber === 'mixed' || isBlankTemplate) {
        return { colClass: 'w-1/3', heightClass: 'h-[180px]' };
      }
      const effectiveNumber = isBlankTemplate ? 10 : bondNumber;
      const isLarge = typeof bondNumber === 'number' && bondNumber <= 4 && !isBlankTemplate;
      return {
        colClass: effectiveNumber === 2 ? 'w-full' : effectiveNumber === 3 ? 'w-1/2' : 'w-1/3',
        heightClass: isLarge ? 'h-[320px]' : 'h-[230px]',
      };
    }
  },
  'make-ten': {
    component: ({ problem, index, hideTen }) => <MethodDiagram problem={problem as any} index={index} hideTen={hideTen} />,
    getLayoutClass: () => ({ colClass: 'w-1/4', heightClass: 'h-[180px]' })
  },
  'break-ten': {
    component: ({ problem, index, hideTen }) => <MethodDiagram problem={problem as any} index={index} hideTen={hideTen} />,
    getLayoutClass: () => ({ colClass: 'w-1/4', heightClass: 'h-[180px]' })
  },
  'flat-ten': {
    component: ({ problem, index, hideTen }) => <MethodDiagram problem={problem as any} index={index} hideTen={hideTen} />,
    getLayoutClass: () => ({ colClass: 'w-1/4', heightClass: 'h-[180px]' })
  },
  'vertical-add': {
    component: ({ problem, index, regroup = 'mixed' }) => <VerticalArithmetic problem={problem as any} index={index} regroup={regroup} />,
    getLayoutClass: () => ({ colClass: 'w-1/4', heightClass: 'h-[185px]' })
  },
  'vertical-sub': {
    component: ({ problem, index, regroup = 'mixed' }) => <VerticalArithmetic problem={problem as any} index={index} regroup={regroup} />,
    getLayoutClass: () => ({ colClass: 'w-1/4', heightClass: 'h-[185px]' })
  },
  'vertical-mixed': {
    component: ({ problem, index, regroup = 'mixed' }) => <VerticalArithmetic problem={problem as any} index={index} regroup={regroup} />,
    getLayoutClass: () => ({ colClass: 'w-1/4', heightClass: 'h-[185px]' })
  },
  'horizontal-add': {
    component: ({ problem, index, range = '1-100' }) => <HorizontalArithmetic problem={problem as any} index={index} range={range} />,
    getLayoutClass: ({ range }) => ({ colClass: 'w-1/4', heightClass: range === '1-10' ? 'h-[150px]' : range === '1-20' ? 'h-[78px]' : 'h-[52px]' })
  },
  'horizontal-sub': {
    component: ({ problem, index, range = '1-100' }) => <HorizontalArithmetic problem={problem as any} index={index} range={range} />,
    getLayoutClass: ({ range }) => ({ colClass: 'w-1/4', heightClass: range === '1-10' ? 'h-[150px]' : range === '1-20' ? 'h-[78px]' : 'h-[52px]' })
  },
  'horizontal-mixed': {
    component: ({ problem, index, range = '1-100' }) => <HorizontalArithmetic problem={problem as any} index={index} range={range} />,
    getLayoutClass: ({ range }) => ({ colClass: 'w-1/4', heightClass: range === '1-10' ? 'h-[150px]' : range === '1-20' ? 'h-[78px]' : 'h-[52px]' })
  },
  'horizontal-chain-add': {
    component: ({ problem, index, range = '1-100' }) => <ChainedArithmetic problem={problem as any} index={index} range={range} />,
    getLayoutClass: () => ({ colClass: 'w-1/3', heightClass: 'h-[115px]' })
  },
  'horizontal-chain-sub': {
    component: ({ problem, index, range = '1-100' }) => <ChainedArithmetic problem={problem as any} index={index} range={range} />,
    getLayoutClass: () => ({ colClass: 'w-1/3', heightClass: 'h-[115px]' })
  },
  'horizontal-chain-mixed': {
    component: ({ problem, index, range = '1-100' }) => <ChainedArithmetic problem={problem as any} index={index} range={range} />,
    getLayoutClass: () => ({ colClass: 'w-1/3', heightClass: 'h-[115px]' })
  },
  'horizontal-fill-add': {
    component: ({ problem, index }) => <HorizontalFillArithmetic problem={problem as any} index={index} />,
    getLayoutClass: ({ range }) => ({ colClass: 'w-1/4', heightClass: range === '1-10' ? 'h-[150px]' : range === '1-20' ? 'h-[78px]' : 'h-[52px]' })
  },
  'horizontal-fill-sub': {
    component: ({ problem, index }) => <HorizontalFillArithmetic problem={problem as any} index={index} />,
    getLayoutClass: ({ range }) => ({ colClass: 'w-1/4', heightClass: range === '1-10' ? 'h-[150px]' : range === '1-20' ? 'h-[78px]' : 'h-[52px]' })
  },
  'horizontal-fill-mixed': {
    component: ({ problem, index }) => <HorizontalFillArithmetic problem={problem as any} index={index} />,
    getLayoutClass: ({ range }) => ({ colClass: 'w-1/4', heightClass: range === '1-10' ? 'h-[150px]' : range === '1-20' ? 'h-[78px]' : 'h-[52px]' })
  }
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
  const renderConfig = RENDER_REGISTRY[mode];

  const { colClass, heightClass } = renderConfig.getLayoutClass({ bondNumber, isBlankTemplate, range });
  const RendererComponent = renderConfig.component;
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

  return (
    <A4PreviewWrapper>
      <div
        ref={worksheetRef}
        id="worksheet"
        className="print-area w-[794px] h-[1123px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] py-8 px-12 flex flex-col relative shrink-0 overflow-hidden transition-shadow duration-500 hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
      >
        <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-2 relative z-10 gap-4">
          <h1 className="text-3xl font-black tracking-widest text-black">
            {mode === 'number-bonds'
              ? (isBlankTemplate
                  ? (language === 'zh' ? '数字的分解与组合' : 'Decomposition & Composition')
                  : bondNumber === 'mixed'
                    ? (language === 'zh' ? '混合数字的分解与组合' : 'Mixed Decomposition & Composition')
                    : (language === 'zh' ? `数字 ${bondNumber} 的分解与组合` : `Decomposition & Composition of ${bondNumber}`))
              : getPrintTitle(mode, range, regroup, language, t)}
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
          className={`w-full py-2 relative z-10 animate-fade-in-up ${
            fillsPage
              ? 'grid flex-1 min-h-0'
              : `flex flex-wrap flex-1 min-h-0 items-center ${usesMixedBondLayout ? 'content-between' : 'content-center'} justify-center`
          }`}
        >
          {problems.map((problem, idx) => (
            <div
              key={problem.id}
              className={`${fillsPage ? 'min-h-0' : `${colClass} ${heightClass}`} flex justify-center items-center break-inside-avoid`}
            >
              <RendererComponent
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
