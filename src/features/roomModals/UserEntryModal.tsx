import React from 'react';
import { Modal } from '@components/Modal/Modal';
import { ModalContentWrapper } from '@components/Modal/ModalContentWrapper';
import { useTranslation } from 'react-i18next';
import { useRoomModalStore } from '../roomControls/useRoomModalStore';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '@components/fieldBindings/FormikSubmitButton';
import i18n from '@src/i18n';
import { AvatarSelectorBubble } from '@features/roomControls/avatar/AvatarSelectorBubble';
import { makeStyles, Box } from '@material-ui/core';
import patternBg from '@src/images/illustrations/pattern_bg_1.svg';
import { MAX_NAME_LENGTH } from '@src/constants';
import { MediaReadinessContext } from '@components/MediaReadinessProvider/MediaReadinessProvider';
import { useRoomStore } from '@api/useRoomStore';
import client from '@api/client';
import { useLocalActorId } from '@api/useLocalActorId';

interface IUserEntryModalProps {}

export type UserEntryFormData = {
  displayName: string;
};

const validationSchema = Yup.object().shape({
  displayName: Yup.string()
    .max(MAX_NAME_LENGTH, i18n.t('modals.userEntry.maxSize', { maxNameLength: MAX_NAME_LENGTH }))
    .required(i18n.t('common.required')),
});

const useStyles = makeStyles((theme) => ({
  avatarArea: {
    height: 216,
  },
  background: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: theme.palette.brandColors.mandarin.light,
    backgroundImage: `url(${patternBg})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },
  error: {
    marginTop: theme.spacing(1),
    color: theme.palette.error.dark,
  },
  avatarButton: {
    border: 'none',
    background: 'none',
    marginTop: theme.spacing(6),
    left: '50%',
    transform: 'translateX(-50%)',
    cursor: 'pointer',
  },
}));

export const UserEntryModal: React.FC<IUserEntryModalProps> = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { isReady, onReady } = React.useContext(MediaReadinessContext);

  const isOpen = !isReady;
  const closeModal = useRoomModalStore((modals) => modals.api.closeModal);

  const localId = useLocalActorId();
  const self = useRoomStore((room) => room.users[localId ?? '']?.participantState);

  const onSubmitHandler = (values: { displayName: string }) => {
    closeModal('userEntry');
    client.participants.updateSelf({
      displayName: values.displayName,
    });
    onReady();
  };

  // TODO:
  // when we figure out how we want to make psudeo-anon users
  // we will have to revisit this to update how we handle
  // psudeo bubble with the updateSelf function and the need to passin
  // the userId (maybe write a work around to leave support open for signed in users)
  return (
    <Modal isOpen={isOpen} maxWidth={'sm'}>
      <ModalContentWrapper>
        <Box display="flex" flexDirection="column" flex={1}>
          <Box className={classes.avatarArea} position="relative" mb={2}>
            <div className={classes.background} />
            <AvatarSelectorBubble
              className={classes.avatarButton}
              userData={{
                userId: '',
                displayName: self?.displayName,
                avatarName: self?.avatarName,
              }}
              updateSelf={client.participants.updateSelf}
              showVideo
            />
          </Box>
          <Formik
            initialValues={{ displayName: self?.displayName || '' }}
            enableReinitialize
            onSubmit={onSubmitHandler}
            validationSchema={validationSchema}
          >
            <Form>
              <Box mb={2}>
                <FormikTextField
                  id="displayName"
                  name="displayName"
                  placeholder={t('modals.userEntry.placeholderText')}
                  margin="normal"
                />
                <FormikSubmitButton activeOnChange>{t('modals.userEntry.submitButtonText')}</FormikSubmitButton>
              </Box>
            </Form>
          </Formik>
        </Box>
      </ModalContentWrapper>
    </Modal>
  );
};
