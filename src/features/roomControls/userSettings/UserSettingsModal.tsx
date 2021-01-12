import React, { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectors as controlsSelectors, actions as controlsActions } from '../roomControlsSlice';
import { selectors as roomSelectors, actions as roomActions } from '../../room/roomSlice';
import { useTranslation } from 'react-i18next';
import { Form, Formik } from 'formik';
import { Box, makeStyles, Button, Typography, useTheme } from '@material-ui/core';
import { animated, useSpring } from '@react-spring/web';

import { Avatar } from '../../../components/Avatar/Avatar';
import { Modal } from '../../../components/Modal/Modal';
import { ModalPane } from '../../../components/Modal/ModalPane';
import { ModalTitleBar } from '../../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../../components/Modal/ModalContentWrapper';
import { FormikTextField } from '../../../components/fieldBindings/FormikTextField';
import { sessionTokenExists } from '../../../utils/sessionToken';
import { useLocalParticipant } from '../../../hooks/useLocalParticipant/useLocalParticipant';
import useParticipantDisplayIdentity from '../../../hooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';
import { useCoordinatedDispatch } from '../../room/CoordinatedDispatchProvider';
import { useAuth } from '../../../hooks/useAuth/useAuth';
import { useAvatar } from '../../../hooks/useAvatar/useAvatar';

import { AvatarCategory } from './AvatarCategory';

export type UserSettingFormData = {
  displayName: string;
};

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
  avatarPannel: {
    backgroundColor: theme.palette.brandColors.sand.regular,
    borderRadius: theme.shape.borderRadius,
  },
  avatarRoot: {
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    border: `4px solid ${theme.palette.background.paper}`,
    transition: theme.transitions.create('border-color'),
    display: 'flex',
    flexDirection: 'column',
    boxShadow: theme.mainShadows.surface,
    borderRadius: '100%',
    width: 140,
    height: 140,
    marginBottom: theme.spacing(5),
  },
  mainContent: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '100%',
  },
  avatar: {
    width: '100%',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: 41,
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
  name: {
    fontSize: theme.typography.pxToRem(13),
    fontWeight: theme.typography.fontWeightMedium,
    textOverflow: 'ellipsis',
    margin: '0 auto',
    maxWidth: '80%',
  },
  bottomSection: {
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '1',
    height: 16,
  },
  background: {
    width: '100%',
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    height: 91,
  },
}));

export const UserSettingsModal: React.FC<IUserSettingsModalProps> = (props) => {
  const theme = useTheme();

  const classes = useStyles();
  const dispatch = useDispatch();
  const coordinatedDispatch = useCoordinatedDispatch();
  const { t } = useTranslation();
  const isOpen = useSelector(controlsSelectors.selectIsUserSettingsModalOpen);
  const { sessionToken } = useAuth();
  const [isAvatarSelectionOpen, setIsAvatarSelectionOpen] = useState(false);

  const animatedStyle = useSpring({
    left: !isAvatarSelectionOpen ? '0%' : '-100%',
    width: '200%',
    height: '100%',
    display: 'flex',
    position: 'relative',
  });

  // get the current users information
  const localParticipant = useLocalParticipant();
  const sid = localParticipant?.sid;
  const person = useSelector(roomSelectors.createPersonSelector(sid));
  const { avatar: avatarName } = person ?? {};
  const { backgroundColor } = useAvatar(avatarName || '') ?? { backgroundColor: theme.palette.grey[50] };

  // visible screen name
  const displayIdentity = useParticipantDisplayIdentity(localParticipant);

  const onCloseHandler = () => {
    dispatch(controlsActions.setIsUserSettingsModalOpen({ isOpen: false }));
    setIsAvatarSelectionOpen(false);
  };

  const onSubmitHandler = (values: UserSettingFormData) => {
    if (sessionTokenExists(sessionToken)) {
      // Api.updateUserInformation(sessionToken, '', values.displayName)
      //   .then((result: any) => {
      //     //TODO fill this out with Alekesi
      //   })
      //   .catch((e: any) => {});
    }
  };

  const setAvatar = useCallback(
    (newAvatar: string) => {
      coordinatedDispatch(roomActions.updatePersonAvatar({ id: sid, avatar: newAvatar }));
      setIsAvatarSelectionOpen(false);
    },
    [coordinatedDispatch, sid]
  );

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
                <ModalPane className={classes.avatarPannel}>
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                    <div className={classes.avatarRoot}>
                      <div className={classes.mainContent}>
                        <div className={classes.background} style={{ backgroundColor }} />
                        <Avatar className={classes.avatar} name={avatarName || ''} />
                        <div className={classes.bottomSection}>
                          <Typography className={classes.name}>{displayIdentity}</Typography>
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => setIsAvatarSelectionOpen(true)} color="primary" fullWidth={false}>
                      {t('modals.userSettingsModal.editAvatarButton')}
                    </Button>
                  </Box>
                </ModalPane>
                <ModalPane>
                  <Formik
                    initialValues={{ displayName: displayIdentity ? displayIdentity : '' }}
                    onSubmit={onSubmitHandler}
                    validateOnMount
                    enableReinitialize
                  >
                    <Form>
                      <Box display="flex" flexDirection="row">
                        <FormikTextField
                          className=""
                          name="displayName"
                          placeholder={t('modals.userSettingsModal.displayNameInput.placeholder')}
                          label={t('modals.userSettingsModal.displayNameInput.label')}
                          margin="normal"
                          helperText={t('modals.userSettingsModal.displayNameInput.helperText')}
                          disabled={true}
                        />
                      </Box>
                    </Form>
                  </Formik>
                </ModalPane>
              </Box>
            </div>
            <div style={{ width: '100%', height: '100%' }}>
              <AvatarCategory onChange={setAvatar} value={avatarName ?? null} />
            </div>
          </animated.div>
        </div>
      </ModalContentWrapper>
    </Modal>
  );
};
