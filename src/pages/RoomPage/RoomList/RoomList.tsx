import React, { useReducer } from 'react';
import { Box, makeStyles, Hidden, Drawer, Typography } from '@material-ui/core';
import { DialogModal, DialogMessage } from '../../../components/DialogModal/DialogModal';
import { RoomInfo } from '../../../types/api';
import { ApiNamedRoom } from '../../../utils/api';
import { useTranslation, Trans } from 'react-i18next';
import { useCurrentUserProfile } from '../../../hooks/api/useCurrentUserProfile';
import Api from '../../../utils/api';
import { RenameRoomModal } from './RenameRoomModal/RenameRoomModal';
import { DeleteRoomModal } from './DeleteRoomModal/DeleteRoomModal';
import { InviteModal } from './InviteModal/InviteModal';
import { LeaveRoomModal } from './LeaveRoomModal/LeaveRoomModal';
import { RoomSummary } from './RoomSummary';
import { getErrorMessageFromResponse } from '../../../utils/ErrorMessage';
import { logger } from '../../../utils/logger';
import { RoomListHeader } from './RoomListHeader/RoomListHeader';
import { useRoomRoute } from '../../../hooks/useRoomRoute/useRoomRoute';
import { Link } from '../../../components/Link/Link';
import { USER_SUPPORT_EMAIL } from '../../../constants/User';
import { useHistory } from 'react-router-dom';

interface IRoomListProps {
  rooms: ApiNamedRoom[];
  isOpen: boolean;
  onClose: () => void;
  onError: (msg: DialogMessage) => void;
  onRoomSelected: (roomInfo: ApiNamedRoom) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.brandColors.sand.regular,
  },
  roomWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },
  roomGrid: {
    paddingBottom: theme.spacing(2),
    height: '100%',
    width: '100%',
    display: 'grid',
    'grid-gap': '16px',
    'grid-template-columns': '100%',
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 15,
      paddingRight: 15,
    },

    [theme.breakpoints.up('md')]: {
      'grid-template-columns': '1fr',
      width: 484,
    },

    [theme.breakpoints.up('lg')]: {
      'grid-template-columns': '1fr 1fr',
      width: 484,
    },
  },
  wrapper: {
    width: '100%',
    paddingTop: theme.spacing(9),
    paddingBottom: theme.spacing(9),
    backgroundColor: theme.palette.brandColors.sand.regular,
    [theme.breakpoints.down('sm')]: {
      paddingTop: 0,
      paddingBottom: 0,
    },
  },
  drawerAnchor: {
    maxHeight: '100vh',
  },
  drawerPaper: {
    padding: 0,
    backgroundColor: theme.palette.brandColors.sand.regular,
  },
  buttonWrapper: {
    paddingRight: 15,
    paddingLeft: 15,
    width: `100%`,
  },
}));

enum MODAL_OPTS {
  RENAME = 'RENAME',
  INVITE = 'INVITE',
  CREATE = 'CREATE',
  DELETE = 'DELETE',
  LEAVE = 'LEAVE',
}

type RoomListState = {
  modalOpen: MODAL_OPTS | null;
  error: DialogMessage | null;
  selectedRoomInfo: RoomInfo | null;
};

type RoomListAction = {
  type: string;
  payload: any;
};

enum ACTIONS {
  UPDATE_MODAL = 'UPDATE_MODAL',
  SET_MANGEMENT_ERROR = 'SET_MANGEMENT_ERROR',
  CLOSE_MODAL = 'CLOSE_MODAL',
}

function RoomListReducer(state: RoomListState, action: RoomListAction) {
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

export const RoomList: React.FC<IRoomListProps> = ({ rooms, isOpen = false, onClose, onError, onRoomSelected }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const currentRoomRoute = useRoomRoute();
  const { update } = useCurrentUserProfile();
  const history = useHistory();

  const [state, dispatch] = useReducer(RoomListReducer, {
    modalOpen: null,
    error: null,
    selectedRoomInfo: null,
  });

  const onRoomSummaryError = (msg: string) => {
    onError({ body: msg, title: t('error.noteError.title') } as DialogMessage);
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
      onError({
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
      onError({
        title: t('common.error'),
        body: getErrorMessageFromResponse(err, t) ?? '',
      } as DialogMessage);
      // unexpected error happened
      logger.error('Unexpected Error renaming room', err);
    }
  };

  const leaveRoom = async (roomInfo: RoomInfo) => {
    try {
      const response = await Api.removeSelfFromRoom(roomInfo.route);
      if (response.success) {
        // update room list
        update((data) => {
          if (!data || !data.profile) return {};
          const memberRoomIndex = data.profile.rooms.member.findIndex((r) => r.route === roomInfo.route);
          // only check member rooms since you cant leave a room you've created right now
          if (memberRoomIndex !== -1) {
            data.profile.rooms.member.splice(memberRoomIndex, 1);
            // copy array to ensure hooks update
            data.profile.rooms.member = [...data.profile.rooms.member];
          }

          if (currentRoomRoute === roomInfo.route) {
            // if the currently selected room is the one we  are leaving,
            // then we neeed to update the room to to be the first one in the list
            const defaultRoom = rooms[0];
            onRoomSelected(defaultRoom);
            history.replace(`/${defaultRoom.route}?join`);
          }
          return data;
        });
      } else {
        dispatch({ type: ACTIONS.SET_MANGEMENT_ERROR, payload: t('error.roomMangement.leaveRoomErrorTitle') });
      }
    } catch (err) {
      onError({
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
          <LeaveRoomModal
            isOpen={state.modalOpen === MODAL_OPTS.LEAVE}
            onClose={() => dispatch({ type: ACTIONS.CLOSE_MODAL, payload: null })}
            roomInfo={state.selectedRoomInfo}
            onLeave={leaveRoom}
          />
        </Box>
      );
    }
  };

  const roomSummaryList = rooms.map((memberRoom) => {
    return (
      <RoomSummary
        key={memberRoom.room_id}
        isActive={currentRoomRoute === memberRoom.route}
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
        onLeave={(roomInfo: RoomInfo) =>
          dispatch({ type: ACTIONS.UPDATE_MODAL, payload: { modal: MODAL_OPTS.LEAVE, roomInfo } })
        }
        onErrorHandler={onRoomSummaryError}
        onRoomSelected={(roomInfo) => {
          onRoomSelected(roomInfo);
          onClose();
        }}
      />
    );
  });

  return (
    <Box display="flex" flexDirection="column" flexBasis="auto" className={classes.wrapper}>
      <Hidden smDown>
        <div className={classes.roomWrapper}>
          <RoomListHeader className={classes.buttonWrapper} />
          <div className={classes.roomGrid}>{roomSummaryList}</div>
        </div>
      </Hidden>
      <Hidden mdUp>
        <Drawer
          anchor="bottom"
          open={isOpen}
          onClose={() => onClose()}
          classes={{
            paper: classes.drawerPaper,
            paperAnchorBottom: classes.drawerAnchor,
          }}
        >
          <RoomListHeader onClose={onClose} />
          <div className={classes.roomGrid}>{roomSummaryList}</div>
        </Drawer>
      </Hidden>
      {renderModals()}
      <DialogModal message={state.error} onClose={() => dispatch({ type: ACTIONS.SET_MANGEMENT_ERROR, payload: null })}>
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
