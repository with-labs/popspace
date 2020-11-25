import * as React from 'react';
import { Fab, TextField, List, makeStyles, Box, MenuItem } from '@material-ui/core';
import { PlusIcon } from '../../../../components/icons/PlusIcon';
import { ResponsiveMenu } from '../../../../components/ResponsiveMenu/ResponsiveMenu';
import { useQuickAction } from '../quickActions/useQuickAction';
import { useAutocomplete } from '@material-ui/lab';
import { QuickAction } from '../quickActions/QuickAction';
import { QuickActionEmpty } from '../quickActions/QuickActionEmpty';

const useStyles = makeStyles((theme) => ({
  fab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  menu: {
    [theme.breakpoints.down('sm')]: {
      minHeight: '50vh',
      maxHeight: '90vh',
    },
  },
}));

/**
 * This is the mobile equivalent experience to the Omnibar. It's a
 * Button + Menu combo which renders the same contents in a different format.
 */
export const Omnidrawer = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  // autocomplete open state lags behind drawer so there's time to mount
  // the input
  const [showOptions, setShowOptions] = React.useState(false);
  React.useEffect(() => {
    if (anchorEl) {
      setShowOptions(true);
      return () => setShowOptions(false);
    }
  }, [anchorEl]);

  const { autocompleteProps } = useQuickAction();
  // creating our own "destructured" autocomplete - the options will be visible
  // directly below the input at all times, no menu.
  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
  } = useAutocomplete({
    ...autocompleteProps,
    open: showOptions,
    // close the drawer on selection
    onChange: (event, value) => {
      autocompleteProps.onChange(event, value);
      setAnchorEl(null);
    },
  });

  return (
    <>
      <Fab onClick={(ev) => setAnchorEl(ev.currentTarget)} className={classes.fab}>
        <PlusIcon fontSize="default" />
      </Fab>
      <ResponsiveMenu open={!!anchorEl} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} className={classes.menu}>
        <div {...getRootProps()}>
          <TextField InputLabelProps={getInputLabelProps()} inputProps={getInputProps()} />
          {!autocompleteProps.inputValue && (
            <Box p={2}>
              <QuickActionEmpty />
            </Box>
          )}
          <List {...getListboxProps()}>
            {groupedOptions.map((option, index) => (
              <MenuItem {...getOptionProps({ option, index })} key={option.displayName}>
                <QuickAction value={option} />
              </MenuItem>
            ))}
          </List>
        </div>
      </ResponsiveMenu>
    </>
  );
};
