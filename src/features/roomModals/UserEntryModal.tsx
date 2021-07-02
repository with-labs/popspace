import React from 'react';
import { Modal } from '@components/Modal/Modal';
import { Trans, useTranslation } from 'react-i18next';
import { useRoomModalStore } from '../roomControls/useRoomModalStore';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '@components/fieldBindings/FormikSubmitButton';
import i18n from '@src/i18n';
import { makeStyles, Box, Typography } from '@material-ui/core';
import patternBg from '@src/images/illustrations/pattern_bg_1.svg';
import { MAX_NAME_LENGTH } from '@src/constants';
import { MediaReadinessContext } from '@components/MediaReadinessProvider/MediaReadinessProvider';
import { useRoomStore, RoomStateShape } from '@api/useRoomStore';
import client from '@api/client';
import { useLocalActorId } from '@api/useLocalActorId';
import { PseudoUserBubble } from '@features/room/people/PseudoUserBubble';
import { Link } from '@components/Link/Link';
import { Links } from '@constants/Links';
import { randomSectionAvatar } from '@constants/AvatarMetadata';

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
  const { isReady, onReady } = React.useContext(MediaReadinessContext);

  const closeModal = useRoomModalStore((modals) => modals.api.closeModal);

  const localId = useLocalActorId();
  const self = useRoomStore((room: RoomStateShape) => room.users[localId ?? '']?.actor);
  const isOpen = !isReady && !!self;

  const avatarName = self?.avatarName || randomSectionAvatar('brandedPatterns', self?.id);

  const onSubmitHandler = (values: { displayName: string }) => {
    closeModal('userEntry');
    client.participants.updateDisplayName(values.displayName);
    client.participants.updateAvatarName(avatarName);
    client.participants.enterMeeting();
    onReady();
  };

  // TODO:
  // when we figure out how we want to make psudeo-anon users
  // we will have to revisit this to update how we handle
  // psudeo bubble with the updateSelf function and the need to passin
  // the userId (maybe write a work around to leave support open for signed in users)
  return (
    <Formik
      initialValues={{ displayName: self?.displayName || '' }}
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
              />
              <FormikSubmitButton>{t('modals.userEntry.submitButtonText')}</FormikSubmitButton>
              <Box mt={1}>
                <Typography variant="body2" style={{ textAlign: 'center' }}>
                  <Trans i18nKey="modals.userEntry.tosDisclaimer">
                    By clicking "Enter room", you agree to our <Link to={Links.TOS}>Terms of Service</Link> and that you
                    have read our <Link to={Links.PRIVACY_POLICY}>Privacy Policy</Link>.
                  </Trans>
                </Typography>
              </Box>
            </Form>
          </Box>
        </Modal>
      )}
    </Formik>
  );
};
