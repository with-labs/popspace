import * as React from 'react';
import { IconButton, makeStyles, Menu } from '@material-ui/core';
import clsx from 'clsx';
import { AddAccessoryMenuItem } from './AddAccessoryMenuItem';
import { WidgetType } from '../../../types/room';
import palette from '../../../theme/palette';
import { PlusLargeIcon } from '../../../components/icons/PlusLargeIcon';

export interface IAddAccessoryMenuProps {
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  button: {
    backgroundColor: theme.palette.background.paper,
    padding: 7,
    transition: theme.transitions.create(['color', 'background-color', 'box-shadow']),
    fontSize: 18,

    '&:hover': {
      backgroundColor: theme.palette.background.paper,
      color: palette.oregano.bold,
      boxShadow: `inset 0 0 0 2px ${palette.oregano.bold}`,
    },
    '&:focus': {
      backgroundColor: theme.palette.background.paper,

      color: palette.oregano.bold,
      boxShadow: `inset 0 0 0 2px ${palette.oregano.bold}`,
    },
    '&:active': {
      backgroundColor: palette.oregano.light,

      color: palette.oregano.bold,
      boxShadow: `inset 0 0 0 2px ${palette.oregano.bold}`,
    },
  },
  buttonOpen: {
    backgroundColor: palette.oregano.bold,
    color: palette.snow.regular,
  },
}));

const supportedAccessories = [WidgetType.StickyNote, WidgetType.Link, WidgetType.YouTube, WidgetType.Whiteboard];

export const AddAccessoryMenu: React.FC<IAddAccessoryMenuProps> = ({ className }) => {
  const classes = useStyles();

  const [targetElement, setTargetElement] = React.useState<HTMLButtonElement | null>(null);

  const handleButton = React.useCallback((ev: React.MouseEvent<HTMLButtonElement>) => {
    setTargetElement(ev.currentTarget);
  }, []);

  const handleClose = React.useCallback(() => setTargetElement(null), []);

  return (
    <>
      <IconButton
        onClick={handleButton}
        className={clsx(classes.button, !!targetElement && classes.buttonOpen, className)}
        aria-controls="add-accessory-menu"
        aria-haspopup="true"
        disableFocusRipple
        disableRipple
      >
        <PlusLargeIcon fontSize="inherit" />
      </IconButton>
      <Menu
        anchorEl={targetElement}
        open={!!targetElement}
        onClose={handleClose}
        transformOrigin={{ vertical: -8, horizontal: 16 }}
        id="add-accessory-menu"
      >
        {supportedAccessories.map((accessoryType) => (
          <AddAccessoryMenuItem accessoryType={accessoryType as WidgetType} key={accessoryType} onClick={handleClose} />
        ))}
      </Menu>
    </>
  );
};
