import { Backdrop, makeStyles, Modal, Paper } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import shallow from 'zustand/shallow';
import { Fade } from '@components/Fade/Fade';
import { KeyShortcut } from '@constants/keyShortcuts';
import { useRoomModalStore } from '../useRoomModalStore';
import { Omnibar } from './Omnibar';

export interface IActionBarProps {
  className?: string;
}

export const ACTION_BAR_ID = 'action-bar';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    top: '10vh',
    left: '50%',
    transform: 'translateX(-50%)',
    maxWidth: 800,
    width: '90vw',
    padding: theme.spacing(2),
  },
}));

export const ActionBar: React.FC<IActionBarProps> = ({ className, ...rest }) => {
  const classes = useStyles();

  const [open, closeModal, openModal] = useRoomModalStore(
    (store) => [store.actionBar, store.api.closeModal, store.api.openModal],
    shallow
  );

  const onClose = () => closeModal('actionBar');

  useHotkeys(
    KeyShortcut.ActionBar,
    (ev) => {
      // prevents a browser default action - like Firefox omnibar focus.
      // we may revisit this if users complain.
      ev.preventDefault();
      openModal('actionBar');
    },
    [openModal]
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
      id={ACTION_BAR_ID}
      {...rest}
    >
      <Fade open={open}>
        <Paper className={clsx(classes.root, className)}>
          <Omnibar autoFocus onChange={onClose} />
        </Paper>
      </Fade>
    </Modal>
  );
};
