import * as React from 'react';
import { useDispatch } from 'react-redux';
import { actions } from '../roomSlice';
import { useLocalParticipant } from '../../../hooks/useLocalParticipant/useLocalParticipant';
import { RemoteTrackPublication, RemoteParticipant, LocalTrackPublication, LocalParticipant } from 'twilio-video';
import { ButtonBase, makeStyles } from '@material-ui/core';
import Publication from '../../../components/Publication/Publication';
import clsx from 'clsx';

export interface IScreenShareButtonProps {
  mediaTrack: RemoteTrackPublication | LocalTrackPublication;
  participant: RemoteParticipant | LocalParticipant;
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.background.default,
    borderRadius: 6,
    boxShadow: '0 4px 32px rgba(0, 0, 0, 0.1)',
    '&:focus': {
      boxShadow: `0 0 0 2px ${theme.palette.secondary.dark}`,
    },
  },
}));

/**
 * This button displays a user's active screen share feed,
 * and clicking on it will select that feed to display full-screen
 */
export const ScreenShareButton: React.FC<IScreenShareButtonProps> = (props) => {
  const classes = useStyles();

  const localParticipant = useLocalParticipant();
  // the selection of a screenshare to full-screen does not need to be broadcast
  // to other peers
  const dispatch = useDispatch();
  const updateScreenViewSid = React.useCallback(
    (screenViewSid: string) => {
      dispatch(
        actions.updatePersonScreenViewSid({
          id: localParticipant.sid,
          screenViewSid,
        })
      );
    },
    [localParticipant.sid, dispatch]
  );

  const handleClick = React.useCallback(
    (ev: React.MouseEvent) => {
      ev.preventDefault();
      updateScreenViewSid(props.participant.sid);
    },
    [updateScreenViewSid, props.participant.sid]
  );

  return (
    <ButtonBase onClick={handleClick} className={clsx(classes.root, props.className)}>
      <Publication
        publication={props.mediaTrack}
        participant={props.participant}
        isLocal={props.participant.sid === localParticipant.sid}
      />
    </ButtonBase>
  );
};
