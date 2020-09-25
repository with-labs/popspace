import { cherry, lavender, mandarin, turquoise } from '../src/theme/theme';
import { withMuiTheme } from '@harelpls/storybook-addon-materialui';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

export const decorators = [
  withMuiTheme({
    mandarin,
    cherry,
    turquoise,
    lavender,
  }),
];
