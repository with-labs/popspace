import React, { forwardRef, useEffect, useReducer } from 'react';
import {
  makeStyles,
  Box,
  Switch,
  Typography,
  Button,
  CircularProgress,
  ThemeProvider,
  TextField,
  Collapse,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useIsRoomOwner } from '../../../hooks/useIsRoomOwner/useIsRoomOwner';
import { useRoomRoute } from '../../../hooks/useRoomRoute/useRoomRoute';
import { ErrorCodes } from '../../../constants/ErrorCodes';
import Api, { ApiInviteDetails } from '../../../utils/api';
import { getErrorDialogText } from '../../../utils/ErrorMessage';
import { DialogModal, DialogMessage } from '../../../components/DialogModal/DialogModal';
import { logger } from '../../../utils/logger';
import { LinkIcon } from '../../../components/icons/LinkIcon';
import { cherry, oregano, mandarin } from '../../../theme/theme';
import { useExpiringToggle } from '../../../hooks/useExpiringToggle/useExpiringToggle';

export interface IInviteLinkProps {}

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(2),
  },
  root: {
    marginTop: theme.spacing(2),
  },
  swtichWrapper: {
    marginBottom: theme.spacing(1),
  },
  iconWrapper: {
    marginRight: theme.spacing(2),
  },
  titleWrapper: {},
  buttonSpacer: {
    marginRight: theme.spacing(0.5),
  },
  multilineInput: {
    padding: theme.spacing(2),
    width: '100%',
    resize: 'none',
    wordBreak: 'break-all',
  },
}));

type InviteLinkState = {
  isLoading: boolean;
  shareUrl: string | null;
  error: DialogMessage | null;
  isBusy: boolean;
};

enum ACTIONS {
  SET_LOADING = 'SET_LOADING',
  SET_SHARE_URL = 'SET_SHARE_URL',
  SET_ERROR = 'SET_ERROR',
  SET_IS_BUSY = 'SET_IS_BUSY',
}

type InviteAction = {
  type: string;
  payload: any;
};

type InviteDetails = {
  otp: string;
  inviteId: string;
};

function InviteLinkReducer(state: InviteLinkState, action: InviteAction) {
  switch (action.type) {
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
    case ACTIONS.SET_IS_BUSY: {
      return {
        ...state,
        isBusy: action.payload,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function formatPublicInviteLink(inviteDetails: InviteDetails) {
  return (
    window.location.origin +
    `/invite/${encodeURIComponent(inviteDetails.otp)}?iid=${encodeURIComponent(inviteDetails.inviteId)}`
  );
}

export const InviteLink = forwardRef<HTMLDivElement, IInviteLinkProps>((props, ref) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isRoomOwner = useIsRoomOwner();
  const currentRoomRoute = useRoomRoute();
  const [toggleCopyButton, setToggleCopyButton] = useExpiringToggle(false);

  const [state, dispatch] = useReducer(InviteLinkReducer, {
    isLoading: false,
    shareUrl: null,
    error: null,
    isBusy: false,
  });

  useEffect(() => {
    if (currentRoomRoute) {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      Api.getCurrentPublicInviteLink(currentRoomRoute)
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
  }, [currentRoomRoute, t]);

  const toggleSwitch = async () => {
    try {
      if (currentRoomRoute) {
        if (state.shareUrl) {
          const result = await Api.disablePublicInviteLink(currentRoomRoute);
          if (result.success) {
            dispatch({ type: ACTIONS.SET_SHARE_URL, payload: null });
          } else {
            // this will return a no such room or permissions denied from the back end
            // which shouldnt happen if only the room owner is doing this action, so we will throw
            // an error to be caught and reported
            throw new Error('Unexecpected error in invite link disablePublicInviteLink ');
          }
        } else {
          const result = await Api.enablePublicInviteLink(currentRoomRoute);
          if (result.success) {
            dispatch({
              type: ACTIONS.SET_SHARE_URL,
              payload: formatPublicInviteLink({ otp: result.otp, inviteId: result.inviteId }),
            });
          } else {
            throw new Error('Unexecpected error in invite link enablePublicInviteLink');
          }
        }
      }
    } catch (err) {
      logger.error(`Error InviteLink toggle`, err);
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: getErrorDialogText(ErrorCodes.UNEXPECTED, t, t('common.error')),
      });
    }
  };

  const onCopyPressed = async () => {
    try {
      if (state.shareUrl) {
        setToggleCopyButton(true);
        await navigator.clipboard.writeText(state.shareUrl);
      }
    } catch (err) {
      logger.error(`Error copying public invite link`, err);
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: getErrorDialogText(ErrorCodes.UNEXPECTED, t, t('common.error')),
      });
    }
  };

  const onResetLinkPressed = async () => {
    try {
      if (currentRoomRoute) {
        dispatch({ type: ACTIONS.SET_IS_BUSY, payload: true });
        const result = await Api.resetPublicInviteLink(currentRoomRoute);
        dispatch({ type: ACTIONS.SET_IS_BUSY, payload: false });

        if (result.success) {
          dispatch({
            type: ACTIONS.SET_SHARE_URL,
            payload: formatPublicInviteLink({ otp: result.otp, inviteId: result.inviteId }),
          });
        }
      }
    } catch (err) {
      logger.error(`Error resetting public invite link`, err);
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: getErrorDialogText(ErrorCodes.UNEXPECTED, t, t('common.error')),
      });
    }
  };

  return (
    <Box className={classes.root}>
      <Box display="flex" flexDirection="row" mb={1} alignItems="center">
        <Box display="flex" flexDirection="row" alignItems="center" flexGrow="1">
          <LinkIcon fontSize="default" className={classes.iconWrapper} />
          <Typography variant="h4">{t('features.roomControls.linkInviteTitle')}</Typography>
        </Box>
        {state.isLoading ? (
          <CircularProgress size={24} />
        ) : (
          <Switch
            disabled={!state.shareUrl && !isRoomOwner}
            checked={!!state.shareUrl}
            onChange={toggleSwitch}
            name="toggle-invite-link"
            inputProps={{ 'aria-label': t('features.roomControls.linkInviteAriaLabel') }}
          />
        )}
      </Box>
      <Collapse in={state.shareUrl}>
        <TextField
          name={t('features.roomControls.linkInviteName')}
          fullWidth
          value={state.shareUrl ?? ''}
          multiline
          rows={3}
          variant="filled"
          InputProps={{ classes: { multiline: classes.multilineInput } }}
        />
        <Box display="flex" flexDirection="row" alignItems="center" flexGrow="1" mt={1} mb={1}>
          <ThemeProvider theme={toggleCopyButton ? oregano : mandarin}>
            <Button
              disabled={state.isBusy}
              className={classes.buttonSpacer}
              onClick={onCopyPressed}
              fullWidth
              aria-label={t('features.roomControls.copyLinkButtonAria')}
            >
              {t(`features.roomControls.${toggleCopyButton ? 'linkCopied' : 'CopyLinkButtonText'}`)}
            </Button>
          </ThemeProvider>
          <ThemeProvider theme={cherry}>
            <Button
              disabled={state.isBusy}
              onClick={onResetLinkPressed}
              fullWidth
              aria-label={t('features.roomControls.resetLinkButtonAria')}
            >
              {state.isBusy ? <CircularProgress size={22} /> : t('features.roomControls.resetLinkButtonText')}
            </Button>
          </ThemeProvider>
        </Box>
      </Collapse>
      <DialogModal message={state.error} onClose={() => dispatch({ type: ACTIONS.SET_ERROR, payload: null })} />
    </Box>
  );
});
