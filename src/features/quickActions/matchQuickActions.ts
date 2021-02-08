import { TFunction } from 'i18next';
import { QuickAction } from './types';

export function matchQuickActions(
  prompt: string,
  matchers: ((prompt: string, t: TFunction) => QuickAction[])[],
  t: TFunction
) {
  return matchers
    .reduce((list, matcher) => {
      list.push(...matcher(prompt.trim(), t));
      return list;
    }, [] as QuickAction[])
    .sort((a, b) => b.confidence - a.confidence);
}
