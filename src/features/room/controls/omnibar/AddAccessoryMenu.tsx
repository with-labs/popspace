import * as React from 'react';
import { IconButton, makeStyles, Menu } from '@material-ui/core';
import { PlusIcon } from '../../../../withComponents/icons/PlusIcon';
import clsx from 'clsx';
import { AddAccessoryMenuItem } from './AddAccessoryMenuItem';
import { WidgetType } from '../../../../types/room';
import palette from '../../../../theme/palette';

export interface IAddAccessoryMenuProps {
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  button: {
    backgroundColor: theme.palette.background.paper,
    padding: 2,
    transition: theme.transitions.create(['color', 'background-color', 'box-shadow']),

    '&:hover': {
      backgroundColor: theme.palette.background.paper,
      color: palette.turquoise.dark,
      boxShadow: `inset 0 0 0 2px ${palette.turquoise.dark}`,
    },
    '&:focus': {
      backgroundColor: theme.palette.background.paper,

      color: palette.turquoise.dark,
      boxShadow: `inset 0 0 0 2px ${palette.turquoise.dark}`,
    },
    '&:active': {
      backgroundColor: palette.turquoise.light,

      color: palette.turquoise.dark,
      boxShadow: `inset 0 0 0 2px ${palette.turquoise.dark}`,
    },
  },
  buttonOpen: {
    backgroundColor: palette.turquoise.dark,
    color: palette.snow.main,
  },
  icon: {
    fontSize: 36,
  },
}));

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
        <PlusIcon className={classes.icon} />
      </IconButton>
      <Menu
        anchorEl={targetElement}
        open={!!targetElement}
        onClose={handleClose}
        transformOrigin={{ vertical: -8, horizontal: 16 }}
        id="add-accessory-menu"
      >
        {Object.values(WidgetType).map((accessoryType) => (
          <AddAccessoryMenuItem accessoryType={accessoryType as WidgetType} key={accessoryType} onClick={handleClose} />
        ))}
      </Menu>
    </>
  );
};
