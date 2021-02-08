import * as React from 'react';
import { makeStyles, TextField, Paper, Box } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { QuickAction } from '../quickActions/QuickAction';
import { useQuickAction } from '../quickActions/useQuickAction';
import { QuickAction as QuickActionData } from '../../../quickActions/types';
import { QuickActionEmpty } from '../quickActions/QuickActionEmpty';
import { useTranslation } from 'react-i18next';
import { useQuickActionAutocomplete } from '../quickActions/useQuickActionAutocomplete';

export interface IOmnibarProps {}

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 264,
  },
  addMenuButton: {
    // according to design system rules, this button is within an input within
    // a paper surface - so the border radius continues to decrease
    borderRadius: 2,
  },
  inputRoot: {
    '&[class*="MuiFilledInput-root"]': {
      // reset the Autocomplete padding change...
      paddingTop: 4,
      paddingBottom: 4,
      paddingLeft: 8,
    },
  },
  input: {
    paddingLeft: 8,
  },
}));

export const Omnibar: React.FC<IOmnibarProps> = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { autocompleteProps } = useQuickActionAutocomplete();

  return (
    <Autocomplete<QuickActionData>
      renderInput={(params) => (
        <TextField
          placeholder={t('features.omnibar.placeholder')}
          aria-haspopup="true"
          aria-controls="quick-accessory-menu"
          aria-label={t('features.omnibar.label')}
          variant="filled"
          {...params}
          className={classes.root}
        />
      )}
      noOptionsText={<QuickActionEmpty />}
      renderOption={(action) => <QuickAction value={action} />}
      openOnFocus
      autoHighlight
      forcePopupIcon={false}
      {...autocompleteProps}
      // When the input is empty we show a special popup with a message
      PaperComponent={autocompleteProps.inputValue ? Paper : EmptyPaper}
      classes={{
        inputRoot: classes.inputRoot,
      }}
    />
  );
};

const EmptyPaper = (props: any) => (
  <Paper {...props}>
    <Box px={2} pt={2}>
      <QuickActionEmpty />
    </Box>
    {props.children}
  </Paper>
);
