import { makeStyles, Popper, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { QuickAction as QuickActionData } from '../../quickActions/types';
import { QuickAction } from './quickActions/QuickAction';
import { useQuickActionAutocomplete } from './quickActions/useQuickActionAutocomplete';

export interface IOmnibarProps {
  autoFocus?: boolean;
  onChange?: (value: QuickActionData | null) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {},
  addMenuButton: {
    // according to design system rules, this button is within an input within
    // a paper surface - so the border radius continues to decrease
    borderRadius: 2,
  },
  inputRoot: {
    '&[class*="MuiFilledInput-root"]': {
      // reset the Autocomplete padding change...
      paddingTop: 2,
      paddingBottom: 1,
      paddingLeft: 8,
    },
  },
  arrow: {
    display: 'none',
  },
}));

export const Omnibar: React.FC<IOmnibarProps> = ({ autoFocus, onChange, ...rest }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { autocompleteProps } = useQuickActionAutocomplete({ onChange });

  return (
    <Autocomplete<QuickActionData>
      renderInput={(params) => (
        <TextField
          placeholder={t('features.omnibar.placeholder')}
          aria-haspopup="true"
          aria-controls="quick-accessory-menu"
          aria-label={t('features.omnibar.label')}
          variant="filled"
          autoFocus={autoFocus}
          autoComplete="off"
          {...params}
          className={classes.root}
        />
      )}
      renderOption={(action) => <QuickAction value={action} />}
      autoHighlight
      forcePopupIcon={false}
      // Only show initial dropdown if there are options for the empty case
      openOnFocus={!!autocompleteProps.options.length}
      {...autocompleteProps}
      // When the input is empty we show a special popup with a message
      // PaperComponent={autocompleteProps.inputValue ? Paper : EmptyPaper}
      PopperComponent={CustomPopper}
      classes={{
        inputRoot: classes.inputRoot,
        endAdornment: classes.arrow,
      }}
      {...rest}
    />
  );
};

const CustomPopper = (props: any) => <Popper {...props} placement="bottom-start" />;
