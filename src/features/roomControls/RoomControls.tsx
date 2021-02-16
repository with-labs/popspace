import * as React from 'react';
import { Box, makeStyles, Paper } from '@material-ui/core';
import { RoomAddContent } from './addContent/RoomAddContent';
import { MediaControls } from './media/MediaControls';
import { RoomMenu } from './roomMenu/RoomMenu';
import { MembersMenu } from './membership/MembersMenu';
import { BugReport } from './BugReport/BugReport';
import { SendFeedback } from './SendFeedback/SendFeedback';
import clsx from 'clsx';
import { SizeTransition } from '../../components/SizeTransition/SizeTransition';
import { AwayToggle } from './away/AwayToggle';
import { AwayScreen } from './away/AwayScreen';
import { AwayExplainer } from './away/AwayExplainer';
import { useIsAway } from './away/useIsAway';

export interface IRoomControlsProps {}

const useStyles = makeStyles((theme) => ({
  controlsLayout: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: theme.spacing(2),
    pointerEvents: 'none',
    zIndex: theme.zIndex.speedDial,
    display: 'grid',
    gridTemplateAreas: '"content media members" "blank1 blank1 blank1" "feedback feedback blank2"',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'auto 1fr auto',
    gridGap: theme.spacing(2),

    '& > * ': {
      pointerEvents: 'auto',
    },

    [theme.breakpoints.down('sm')]: {
      gridTemplateAreas: '"content members" "feedback blank1" "blank2 blank2" "media blank3"',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: 'auto auto 1fr auto',
    },
  },
  controlSurface: {
    padding: theme.spacing(0.5),
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'center',
  },
  mediaControlSurface: {
    justifySelf: 'center',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),

    [theme.breakpoints.down('sm')]: {
      justifySelf: 'start',
    },
  },
  settingsButton: {
    marginLeft: theme.spacing(1),
  },
  buttonPadding: {
    marginRight: theme.spacing(2),
  },
  sizeTransitionContents: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaControls: {
    marginRight: theme.spacing(1),
  },
}));

export const RoomControls = React.memo<IRoomControlsProps>((props) => {
  const classes = useStyles();

  const [isAway] = useIsAway();

  return (
    <>
      {isAway && (
        <AwayScreen>
          <AwayExplainer />
        </AwayScreen>
      )}
      <Box className={classes.controlsLayout}>
        <Box
          gridArea="content"
          visibility={isAway ? 'hidden' : 'initial'}
          justifySelf="start"
          component={Paper}
          className={classes.controlSurface}
        >
          <RoomMenu />
          <RoomAddContent />
        </Box>
        <Box
          gridArea="media"
          component={Paper}
          minHeight={48}
          className={clsx(classes.controlSurface, classes.mediaControlSurface)}
        >
          <SizeTransition transitionKey={isAway ? 'away' : 'present'} contentClassName={classes.sizeTransitionContents}>
            <>
              {!isAway && <MediaControls className={classes.mediaControls} />}
              <AwayToggle />
            </>
          </SizeTransition>
        </Box>
        <Box
          gridArea="members"
          justifySelf="end"
          visibility={isAway ? 'hidden' : 'initial'}
          component={Paper}
          className={classes.controlSurface}
        >
          <MembersMenu />
        </Box>

        <Box gridArea="feedback" visibility={isAway ? 'hidden' : 'initial'} flexDirection="row">
          <BugReport className={classes.buttonPadding} />
          <SendFeedback />
        </Box>
      </Box>
    </>
  );
});
