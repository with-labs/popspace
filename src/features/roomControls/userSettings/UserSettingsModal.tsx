import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { Form, Formik } from 'formik';
import { Box, makeStyles, Button } from '@material-ui/core';
import { animated, useSpring } from '@react-spring/web';
import { Modal } from '../../../components/Modal/Modal';
import { ModalPane } from '../../../components/Modal/ModalPane';
import { ModalTitleBar } from '../../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../../components/Modal/ModalContentWrapper';
import { FormikTextField } from '../../../components/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '../../../components/fieldBindings/FormikSubmitButton';
import { AvatarSelector } from '../avatar/AvatarSelector';
import { useRoomModalStore } from '../useRoomModalStore';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { useCurrentUserProfile } from '../../../hooks/api/useCurrentUserProfile';
import { PseudoUserBubble } from '../../room/people/PseudoUserBubble';
import { AutoPIPToggle } from './AutoPIPToggle';
import { isAutoPIPAvailable } from '../../pictureInPicture/pictureInPictureFeatureDetection';
import { useFeatureFlag } from 'flagg';
import { MAX_DISPLAY_NAME_LENGTH } from '../../../constants';
import * as Yup from 'yup';

export type UserSettingFormData = {
  displayName: string;
};

const validationSchema = Yup.object().shape({
  displayName: Yup.string()
    .trim()
    .required(i18n.t('modals.userSettingsModal.displayNameInput.blankError'))
    .max(MAX_DISPLAY_NAME_LENGTH, i18n.t('pages.signup.firstName.maxSize', { maxNameLength: MAX_DISPLAY_NAME_LENGTH })),
});

interface IUserSettingsModalProps {}

const useStyles = makeStyles((theme) => ({
  modalContent: {
    [theme.breakpoints.down('sm')]: {
      height: '90vh',
    },
  },
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  },
  userInputWrapper: {
    flexDirection: 'row',

    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  avatarPanel: {
    backgroundColor: theme.palette.brandColors.sand.regular,
    borderRadius: theme.shape.borderRadius,
  },
  bubble: {
    marginBottom: theme.spacing(5),
  },
  nameField: {
    flex: 1,
  },
  submitButton: {
    marginLeft: theme.spacing(1),
    marginTop: 24,
    height: 48,
  },
}));

export const UserSettingsModal: React.FC<IUserSettingsModalProps> = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const isOpen = useRoomModalStore((modals) => modals.userSettings);
  const closeModal = useRoomModalStore((modals) => modals.api.closeModal);
  const [isAvatarSelectionOpen, setIsAvatarSelectionOpen] = useState(false);

  const animatedStyle = useSpring({
    left: !isAvatarSelectionOpen ? '0%' : '-100%',
    width: '200%',
    height: '100%',
    display: 'flex',
    position: 'relative',
  });
  const updateSelf = useRoomStore((room) => room.api.updateSelf);

  // get the current users information
  const { user } = useCurrentUserProfile();
  const userId = user?.id ?? '';
  const person = useRoomStore((room) => room.users[userId ?? '']);
  const { avatarName, displayName } = person?.participantState ?? {};

  const onCloseHandler = () => {
    setIsAvatarSelectionOpen(false);
    closeModal('userSettings');
  };

  const onSubmitHandler = useCallback(
    (values: UserSettingFormData) => {
      if (!userId) return;
      updateSelf({ displayName: values.displayName.trim() });
    },
    [updateSelf, userId]
  );

  const setAvatar = useCallback(
    (newAvatar: string) => {
      if (!userId) return;
      setIsAvatarSelectionOpen(false);
      updateSelf({ avatarName: newAvatar });
    },
    [updateSelf, userId]
  );

  const [hasPip] = useFeatureFlag('pictureInPicture');

  return (
    <Modal onClose={onCloseHandler} isOpen={isOpen}>
      <ModalTitleBar
        title={isAvatarSelectionOpen ? t('modals.userSettingsModal.avatarTitle') : t('modals.userSettingsModal.title')}
        onClose={onCloseHandler}
        onBack={
          isAvatarSelectionOpen
            ? () => {
                setIsAvatarSelectionOpen(false);
              }
            : null
        }
      />
      <ModalContentWrapper className={classes.modalContent}>
        <div className={classes.wrapper}>
          <animated.div style={animatedStyle as any}>
            <div style={{ width: '100%', height: '100%' }}>
              <Box display="flex" className={classes.userInputWrapper} alignItems="center" justifyContent="center">
                <ModalPane className={classes.avatarPanel}>
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                    <PseudoUserBubble
                      userData={{ userId, displayName, avatarName }}
                      isVideoOn={false}
                      isMicOn={true}
                      className={classes.bubble}
                    />
                    <Button onClick={() => setIsAvatarSelectionOpen(true)} color="primary" fullWidth={false}>
                      {t('modals.userSettingsModal.editAvatarButton')}
                    </Button>
                  </Box>
                </ModalPane>
                <ModalPane>
                  <Formik
                    initialValues={{ displayName: displayName ? displayName : '' }}
                    onSubmit={onSubmitHandler}
                    validateOnMount
                    enableReinitialize
                    validationSchema={validationSchema}
                  >
                    <Form>
                      <Box display="flex" flexDirection="row" mb={2} alignItems="flex-start">
                        <FormikTextField
                          id="userSetters-displayName"
                          className={classes.nameField}
                          name="displayName"
                          placeholder={t('modals.userSettingsModal.displayNameInput.placeholder')}
                          label={t('modals.userSettingsModal.displayNameInput.label')}
                          margin="normal"
                          helperText={t('modals.userSettingsModal.displayNameInput.helperText')}
                        />
                        <FormikSubmitButton activeOnChange fullWidth={false} className={classes.submitButton}>
                          {t('modals.userSettingsModal.submitButton')}
                        </FormikSubmitButton>
                      </Box>
                    </Form>
                  </Formik>
                  {/*
                    If auto picture-in-picture feature is available, show
                    a setting to enable or disable it.
                   */}
                  {isAutoPIPAvailable && hasPip && (
                    <Box p={2}>
                      <AutoPIPToggle />
                    </Box>
                  )}
                </ModalPane>
              </Box>
            </div>
            <div style={{ width: '100%', height: '100%' }}>
              <AvatarSelector onChange={setAvatar} value={avatarName ?? null} />
            </div>
          </animated.div>
        </div>
      </ModalContentWrapper>
    </Modal>
  );
};
