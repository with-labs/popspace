import * as React from 'react';
import { makeStyles, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { AddAccessoryMenu } from './AddAccessoryMenu';
import { QuickAction } from './QuickAction';
import { useQuickAction, QuickAction as QuickActionData } from './useQuickAction';
import { QuickActionEmpty } from './QuickActionEmpty';
import { useTranslation } from 'react-i18next';

export interface IOmnibarProps {}

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 400,
  },
  addMenuButton: {
    // according to design system rules, this button is within an input within
    // a paper surface - so the border radius continues to decrease
    borderRadius: 2,
  },
  inputAdornedStart: {
    paddingLeft: theme.spacing(1.5),
  },
  inputRoot: {
    '&[class*="-focused"]': {
      boxShadow: theme.focusRings.create(theme.palette.grey[900]),
      caretColor: theme.palette.grey[900],
    },
    '&[class*="MuiFilledInput-root"]': {
      // reset the Autocomplete padding change...
      paddingTop: 4,
      paddingBottom: 4,
      paddingLeft: 4,
      '& > $inputAdornedStart': {
        // put some space between the input and the add button - using
        // inputAdornedStart class here so this padding gets removed if the add
        // button is not shown for whatever reason.
        paddingLeft: theme.spacing(1.5),
        paddingTop: 0,
        paddingBottom: 0,
      },
    },
  },
  input: {
    paddingLeft: 8,
  },
}));

export const Omnibar: React.FC<IOmnibarProps> = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { autocompleteProps } = useQuickAction();

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
          InputProps={{
            ...params.InputProps,
            classes: { inputAdornedStart: classes.inputAdornedStart },
            startAdornment: <AddAccessoryMenu className={classes.addMenuButton} />,
          }}
          className={classes.root}
        />
      )}
      noOptionsText={<QuickActionEmpty />}
      renderOption={(action) => <QuickAction value={action} />}
      openOnFocus
      autoHighlight
      forcePopupIcon={false}
      {...autocompleteProps}
      classes={{
        inputRoot: classes.inputRoot,
      }}
    />
  );
};
