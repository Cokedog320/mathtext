import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from './App';

const getButtons = (html: string) =>
  [...html.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/g)].map((match) => ({
    attributes: match[1],
    label: match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
  }));

const expectDisabledButtons = (
  buttons: ReturnType<typeof getButtons>,
  labels: string[],
) => {
  for (const label of labels) {
    const matches = buttons.filter((candidate) => candidate.label === label);
    expect(matches.length, `missing action button: ${label}`).toBeGreaterThan(0);
    for (const button of matches) {
      expect(button.attributes, `action button should be disabled: ${label}`).toContain('disabled=""');
    }
  }
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('App initial state', () => {
  it('waits for a problem type before showing a worksheet or enabling worksheet actions', () => {
    const html = renderToStaticMarkup(<App />);
    const buttons = getButtons(html);

    expect(html).toContain('请选择习题类型');
    expect(html).not.toContain('id="worksheet"');
    expect(html).not.toContain('数字组合');
    expect(html).not.toContain('凑十法');

    expectDisabledButtons(buttons, ['重新生成题目', '直接打印', '下载 PDF', '换一批', '打印', '下载']);
  });

  it('shows the same waiting state and disabled actions in English', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', {
      getItem: () => 'en',
      setItem: () => undefined,
    });

    const html = renderToStaticMarkup(<App />);
    const buttons = getButtons(html);

    expect(html).toContain('Select a problem type');
    expect(html).toContain('Choose an exercise from the left to see its worksheet preview here.');
    expect(html).not.toContain('id="worksheet"');
    expect(html).not.toContain('Number Bonds');
    expect(html).not.toContain('Make-Ten Method');
    expectDisabledButtons(buttons, ['Regenerate Problems', 'Print', 'Download PDF', 'New Set', 'Download']);
  });
});
