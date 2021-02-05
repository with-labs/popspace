import React, { useState, useEffect, useReducer } from 'react';
import { useHistory } from 'react-router-dom';
import Api from '../../utils/api';
import { Box, makeStyles, Typography, Button } from '@material-ui/core';
import { RouteNames } from '../../constants/RouteNames';

import { RoomSummary } from './RoomSummary/RoomSummary';
import { Header } from '../../components/Header/Header';
import { RoomInfo, ErrorInfo, UserInfo } from '../../types/api';
import { ErrorCodes } from '../../constants/ErrorCodes';
import { sessionTokenExists, getSessionToken, removeSessionToken } from '../../utils/sessionToken';
import { useTranslation, Trans } from 'react-i18next';
import { Page } from '../../Layouts/Page/Page';
import { logger } from '../../utils/logger';
import useQueryParams from '../../hooks/useQueryParams/useQueryParams';
import { DialogModal, DialogMessage } from '../../components/DialogModal/DialogModal';
import { getErrorDialogText } from '../../utils/ErrorMessage';
import { CreateRoomModal } from './CreateRoomModal/CreateRoomModal';
import { RenameRoomModal } from './RenameRoomModal/RenameRoomModal';
import { DeleteRoomModal } from './DeleteRoomModal/DeleteRoomModal';
import { InviteModal } from './InviteModal/InviteModal';
import { getErrorMessageFromResponse } from '../../utils/ErrorMessage';
import { Link } from '../../components/Link/Link';
import { USER_SUPPORT_EMAIL } from '../../constants/User';

interface IDashboardProps {}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.brandColors.snow.regular,
  },
  wrapper: {
    maxWidth: 700,
    width: '80%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  text: {
    marginBottom: theme.spacing(4),
  },
  bgContainer: {
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    backgroundColor: theme.palette.brandColors.sand.regular,
    padding: theme.spacing(4),
    overflowY: 'auto',
    height: '100%',
  },
  roomWrapper: {
    with: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  roomGrid: {
    height: '100%',
    display: 'grid',
    'grid-gap': '32px',
    'grid-template-columns': '100%',
    [theme.breakpoints.up('md')]: {
      'grid-template-columns': '1fr 1fr',
      width: 632,
    },
  },
  createRoomButton: {
    width: '100%',
    marginBottom: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
      width: '164px',
    },
  },
}));

enum MODAL_OPTS {
  RENAME = 'RENAME',
  INVITE = 'INVITE',
  CREATE = 'CREATE',
  DELETE = 'DELETE',
}

type DashboardState = {
  modalOpen: MODAL_OPTS | null;
  error: DialogMessage | null;
  selectedRoomInfo: RoomInfo | null;
};

type DashboardAction = {
  type: string;
  payload: any;
};

enum ACTIONS {
  UPDATE_MODAL = 'UPDATE_MODAL',
  SET_MANGEMENT_ERROR = 'SET_MANGEMENT_ERROR',
  CLOSE_MODAL = 'CLOSE_MODAL',
}

function DashboadReducer(state: DashboardState, action: DashboardAction) {
  switch (action.type) {
    case ACTIONS.UPDATE_MODAL: {
      return {
        ...state,
        modalOpen: action.payload.modal,
        selectedRoomInfo: action.payload.roomInfo ?? null,
      };
    }
    case ACTIONS.CLOSE_MODAL: {
      return {
        ...state,
        modalOpen: null,
        selectedRoomInfo: null,
      };
    }
    case ACTIONS.SET_MANGEMENT_ERROR: {
      const errorValue = action.payload ? { title: action.payload, body: '' } : null;
      return {
        ...state,
        error: errorValue,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export const Dashboard: React.FC<IDashboardProps> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(!sessionTokenExists(getSessionToken()));
  const [pageError, setPageError] = useState<ErrorInfo>(null!);
  const [user, setUser] = useState<UserInfo>(null!);
  const [rooms, setRooms] = useState<{ owned: RoomInfo[]; member: RoomInfo[] }>({ owned: [], member: [] });
  const { t } = useTranslation();
  const query = useQueryParams();

  const [state, dispatch] = useReducer(DashboadReducer, {
    modalOpen: null,
    error: null,
    selectedRoomInfo: null,
  });

  // check to see if we have url error code and set it as the default error if we have it
  const errorInfo = query.get('e');
  const [errorMsg, setErrorMsg] = useState<DialogMessage | null>(getErrorDialogText(errorInfo as ErrorCodes, t));

  // run this on mount
  useEffect(() => {
    const sessionToken = getSessionToken();
    if (sessionTokenExists(sessionToken)) {
      setIsLoading(true);
      // TODO: replace this with the updated api
      // Fix typing
      Api.getProfile()
        .then((result: any) => {
          // there is an edge case that profile a profile will return null if a user doesnt
          // exist in the db, but they have a valid session token, so just check if there is a profile
          // if not redirect to the signin page
          if (result.success && result.profile) {
            // this means we have a valid token
            setUser(result.profile.user);
            setRooms(result.profile.rooms);
          } else {
            // we dont have a valid token, so redirect to sign in and remove old token
            removeSessionToken();
            history.push(RouteNames.SIGN_IN);
          }
        })
        .catch((e: any) => {
          logger.error(`Error calling api call getProfile`, e);
          setPageError({
            errorCode: ErrorCodes.UNEXPECTED,
            error: e,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // we arent logged in so redirect to the sign in page
      history.push(RouteNames.SIGN_IN);
    }
  }, [history]);

  const onRoomSummaryError = (msg: string) => {
    setErrorMsg({ body: msg, title: t('error.noteError.title') } as DialogMessage);
  };

  const clearUrlError = () => {
    if (errorInfo) {
      // remove the error from the query string when the user has cleared
      // the error
      history.replace(RouteNames.ROOT);
    }
  };

  const createNewRoom = async (roomDisplayName: string) => {
    try {
      const response = await Api.roomCreate(roomDisplayName);
      if (response.success) {
        // add new room to the room state
        setRooms({ owned: [response.newRoom, ...rooms.owned], member: rooms.member });
        dispatch({ type: ACTIONS.UPDATE_MODAL, payload: { modal: MODAL_OPTS.INVITE, roomInfo: response.newRoom } });
      } else {
        // same modal more or less for every error we get back from the backend
        dispatch({ type: ACTIONS.SET_MANGEMENT_ERROR, payload: t('error.roomMangement.createRoomErrorTitle') });
      }
    } catch (err) {
      setErrorMsg({
        title: t('common.error'),
        body: getErrorMessageFromResponse(err, t) ?? '',
      } as DialogMessage);
      // unexpected error happened
      logger.error('Unexpected Error Creating room', err);
    }
  };

  const deleteRoom = async (roomInfo: RoomInfo) => {
    try {
      const response = await Api.roomDelete(roomInfo.room_id);
      if (response.success) {
        const ownedIndex = rooms.owned.indexOf(roomInfo);
        if (ownedIndex > -1) {
          rooms.owned.splice(ownedIndex, 1);
          setRooms({ owned: rooms.owned, member: rooms.member });
        } else {
          const memberIndex = rooms.member.indexOf(roomInfo);
          if (memberIndex === -1) {
            return;
          }
          rooms.member.splice(memberIndex, 1);
          setRooms({ owned: rooms.owned, member: rooms.member });
        }
      } else {
        // same modal more or less for every error we get back from the backend
        dispatch({ type: ACTIONS.SET_MANGEMENT_ERROR, payload: t('error.roomMangement.deleteRoomErrorTitle') });
      }
    } catch (err) {
      setErrorMsg({
        title: t('common.error'),
        body: getErrorMessageFromResponse(err, t) ?? '',
      } as DialogMessage);
      // unexpected error happened
      logger.error('Unexpected Error Deleting room', err);
    }
  };

  const renameRoom = async (roomInfo: RoomInfo, newName: string) => {
    try {
      const response = await Api.roomRename(roomInfo.room_id, newName);
      if (response.success) {
        roomInfo.display_name = response.display_name;
        roomInfo.route = response.route;
        setRooms({ owned: rooms.owned, member: rooms.member });
      } else {
        dispatch({ type: ACTIONS.SET_MANGEMENT_ERROR, payload: t('error.roomMangement.renameRoomErrorTitle') });
      }
    } catch (err) {
      setErrorMsg({
        title: t('common.error'),
        body: getErrorMessageFromResponse(err, t) ?? '',
      } as DialogMessage);
      // unexpected error happened
      logger.error('Unexpected Error renaming room', err);
    }
  };

  const renderModals = () => {
    if (state.selectedRoomInfo) {
      return (
        <Box>
          <RenameRoomModal
            isOpen={state.modalOpen === MODAL_OPTS.RENAME}
            onClose={() => dispatch({ type: ACTIONS.CLOSE_MODAL, payload: null })}
            onRename={renameRoom}
            roomInfo={state.selectedRoomInfo}
          />
          <DeleteRoomModal
            isOpen={state.modalOpen === MODAL_OPTS.DELETE}
            onClose={() => dispatch({ type: ACTIONS.CLOSE_MODAL, payload: null })}
            onDelete={deleteRoom}
            roomInfo={state.selectedRoomInfo}
          />
          <InviteModal
            isOpen={state.modalOpen === MODAL_OPTS.INVITE}
            onClose={() => dispatch({ type: ACTIONS.CLOSE_MODAL, payload: null })}
            roomInfo={state.selectedRoomInfo}
          />
        </Box>
      );
    }
  };

  // TODO: figure out better room name sorting for display the rooms, I have a feeling we will
  // get a complaint about new rooms or freq. used rooms appearing at the bottom of the list on refresh
  return (
    <Page isLoading={isLoading} error={pageError}>
      <Box display="flex" justifyContent="center" flexGrow={1}>
        <Box display="flex" flexDirection="column" flexBasis="auto" className={classes.wrapper}>
          <Header isFullLength={true} userName={user ? user['first_name'] : ''} />
          <div className={classes.bgContainer}>
            <Button
              className={classes.createRoomButton}
              onClick={() => dispatch({ type: ACTIONS.UPDATE_MODAL, payload: { modal: MODAL_OPTS.CREATE } })}
            >
              {t('pages.dashboard.createRoomButton')}
            </Button>
            <div className={classes.roomWrapper}>
              <div className={classes.roomGrid}>
                {[...rooms.owned, ...rooms.member].map((memberRoom) => {
                  return (
                    <RoomSummary
                      key={memberRoom.room_id}
                      roomInfo={memberRoom}
                      onInvite={(roomInfo: RoomInfo) =>
                        dispatch({ type: ACTIONS.UPDATE_MODAL, payload: { modal: MODAL_OPTS.INVITE, roomInfo } })
                      }
                      onRename={(roomInfo: RoomInfo) =>
                        dispatch({ type: ACTIONS.UPDATE_MODAL, payload: { modal: MODAL_OPTS.RENAME, roomInfo } })
                      }
                      onDelete={(roomInfo: RoomInfo) =>
                        dispatch({ type: ACTIONS.UPDATE_MODAL, payload: { modal: MODAL_OPTS.DELETE, roomInfo } })
                      }
                      onErrorHandler={onRoomSummaryError}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </Box>
      </Box>
      <CreateRoomModal
        isOpen={state.modalOpen === MODAL_OPTS.CREATE}
        onClose={() => dispatch({ type: ACTIONS.CLOSE_MODAL, payload: null })}
        onSubmit={createNewRoom}
        numberOfRoomsOwned={rooms.owned.length}
      />
      {renderModals()}
      <DialogModal message={errorMsg} onClose={clearUrlError}></DialogModal>
      <DialogModal message={state.error} onClose={() => dispatch({ type: ACTIONS.SET_MANGEMENT_ERROR, payload: null })}>
        <Typography variant="body1" component={'span'}>
          <Trans i18nKey="error.roomMangement.message">
            Please retry. If that keeps happening, please <Link to={`mailto:${USER_SUPPORT_EMAIL}`}> contact us</Link>{' '}
            and we will sort it out.
          </Trans>
        </Typography>
      </DialogModal>
    </Page>
  );
};
