import React from 'react';
import { Modal } from '@components/Modal/Modal';
import { ModalTitleBar } from '@components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '@components/Modal/ModalContentWrapper';
import { useTranslation } from 'react-i18next';
import { useRoomModalStore } from '../roomControls/useRoomModalStore';
import * as Yup from 'yup';
import i18n from '@src/i18n';
import { Box, Typography, Button, TextField, makeStyles } from '@material-ui/core';
import MaskedInput from 'react-text-mask';
import { useFormik } from 'formik';

const otpCodeMask = [/[a-zA-Z0-9]/, /[a-zA-Z0-9]/, /[a-zA-Z0-9]/, /[a-zA-Z0-9]/, /[a-zA-Z0-9]/, /[a-zA-Z0-9]/];

const TextMaskCustom = (props: any) => {
  const { inputRef, ...other } = props;
  return <MaskedInput {...other} mask={otpCodeMask} guide={false} placeholder="000000" type="text" />;
};

const validationSchema = Yup.object().shape({
  otpCode: Yup.string()
    .test('len', 'Must be exactly 6 characters', (val) => val?.length === 6)
    .required(i18n.t('common.required')),
});

interface IConfirmCodeModalProps {
  email: string;
}

const useStyles = makeStyles((theme) => ({
  error: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color: theme.palette.error.dark,
  },
  buttonLink: {
    background: 'none',
    border: 'none',
    padding: 0,
    color: theme.palette.brandColors.ink.regular,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  formContent: {
    flex: '1 1 0%',
    display: 'flex',
    flexDirection: 'column',
  },
}));

export const ConfirmCodeModal: React.FC<IConfirmCodeModalProps> = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { email } = props;

  const isOpen = useRoomModalStore((modals) => modals.confirmCode);
  const closeModal = useRoomModalStore((modals) => modals.api.closeModal);
  const onClose = () => closeModal('confirmCode');

  const formik = useFormik({
    initialValues: {
      otpCode: '',
    },
    validationSchema: validationSchema,
    validateOnBlur: true,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth={'xs'}>
      <ModalTitleBar title={t('modals.confirmCode.title')} onClose={onClose} />
      <ModalContentWrapper>
        <Box display="flex" flexDirection="column">
          <Box mb={2}>
            <Typography variant="body1">{t('modals.confirmCode.explainationText', { email: email })}</Typography>
          </Box>
          <form onSubmit={formik.handleSubmit} className={classes.form}>
            <div className={classes.formContent}>
              <TextField
                InputProps={{
                  inputComponent: TextMaskCustom,
                  name: 'otpCode',
                  id: 'otpCode',
                  onChange: formik.handleChange,
                  onBlur: formik.handleBlur,
                }}
              />
              <div className={classes.error}>{formik.errors.otpCode}</div>
            </div>
            <Button type="submit" disabled={!(formik.isValid && formik.dirty)}>
              {t('modals.confirmCode.finalizeButtonText')}
            </Button>
          </form>
        </Box>
      </ModalContentWrapper>
    </Modal>
  );
};
