import { Box, Button, TextField, makeStyles, Typography, ThemeProvider, CircularProgress } from '@material-ui/core';
import React, { useEffect, useReducer } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { MembershipManagement } from '../../features/roomControls/membership/MembershipManagement';
import { FormPageFields } from '../../Layouts/formPage/FormPageFields';
import { FormPageTitle } from '../../Layouts/formPage/FormPageTitle';

import Api, { ApiInviteDetails } from '../../utils/api';
import { logger } from '../../utils/logger';
import { getErrorDialogText } from '../../utils/ErrorMessage';
import { ErrorCodes } from '../../constants/ErrorCodes';
import { useExpiringToggle } from '../../hooks/useExpiringToggle/useExpiringToggle';
import { cherry, slate, blueberry } from '../../theme/theme';

import { Analytics } from '../../analytics/Analytics';
import { EventNames } from '../../analytics/constants';
import { DialogModal, DialogMessage } from '../../components/DialogModal/DialogModal';
import { USER_SUPPORT_EMAIL } from '../../constants/User';
import { Link } from '../../components/Link/Link';
import { formatPublicInviteLink } from '../../utils/linkFormater';
import { ApiNamedRoom } from '../../utils/api';

export interface IInviteRoomMemberStepProps {
  onComplete: (numMembers: number | null, isSkipped: boolean) => void;
  queryRef?: string;
  origin?: string;
  roomData: ApiNamedRoom;
}

const useStyles = makeStyles((theme) => ({
  ink: {
    color: theme.palette.brandColors.ink.regular,
  },
  multilineInput: {
    padding: theme.spacing(2),
    width: '100%',
    resize: 'none',
    wordBreak: 'break-all',
  },
  buttonSpacer: {
    marginRight: theme.spacing(1),
  },
  copyButton: {
    borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
  },
  inviteLink: {
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0 `,
  },
  verticalSpacer: {
    marginBottom: theme.spacing(1),
  },
  linkArea: {
    height: 89,
    backgroundColor: theme.palette.brandColors.slate.light,
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0 `,
  },
}));

enum CAL_INVITES {
  GOOGLE = 'GOOGLE',
  OUTLOOK = 'OUTLOOK',
}

type InviteRoomMemberStepState = {
  isLoading: boolean;
  isDirty: boolean;
  isBusy: boolean;
  shareUrl: string | null;
  numMembers: number | null;
  isEmailInvite: boolean;
  error: DialogMessage | null;
};

enum ACTIONS {
  SET_LOADING = 'SET_LOADING',
  SET_SHARE_URL = 'SET_SHARE_URL',
  SET_ERROR = 'SET_ERROR',
  SET_IS_BUSY = 'SET_IS_BUSY',
  SET_IS_DIRTY = 'SET_IS_DIRTY',
  SET_NUM_MEMBERS = 'SET_NUM_MEMBERS',
  SET_EMAIL_INVITE = 'SET_EMAIL_INVITE',
}

type InviteAction = {
  type: string;
  payload: any;
};

function InviteRoomMemberStepReducer(state: InviteRoomMemberStepState, action: InviteAction) {
  switch (action.type) {
    case ACTIONS.SET_IS_BUSY: {
      return {
        ...state,
        isBusy: action.payload,
      };
    }
    case ACTIONS.SET_LOADING: {
      return {
        ...state,
        isLoading: action.payload,
      };
    }
    case ACTIONS.SET_SHARE_URL: {
      return {
        ...state,
        shareUrl: action.payload,
      };
    }
    case ACTIONS.SET_ERROR: {
      return {
        ...state,
        error: action.payload,
      };
    }
    case ACTIONS.SET_IS_DIRTY: {
      return {
        ...state,
        isDirty: action.payload,
      };
    }
    case ACTIONS.SET_NUM_MEMBERS: {
      return {
        ...state,
        numMembers: action.payload,
      };
    }
    case ACTIONS.SET_EMAIL_INVITE: {
      return {
        ...state,
        isEmailInvite: action.payload,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export const InviteRoomMemberStep: React.FC<IInviteRoomMemberStepProps> = ({
  onComplete,
  queryRef,
  origin,
  roomData,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [toggleCopyButton, setToggleCopyButton] = useExpiringToggle(false);

  const [state, dispatch] = useReducer(InviteRoomMemberStepReducer, {
    isLoading: false,
    isDirty: false,
    isBusy: false,
    shareUrl: '',
    numMembers: null,
    isEmailInvite: false,
    error: null,
  });

  useEffect(() => {
    if (roomData && roomData.route) {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      Api.getCurrentPublicInviteLink(roomData.route)
        .then((result: ApiInviteDetails) => {
          if (result.success && result?.inviteDetails && result?.inviteDetails?.length > 0) {
            const inviteDetails = result.inviteDetails[0];
            const shareUrl = formatPublicInviteLink(inviteDetails);
            // if routes is non-zero we have a shared link available
            dispatch({ type: ACTIONS.SET_SHARE_URL, payload: shareUrl });
          }
        })
        .catch((err) => {
          logger.error(`Error getting currentPublicInviteLink`, err);
          dispatch({
            type: ACTIONS.SET_ERROR,
            payload: getErrorDialogText(ErrorCodes.UNEXPECTED, t, t('common.error')),
          });
        })
        .finally(() => {
          dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        });
    }
  }, [roomData, t]);

  const onCopyPressed = async () => {
    try {
      if (state.shareUrl) {
        setToggleCopyButton(true);
        await navigator.clipboard.writeText(state.shareUrl);
        dispatch({ type: ACTIONS.SET_IS_DIRTY, payload: true });
        Analytics.trackEvent(EventNames.ONBOARDING_COPY_LINK, { origin, ref: queryRef, roomId: roomData.room_id });
      }
    } catch (err) {
      logger.error(`Error copying public invite link`, err);
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: getErrorDialogText(ErrorCodes.UNEXPECTED, t, t('common.error')),
      });
    }
  };

  const onCalInvitePresses = (inviteType: CAL_INVITES) => {
    const eventTitle = t('pages.createRoom.inviteMembers.event.title');
    const eventMessage = t('pages.createRoom.inviteMembers.event.body', {
      roomName: roomData.display_name,
      joinUrl: state.shareUrl,
    });
    let nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7));

    const year = nextMonday.getFullYear();
    const month = nextMonday.getMonth() < 9 ? '0' + (nextMonday.getMonth() + 1) : nextMonday.getMonth() + 1;
    const day = nextMonday.getDate() < 10 ? '0' + nextMonday.getDate() : nextMonday.getDate();

    if (inviteType === CAL_INVITES.GOOGLE) {
      const googleDate = year + '' + month + '' + day; // YYYYMMDD
      const googleUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?dates=${googleDate}T130000Z/${googleDate}T140000Z&details=${eventMessage}&text=${eventTitle}`;
      window.open(googleUrl, '_blank');
    } else if (inviteType === CAL_INVITES.OUTLOOK) {
      const outlookDate = year + '-' + month + '-' + day; // YYYY-MM-DD
      const outlookUrl = `https://outlook.office.com/calendar/0/deeplink/compose?body=${eventMessage}&enddt=${outlookDate}T14%3A00%3A00%2B00%3A00&path=%2Fcalendar%2Faction%2Fcompose&rru=addevent&startdt=${outlookDate}T13%3A00%3A00%2B00%3A00&subject=${eventTitle}`;
      window.open(outlookUrl, '_blank');
    }

    Analytics.trackEvent(EventNames.ONBOARDING_CALENDAR_INVITE, {
      origin,
      ref: queryRef,
      roomId: roomData.room_id,
      type: inviteType,
    });
    dispatch({ type: ACTIONS.SET_IS_DIRTY, payload: true });
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <FormPageTitle>{t('pages.createRoom.inviteMembers.title')}</FormPageTitle>
      <FormPageFields flex={1}>
        {!state.isEmailInvite && (
          <>
            <Box mb={3}>
              <Box mb={2}>
                <Typography variant="body1">{t('pages.createRoom.inviteMembers.linkExplain')}</Typography>
              </Box>
              {state.isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" className={classes.linkArea}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TextField
                    name={t('features.roomControls.linkInviteName')}
                    fullWidth
                    value={state.shareUrl ?? ''}
                    multiline
                    rows={3}
                    variant="filled"
                    InputProps={{ classes: { root: classes.inviteLink, multiline: classes.multilineInput } }}
                    className={classes.inviteLink}
                  />
                  <ThemeProvider theme={slate}>
                    <Button
                      className={classes.copyButton}
                      disabled={state.isBusy || state.isLoading}
                      onClick={onCopyPressed}
                      fullWidth
                      aria-label={t('features.roomControls.copyLinkButtonAria')}
                    >
                      <span className={classes.ink}>
                        {t(`features.roomControls.${toggleCopyButton ? 'linkCopied' : 'CopyLinkButtonText'}`)}
                      </span>
                    </Button>
                  </ThemeProvider>
                </>
              )}
            </Box>
            <Box>
              <Box mb={2}>
                <Typography variant="body1">{t('pages.createRoom.inviteMembers.linkEmailInvite')}</Typography>
              </Box>
              <Box display="flex" flexDirection="row">
                <ThemeProvider theme={cherry}>
                  <Button
                    disabled={state.isLoading}
                    onClick={() => onCalInvitePresses(CAL_INVITES.GOOGLE)}
                    className={classes.buttonSpacer}
                  >
                    {t('pages.createRoom.inviteMembers.googleCalButton')}
                  </Button>
                </ThemeProvider>
                <ThemeProvider theme={blueberry}>
                  <Button disabled={state.isLoading} onClick={() => onCalInvitePresses(CAL_INVITES.OUTLOOK)}>
                    {t('pages.createRoom.inviteMembers.officeCalButton')}
                  </Button>
                </ThemeProvider>
              </Box>
            </Box>
          </>
        )}
        {state.isEmailInvite && (
          <>
            <Box mb={2}>
              <Typography variant="body1">{t('pages.createRoom.inviteMembers.emailExplain')}</Typography>
            </Box>
            <MembershipManagement
              roomRoute={roomData.route}
              onChange={() => dispatch({ type: ACTIONS.SET_IS_DIRTY, payload: true })}
              onMemberListUpdate={(numMembers: number | null) => {
                dispatch({ type: ACTIONS.SET_NUM_MEMBERS, payload: numMembers });
              }}
            />
          </>
        )}
      </FormPageFields>
      <Button
        fullWidth
        color={'default'}
        onClick={() => {
          Analytics.trackEvent(
            state.isEmailInvite ? EventNames.ONBOARDING_VIA_LINK : EventNames.ONBOARDING_VIA_INVITE,
            { origin, ref: queryRef, roomId: roomData.room_id }
          );
          dispatch({ type: ACTIONS.SET_EMAIL_INVITE, payload: !state.isEmailInvite });
        }}
        className={classes.verticalSpacer}
      >
        {t(
          state.isEmailInvite
            ? 'pages.createRoom.inviteMembers.inviteLink'
            : 'pages.createRoom.inviteMembers.inviteEmail'
        )}
      </Button>
      <Button
        fullWidth
        color={state.isDirty ? 'primary' : 'default'}
        onClick={() => onComplete(state.numMembers, state.isDirty)}
      >
        {t(state.isDirty ? 'pages.createRoom.inviteMembers.continue' : 'pages.createRoom.inviteMembers.skip')}
      </Button>
      <DialogModal message={state.error} onClose={() => dispatch({ type: ACTIONS.SET_ERROR, payload: null })}>
        <Typography variant="body1" component={'span'}>
          <Trans i18nKey="error.roomMangement.message">
            Please retry. If that keeps happening, please <Link to={`mailto:${USER_SUPPORT_EMAIL}`}> contact us</Link>{' '}
            and we will sort it out.
          </Trans>
        </Typography>
      </DialogModal>
    </Box>
  );
};
