import React from 'react';
import { makeStyles, Button, ThemeProvider, CircularProgress } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal/Modal';
import { ModalActions } from '../Modal/ModalActions';
import { ModalTitleBar } from '../Modal/ModalTitleBar';
import { ModalContentWrapper } from '../Modal/ModalContentWrapper';
import { ThemeName, getThemeFromName } from '../../theme/theme';

interface IConformModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  primaryButtonText?: string;
  secondayButtonText?: string;
  buttonColor?: ThemeName;
  children?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  isBusy?: boolean;
}

const useStyles = makeStyles((theme) => ({
  spacer: {
    marginTop: theme.spacing(2),
  },
  title: {
    '& .MuiTypography-root': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
}));

export const ConfirmModal: React.FC<IConformModalProps> = (props) => {
  const {
    isOpen,
    onClose,
    onConfirm,
    title,
    primaryButtonText,
    secondayButtonText,
    buttonColor,
    children,
    maxWidth = 'xs',
    isBusy = false,
  } = props;
  const classes = useStyles();
  const { t } = useTranslation();
  const buttonTheme = getThemeFromName(buttonColor);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth={maxWidth}>
      {title && <ModalTitleBar title={title} />}
      <ModalContentWrapper>{children}</ModalContentWrapper>
      <ModalActions>
        <ThemeProvider theme={buttonTheme}>
          <Button disabled={isBusy} onClick={() => onConfirm()} className={classes.spacer}>
            {isBusy ? <CircularProgress size={22} /> : primaryButtonText ?? t('common.confirm')}
          </Button>
        </ThemeProvider>
        <Button variant="text" color="inherit" onClick={() => onClose()} className={classes.spacer} disabled={isBusy}>
          {secondayButtonText ?? t('common.cancel')}
        </Button>
      </ModalActions>
    </Modal>
  );
};
