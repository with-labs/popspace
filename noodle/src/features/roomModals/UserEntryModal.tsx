import { Analytics } from '@analytics/Analytics';
import client from '@api/client';
import { useRoomStore } from '@api/useRoomStore';
import { FormikSubmitButton } from '@components/fieldBindings/FormikSubmitButton';
import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import { Modal } from '@components/Modal/Modal';
import { getAvatarFromUserId } from '@constants/AvatarMetadata';
import { PseudoUserBubble } from '@features/room/people/PseudoUserBubble';
import { Box, makeStyles } from '@material-ui/core';
import { MAX_NAME_LENGTH } from '@src/constants';
import i18n from '@src/i18n';
import patternBg from '@src/images/illustrations/pattern_bg_1.svg';
import { Form, Formik } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import { useRoomModalStore } from '../roomControls/useRoomModalStore';

const ANALYTICS_ID = 'entryModal';

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
    borderRadius: theme.shape.contentBorderRadius,
  },
  error: {
    marginTop: theme.spacing(1),
    color: theme.palette.error.dark,
  },
  avatarButton: {
    marginTop: theme.spacing(6),
    left: '50%',
    transform: 'translateX(-50%)',
  },
}));

export const UserEntryModal: React.FC<IUserEntryModalProps> = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const closeModal = useRoomModalStore((modals) => modals.api.closeModal);

  const self = useRoomStore((room) => room.cacheApi.getCurrentUser());
  const selfActor = self?.actor;
  // show the modal if the user is an observer (hasn't yet entered the room)
  const isOpen = !!self && self.isObserver;

  const avatarName = selfActor?.avatarName || getAvatarFromUserId(selfActor?.id ?? '0');

  React.useEffect(() => {
    Analytics.trackEvent(`${ANALYTICS_ID}_visited`, new Date().toUTCString());
  }, []);

  React.useEffect(() => {
    function trackClosing() {
      // not much to interact with in this state, so we can just set it false
      // since it will be unloaded
      Analytics.trackEvent(`${ANALYTICS_ID}_closed`, false);
    }

    window.addEventListener('beforeunload', trackClosing);

    return () => {
      window.removeEventListener('beforeunload', trackClosing);
    };
  }, []);

  const onSubmitHandler = (values: { displayName: string }) => {
    if (selfActor?.displayName && values.displayName !== selfActor.displayName) {
      Analytics.trackEvent(`${ANALYTICS_ID}_displayName_changed`, true, {
        oldName: selfActor.displayName,
        newName: values.displayName,
      });
    }

    Analytics.trackEvent(`${ANALYTICS_ID}_enterRoom`, new Date().toUTCString());

    closeModal('userEntry');
    client.participants.updateDisplayName(values.displayName);
    client.participants.updateAvatarName(avatarName);
    client.participants.enterMeeting();
  };

  // TODO:
  // when we figure out how we want to make psudeo-anon users
  // we will have to revisit this to update how we handle
  // psudeo bubble with the updateSelf function and the need to passin
  // the userId (maybe write a work around to leave support open for signed in users)
  return (
    <Formik
      initialValues={{ displayName: selfActor?.displayName || '' }}
      enableReinitialize
      onSubmit={onSubmitHandler}
      validationSchema={validationSchema}
      validateOnBlur
    >
      {({ values }) => (
        <Modal isOpen={isOpen} maxWidth={'sm'}>
          <Box display="flex" flexDirection="column" flex={1} m={4}>
            <Box className={classes.avatarArea} position="relative" mb={2}>
              <div className={classes.background} />
              <PseudoUserBubble
                className={classes.avatarButton}
                userData={{
                  userId: '',
                  displayName: values.displayName,
                  avatarName: avatarName,
                }}
              />
            </Box>
            <Form>
              <FormikTextField
                id="displayName"
                name="displayName"
                placeholder={t('modals.userEntry.placeholderText')}
                margin="normal"
                autoFocus
                autoComplete="name"
              />
              <FormikSubmitButton>{t('modals.userEntry.submitButtonText')}</FormikSubmitButton>
            </Form>
          </Box>
        </Modal>
      )}
    </Formik>
  );
};
