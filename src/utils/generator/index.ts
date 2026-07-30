import { LowerOperandDigits, Mode, Problem, Range, RegroupOption } from '../../types';
import { generateChainedArithmetic } from './chainedArithmetic';
import { generateHorizontalArithmetic } from './horizontalArithmetic';
import { generateHorizontalFillProblems } from './horizontalFill';
import { generateBreakTenOrFlatTen, generateMakeTen } from './methodProblems';
import { generateNumberBonds } from './numberBonds';
import { generateVerticalArithmetic } from './verticalArithmetic';
import { getRequestedProblemCount } from './worksheetRules';

export { getPrintTitle } from './printTitle';
export { shuffle } from './random';
export { requiresRegroup } from './regroup';
export { getRequestedProblemCount } from './worksheetRules';

type GeneratorOptions = {
  range: Range;
  regroup: RegroupOption;
  makeTenLeft: string;
  bondUseType: 'practice' | 'study';
  bondNumber: number | 'mixed';
  isBlankTemplate: boolean;
  lowerOperandDigits: LowerOperandDigits;
};

type Generator = (options: GeneratorOptions) => Problem[];

const GENERATOR_STRATEGIES = {
  'number-bonds': ({ bondUseType, bondNumber, isBlankTemplate }) =>
    generateNumberBonds(bondUseType, bondNumber, isBlankTemplate),
  'make-ten': ({ makeTenLeft }) => generateMakeTen(makeTenLeft),
  'break-ten': () => generateBreakTenOrFlatTen('break-ten'),
  'flat-ten': () => generateBreakTenOrFlatTen('flat-ten'),
  'vertical-add': ({ range, regroup, lowerOperandDigits }) =>
    generateVerticalArithmetic(range, 'vertical-add', regroup, lowerOperandDigits),
  'vertical-sub': ({ range, regroup, lowerOperandDigits }) =>
    generateVerticalArithmetic(range, 'vertical-sub', regroup, lowerOperandDigits),
  'vertical-mixed': ({ range, regroup, lowerOperandDigits }) =>
    generateVerticalArithmetic(range, 'vertical-mixed', regroup, lowerOperandDigits),
  'horizontal-add': ({ range, regroup }) =>
    generateHorizontalArithmetic(range, 'horizontal-add', regroup),
  'horizontal-sub': ({ range, regroup }) =>
    generateHorizontalArithmetic(range, 'horizontal-sub', regroup),
  'horizontal-mixed': ({ range, regroup }) =>
    generateHorizontalArithmetic(range, 'horizontal-mixed', regroup),
  'horizontal-chain-add': ({ range, regroup }) =>
    generateChainedArithmetic(range, 'horizontal-chain-add', regroup),
  'horizontal-chain-sub': ({ range, regroup }) =>
    generateChainedArithmetic(range, 'horizontal-chain-sub', regroup),
  'horizontal-chain-mixed': ({ range, regroup }) =>
    generateChainedArithmetic(range, 'horizontal-chain-mixed', regroup),
  'horizontal-fill-add': ({ range, regroup }) =>
    generateHorizontalFillProblems(range, 'horizontal-fill-add', regroup, getRequestedProblemCount(range, 'horizontal-fill-add')).problems,
  'horizontal-fill-sub': ({ range, regroup }) =>
    generateHorizontalFillProblems(range, 'horizontal-fill-sub', regroup, getRequestedProblemCount(range, 'horizontal-fill-sub')).problems,
  'horizontal-fill-mixed': ({ range, regroup }) =>
    generateHorizontalFillProblems(range, 'horizontal-fill-mixed', regroup, getRequestedProblemCount(range, 'horizontal-fill-mixed')).problems,
} satisfies Record<Mode, Generator>;

export const generateProblems = (
  range: Range,
  mode: Mode,
  regroup: RegroupOption = 'mixed',
  makeTenLeft: string = 'mixed',
  bondUseType: 'practice' | 'study' = 'practice',
  bondNumber: number | 'mixed' = 5,
  isBlankTemplate: boolean = false,
  lowerOperandDigits: LowerOperandDigits = 'mixed'
): Problem[] => GENERATOR_STRATEGIES[mode]({
  range,
  regroup,
  makeTenLeft,
  bondUseType,
  bondNumber,
  isBlankTemplate,
  lowerOperandDigits,
});
