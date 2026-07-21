import { Language, Mode, Range, RegroupOption } from '../../types';

export const getPrintTitle = (mode: Mode, range: Range, regroup: RegroupOption, language: Language, t: any): string => {
  const rangeMap: Record<Range, {zh: string, en: string}> = {
    '1-10': {zh: '10以内', en: 'Within 10'},
    '1-20': {zh: '20以内', en: 'Within 20'},
    '1-30': {zh: '30以内', en: 'Within 30'},
    '1-50': {zh: '50以内', en: 'Within 50'},
    '1-100': {zh: '100以内', en: 'Within 100'}
  };
  const rZh = rangeMap[range].zh;
  const rEn = rangeMap[range].en;

  let regroupZh = '';
  let regroupEn = '';
  if (range !== '1-10') {
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
    'horizontal-fill-add': '横式填空加法',
    'horizontal-fill-sub': '横式填空减法',
    'horizontal-fill-mixed': '横式填空加减混合',
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
    'horizontal-fill-add': 'Horizontal Fill Addition',
    'horizontal-fill-sub': 'Horizontal Fill Subtraction',
    'horizontal-fill-mixed': 'Horizontal Fill Mixed',
  };

  const isArithmetic = Object.keys(baseMapZh).includes(mode);
  if (isArithmetic) {
    if (language === 'zh') {
      return `${rZh}${regroupZh}${baseMapZh[mode]}`;
    } else {
      return regroupEn ? `${regroupEn} ${baseMapEn[mode]} ${rEn}` : `${baseMapEn[mode]} ${rEn}`;
    }
  }
  return t.printTitles[mode];
};
