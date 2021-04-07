import React, { useState, useEffect, useReducer, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import Api from '../../utils/api';
import { Box, makeStyles, Typography, Button } from '@material-ui/core';
import { RouteNames } from '../../constants/RouteNames';

import { RoomSummary } from './RoomSummary/RoomSummary';
import { Header } from '../../components/Header/Header';
import { RoomInfo } from '../../types/api';
import { ErrorCodes } from '../../constants/ErrorCodes';
import { useTranslation, Trans } from 'react-i18next';
import { Page } from '../../Layouts/Page/Page';
import { logger } from '../../utils/logger';
import useQueryParams from '../../hooks/useQueryParams/useQueryParams';
import { DialogModal, DialogMessage } from '../../components/DialogModal/DialogModal';
import { getErrorDialogText } from '../../utils/ErrorMessage';
import { RenameRoomModal } from './RenameRoomModal/RenameRoomModal';
import { DeleteRoomModal } from './DeleteRoomModal/DeleteRoomModal';
import { InviteModal } from './InviteModal/InviteModal';
import { getErrorMessageFromResponse } from '../../utils/ErrorMessage';
import { Link } from '../../components/Link/Link';
import { USER_SUPPORT_EMAIL } from '../../constants/User';
import { MAX_FREE_ROOMS } from '../../constants/room';
import { useCurrentUserProfile, UserProfile } from '../../hooks/api/useCurrentUserProfile';
import { Origin } from '../../analytics/constants';
import { useDefaultRoom } from '../../hooks/api/useDefaultRoom';

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
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  roomGrid: {
    height: '100%',
    width: '100%',
    display: 'grid',
    'grid-gap': '32px',
    'grid-template-columns': '100%',
    [theme.breakpoints.up('md')]: {
      'grid-template-columns': '1fr 1fr',
      width: 632,
    },
  },
  createRoomButtonWrapper: {
    flexDirection: 'column',
    marginBottom: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
    },
  },
  createRoomButton: {
    width: '100%',
    marginBottom: theme.spacing(2),
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

function useOrderedRooms(profile?: UserProfile) {
  const { rooms: { owned, member } = { owned: [], member: [] } } = profile || {};
  const { data: defaultRoomRoute, error } = useDefaultRoom();
  useEffect(() => {
    if (error) {
      logger.error(`Failed to get default room for user ${profile?.user.id}`, error);
    }
    // disable deps check; for debug error reporting only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);
  return useMemo(() => {
    const allRooms = [...owned, ...member];
    if (defaultRoomRoute) {
      const defaultIndex = allRooms.findIndex((room) => room.route === defaultRoomRoute);
      if (defaultIndex !== -1) {
        const [defaultRoom] = allRooms.splice(defaultIndex, 1);
        allRooms.unshift(defaultRoom);
      }
    }
    return allRooms;
  }, [owned, member, defaultRoomRoute]);
}

export const Dashboard: React.FC<IDashboardProps> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { user, profile, error, update, isLoading } = useCurrentUserProfile();
  const rooms = useOrderedRooms(profile);

  // boot to signin if there's an error fetching profile data
  useEffect(() => {
    if (error) {
      history.push(RouteNames.SIGN_IN);
    }
  }, [error, history]);

  // boot to create room if there are no rooms
  const hasNoRooms = !isLoading && !error && rooms.length === 0;
  useEffect(() => {
    if (hasNoRooms) {
      history.push(`${RouteNames.CREATE_ROOM}?onboarding=true`);
    }
  }, [hasNoRooms, history]);

  const ownedRoomCount = profile?.rooms.owned.length ?? 0;

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

  const deleteRoom = async (roomInfo: RoomInfo) => {
    try {
      const response = await Api.roomDelete(roomInfo.room_id);
      if (response.success) {
        // update the query cache to remove the room
        update((data) => {
          if (!data || !data.profile) return {};
          const ownedIndex = data.profile.rooms.owned.findIndex((r) => r.route === roomInfo.route);
          if (ownedIndex !== -1) {
            data.profile.rooms.owned.splice(ownedIndex, 1);
            // copy array to ensure hooks update
            data.profile.rooms.owned = [...data.profile.rooms.owned];
          } else {
            const memberIndex = data.profile.rooms.member.findIndex((r) => r.route === roomInfo.route);
            if (memberIndex !== -1) {
              data.profile.rooms.member.splice(memberIndex, 1);
              // copy array to ensure hooks update
              data.profile.rooms.member = [...data.profile.rooms.member];
            }
          }
          return data;
        });
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
        // update the query cache to rename the room
        update((data) => {
          if (!data || !data.profile) return {};
          const ownedIndex = data.profile.rooms.owned.findIndex((room) => room.room_id === roomInfo.room_id);
          if (ownedIndex !== -1) {
            data.profile.rooms.owned[ownedIndex].display_name = response.display_name;
            data.profile.rooms.owned[ownedIndex].route = response.route;
          }
          return data;
        });
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
    <Page isLoading={isLoading} error={error}>
      <Box display="flex" justifyContent="center" flexGrow={1}>
        <Box display="flex" flexDirection="column" flexBasis="auto" className={classes.wrapper}>
          <Header isFullLength={true} userName={user ? user['first_name'] : ''} />
          <div className={classes.bgContainer}>
            <Box display="flex" className={classes.createRoomButtonWrapper}>
              <Button
                className={classes.createRoomButton}
                component={Link}
                disableStyling
                to={RouteNames.CREATE_ROOM}
                disabled={ownedRoomCount >= MAX_FREE_ROOMS}
                state={{ origin: Origin.CREATE_ROOM_BUTTON }}
              >
                {t('pages.dashboard.createRoomButton')}
              </Button>
              {ownedRoomCount >= MAX_FREE_ROOMS && (
                <Box pl={2} pt={0.5} flex={1}>
                  <Trans i18nKey="modals.createRoomModal.limitBody" values={{ maxRooms: MAX_FREE_ROOMS }}>
                    We currently have a limit of 20 rooms per user. If you need more rooms, please
                    <Link to={`mailto:${USER_SUPPORT_EMAIL}`}> contact us</Link>!
                  </Trans>
                </Box>
              )}
            </Box>
            <div className={classes.roomWrapper}>
              <div className={classes.roomGrid}>
                {rooms.map((memberRoom) => {
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
