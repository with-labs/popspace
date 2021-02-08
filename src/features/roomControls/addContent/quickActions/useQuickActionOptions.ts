import { QuickAction } from '../../../quickActions/types';
import * as matchers from '../../../quickActions/matchers';
import { matchQuickActions } from '../../../quickActions/matchQuickActions';
import { useTranslation } from 'react-i18next';

const allMatchers = Object.values(matchers);

/**
 * This function processes the input the user typed and
 * determines which actions are available, as well as what
 * metadata will be associated with those actions.
 */
export function useQuickActionOptions(prompt: string): QuickAction[] {
  const { t } = useTranslation();
  return matchQuickActions(prompt, allMatchers, t);
}
