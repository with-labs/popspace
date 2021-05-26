import React, { useEffect, useCallback } from 'react';
import i18n from '../../../i18n';
import { makeStyles, Box, Typography, Hidden } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import patternBg from '../../../images/illustrations/pattern_bg_1.svg';
import { Spacing } from '@components/Spacing/Spacing';
import { AvatarSelectorBubble } from '@features/roomControls/avatar/AvatarSelectorBubble';
import { CameraToggle } from '@features/roomControls/media/CameraToggle';
import { MicToggle } from '@features/roomControls/media/MicToggle';
import useLocalVideoToggle from '@providers/media/hooks/useLocalVideoToggle';
import useLocalAudioToggle from '@providers/media/hooks/useLocalAudioToggle';
import { ApiNamedRoom, ApiParticipantState } from '@utils/api';
import { useCurrentUserProfile } from '@hooks/api/useCurrentUserProfile';
import Api from '@utils/api';
import { useHistory } from 'react-router-dom';
import useQueryParams from '@hooks/useQueryParams/useQueryParams';
import { DialogModal, DialogMessage } from '@components/DialogModal/DialogModal';
import { ErrorCodes } from '@constants/ErrorCodes';
import { Header } from '@components/Header/Header';
import { getErrorMessageFromResponse, getErrorDialogText } from '@utils/ErrorMessage';
import { logger } from '@utils/logger';
import { useRoomRoute } from '@hooks/useRoomRoute/useRoomRoute';
import { getAvatarFromUserId } from '@constants/AvatarMetadata';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { MAX_NAME_LENGTH } from '../../../constants';
import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '@components/fieldBindings/FormikSubmitButton';
export interface IEntryViewProps {
  onComplete: () => void;
}

export type EntryViewData = {
  displayName: string;
};

const validationSchema = Yup.object().shape({
  displayName: Yup.string()
    .max(MAX_NAME_LENGTH, i18n.t('pages.preroom.maxSize', { maxNameLength: MAX_NAME_LENGTH }))
    .required(i18n.t('common.required')),
});

const emptyRoomInfo = {
  room_id: '',
  owner_id: '',
  preview_image_url: '',
  display_name: '',
  route: '',
  url_id: '',
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '100vh',
    overflow: 'hidden',
    alignSelf: 'center',
    justifyContent: 'center',

    [theme.breakpoints.up('md')]: {
      height: '100vh',
    },
  },
  contentWrapper: {
    width: '100%',
    alignSelf: 'center',
    height: '100%',
    display: 'grid',
    gridTemplateAreas: '"content list"',
    gridTemplateColumns: 'minmax(auto, 500px) 1fr',
    gridGap: theme.spacing(4),
    overflow: 'hidden',

    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    paddingRight: theme.spacing(4),
    paddingTop: theme.spacing(7.5),
    paddingBottom: theme.spacing(7.5),
    paddingLeft: theme.spacing(7.5),
    overflow: 'auto',
    gridArea: 'content',
    height: '100%',

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3),
      overflow: 'visible',
      width: '100%',
      justifySelf: 'center',
      paddingBottom: '100px',
      justifyContent: 'center',
    },
  },
  list: {
    gridArea: 'list',
    overflow: 'auto',
    backgroundColor: theme.palette.brandColors.sand.regular,
  },
  background: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 32,
    width: '100%',
    backgroundColor: theme.palette.brandColors.mandarin.light,
    backgroundImage: `url(${patternBg})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },
  avatarButton: {
    border: 'none',
    background: 'none',
    marginTop: theme.spacing(6),
    left: '50%',
    transform: 'translateX(-50%)',
    cursor: 'pointer',
  },
  nameField: {
    position: 'relative',
    zIndex: 1,
  },
  openRoomListButton: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    '& .MuiButton-label	': {
      justifyContent: 'start',
    },
  },
  imgWrapper: {
    width: 48,
    height: 48,
    paddingRight: theme.spacing(1),
  },
  owner: {
    color: theme.palette.brandColors.oregano.bold,
  },
  guest: {
    color: theme.palette.brandColors.slate.bold,
  },
  displayTitle: {
    fontWeight: 'bold',
  },
}));

export const EntryView: React.FC<IEntryViewProps> = ({ onComplete }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const [isVideoOn, toggleVideoOn, isVideoBusy] = useLocalVideoToggle();
  const [isMicOn, doMicToggle, isAudioBusy] = useLocalAudioToggle();
  const { profile, update, user } = useCurrentUserProfile();
  const participantState = profile?.participantState;
  const defaultDisplayName = participantState?.display_name ?? profile?.user.display_name;

  const avatar = participantState?.avatar_name;

  // check to see if we have url error code and set it as the default error if we have it
  const query = useQueryParams();
  const errorInfo = query.get('e');
  const [errorMsg, setErrorMsg] = React.useState<DialogMessage | null>(getErrorDialogText(errorInfo as ErrorCodes, t));

  const updateProfile = useCallback(
    async (newProfileData: { [key: string]: any }) => {
      try {
        const newProfile = { ...participantState, ...newProfileData } as ApiParticipantState;
        const response = await Api.setParticipantState(newProfile);

        if (response.success) {
          // update the query cache
          update((data) => {
            if (!data || !data.profile) return {};
            data.profile.participantState = newProfile;
            return data;
          });
        } else {
          // TODO: update this to reflect the error message we get from the api
          setErrorMsg({
            title: t('common.error'),
            body: response.message ?? '',
          } as DialogMessage);
          logger.error('Error updating user participant profile', response);
        }
      } catch (err) {
        setErrorMsg({
          title: t('common.error'),
          body: getErrorMessageFromResponse(err, t) ?? '',
        } as DialogMessage);
        // unexpected error happened
        logger.error('Unexpected Error updating user participant profile', err);
      }
    },
    [participantState, t, update]
  );

  useEffect(() => {
    // if the user doesnt have an avatar set (ie: first time log in)
    // we will pick a random brand avatar and then save it off
    async function initalizeUserAvatar() {
      if (!avatar) {
        const newAvatar = getAvatarFromUserId('brandedPatterns', user ? user.id : '');
        await updateProfile({ avatar_name: newAvatar });
      }
    }

    initalizeUserAvatar();
  }, [avatar, updateProfile, user]);

  const handleComplete = (values: EntryViewData) => {
    if (values.displayName !== participantState?.display_name) {
      updateProfile({
        display_name: values.displayName,
      });
    }
    onComplete();
  };

  const handleKeyDown = (keyEvent: any) => {
    // prevent the enter key from submitting the form
    if ((keyEvent.charCode || keyEvent.keyCode) === 13) {
      keyEvent.preventDefault();
    }
  };

  const clearUrlError = () => {
    if (errorInfo) {
      const searchParams = new URLSearchParams(history.location.search);
      searchParams.delete('e');
      // remove the error from the query string when the user has cleared
      // the error
      history.replace({
        pathname: history.location.pathname,
        search: searchParams.toString(),
      });
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <main className={classes.root}>
      <div className={classes.contentWrapper}>
        <Formik
          initialValues={{ displayName: defaultDisplayName || '' }}
          onSubmit={handleComplete}
          validateOnMount
          validationSchema={validationSchema}
          validateOnBlur
        >
          {({ values }) => (
            <Form onKeyDown={handleKeyDown} className={classes.content}>
              <Box minHeight="100%" display="flex" flexDirection="column" height="100%">
                <Header isFullLength={true} userName={user ? user['first_name'] : ''} />
                <Box display="flex" flexDirection="column" flex={1}>
                  <Box position="relative" marginBottom={0.5}>
                    <div className={classes.background} />
                    <AvatarSelectorBubble
                      className={classes.avatarButton}
                      userData={{
                        userId: profile.user.id,
                        displayName: participantState?.display_name || '',
                        avatarName: participantState?.avatar_name || '',
                      }}
                      updateSelf={updateProfile}
                      showVideo
                    />
                  </Box>

                  <Box display="flex" flexDirection="row" mb={2} alignItems="flex-start">
                    <FormikTextField
                      id="displayName"
                      name="displayName"
                      placeholder={t('pages.preroom.namePlaceholder')}
                    />
                  </Box>

                  <Spacing style={{ alignSelf: 'center', marginTop: 8 }} alignItems="center">
                    <CameraToggle isVideoOn={isVideoOn} toggleVideoOn={toggleVideoOn} busy={isVideoBusy} />
                    <MicToggle isMicOn={isMicOn} doMicToggle={doMicToggle} busy={isAudioBusy} />
                  </Spacing>
                </Box>
                <Hidden smDown>
                  <Typography paragraph>{t('pages.preroom.setupExplanation')}</Typography>
                </Hidden>
                <FormikSubmitButton disabled={!values.displayName}>{t('pages.preroom.joinButton')}</FormikSubmitButton>
              </Box>
            </Form>
          )}
        </Formik>
        <Box display="flex" justifyContent="center" className={classes.list}></Box>
      </div>
      <DialogModal message={errorMsg} onClose={clearUrlError}></DialogModal>
    </main>
  );
};
