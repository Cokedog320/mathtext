import { Language, Mode, Range, RegroupOption } from '../../types';
import { normalizeRangeForMode } from './worksheetRules';

export const getPrintTitle = (mode: Mode, range: Range, regroup: RegroupOption, language: Language, t: any): string => {
  const normalizedRange = normalizeRangeForMode(range, mode);
  const rangeLabels = (() => {
    const n = normalizedRange.split('-')[1];
    return { zh: `${n}以内`, en: `Within ${n}` };
  })();
  const rZh = rangeLabels.zh;
  const rEn = rangeLabels.en;

  let regroupZh = '';
  let regroupEn = '';
  if (normalizedRange !== '1-10') {
    if (regroup === 'none') {
      regroupZh = mode.includes('-add') ? '不进位' : (mode.includes('-sub') ? '不退位' : '无进退位');
      regroupEn = mode.includes('-add') ? 'No Carry' : (mode.includes('-sub') ? 'No Borrow' : 'No Regroup');
    } else if (regroup === 'only') {
      regroupZh = mode.includes('-add') ? '进位' : (mode.includes('-sub') ? '退位' : '进退位');
      regroupEn = mode.includes('-add') ? 'Carrying' : (mode.includes('-sub') ? 'Borrowing' : 'Regrouping');
    }
  }

  const baseMapZh: Record<string, string> = {
    'vertical-add': '加法',
    'vertical-sub': '减法',
    'vertical-mixed': '加减法',
    'horizontal-add': '加法',
    'horizontal-sub': '减法',
    'horizontal-mixed': '加减混合',
    'horizontal-chain-add': '连续加法',
    'horizontal-chain-sub': '连续减法',
    'horizontal-chain-mixed': '连续加减混合',
    'horizontal-fill-add': '填空加法',
    'horizontal-fill-sub': '填空减法',
    'horizontal-fill-mixed': '填空加减混合',
  };
  const baseMapEn: Record<string, string> = {
    'vertical-add': 'Addition',
    'vertical-sub': 'Subtraction',
    'vertical-mixed': 'Arithmetic',
    'horizontal-add': 'Addition',
    'horizontal-sub': 'Subtraction',
    'horizontal-mixed': 'Mixed Arithmetic',
    'horizontal-chain-add': 'Chained Addition',
    'horizontal-chain-sub': 'Chained Subtraction',
    'horizontal-chain-mixed': 'Chained Mixed Arithmetic',
    'horizontal-fill-add': 'Fill-in Addition',
    'horizontal-fill-sub': 'Fill-in Subtraction',
    'horizontal-fill-mixed': 'Fill-in Mixed',
  };

  const isArithmetic = Object.keys(baseMapZh).includes(mode);
  if (isArithmetic) {
    if (language === 'zh') {
      return `${rZh}${regroupZh}${baseMapZh[mode]}`;
    } else {
      if (mode === 'horizontal-add' && normalizedRange === '1-100' && regroup === 'none') {
        return `${baseMapEn[mode]} to ${rEn.replace('Within ', '')}\nNo Regrouping`;
      }
      return regroupEn ? `${regroupEn} ${baseMapEn[mode]} ${rEn}` : `${baseMapEn[mode]} ${rEn}`;
    }
  }
  return t.printTitles[mode];
};
