import * as React from 'react';
import { IconButton, makeStyles } from '@material-ui/core';
import { animated, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

export interface IMuteButtonProps {
  isMuted: boolean;
  isPlaying: boolean;
  onClick: () => void;
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: 'transparent',
    borderRadius: 24,
    transition: theme.transitions.create(['background-color']),
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: theme.spacing(2),
    alignItems: 'center',
    fontSize: theme.typography.pxToRem(13),
  },
  rootMuted: {
    backgroundColor: theme.palette.background.paper,
  },
}));

export const MuteButton: React.FC<IMuteButtonProps> = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const textStyles = useSpring({
    width: props.isMuted ? 100 : 0,
    paddingRight: props.isMuted ? 8 : 0,
  });

  return (
    <div className={clsx(classes.root, props.isMuted && classes.rootMuted, props.className)}>
      <animated.div style={{ overflow: 'hidden', textOverflow: 'clip', whiteSpace: 'nowrap', ...textStyles }}>
        {t('widgets.common.mutedForYou')}
      </animated.div>
      <IconButton size="small" onClick={props.onClick}>
        {props.isPlaying ? props.isMuted ? <StoppedEqualizer /> : <PlayingEqualizer /> : <PausedEqualizer />}
      </IconButton>
    </div>
  );
};

const PlayingEqualizer = () => (
  <svg
    version="1.1"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <rect x="6" y="11" width="2" height="2" rx="1">
      <animate attributeName="y" values="10; 6; 10" dur="1.3s" begin="0.21" repeatCount="indefinite" />
      <animate attributeName="height" values="4; 14; 4" dur="1.3s" begin="0.21" repeatCount="indefinite" />
    </rect>

    <rect x="11" y="11" width="2" height="2" rx="1">
      <animate attributeName="y" values="10; 6; 10" dur="1s" begin="0.13" repeatCount="indefinite" />
      <animate attributeName="height" values="4; 14; 4" dur="1s" begin="0.13" repeatCount="indefinite" />
    </rect>

    <rect x="16" y="11" width="2" height="2" rx="1">
      <animate attributeName="y" values="10; 6; 10" dur="0.7s" begin="0" repeatCount="indefinite" />
      <animate attributeName="height" values="4; 14; 4" dur="0.7s" begin="0" repeatCount="indefinite" />
    </rect>
  </svg>
);

const PausedEqualizer = () => (
  <svg
    version="1.1"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <rect x="6" y="7" width="2" height="10" rx="1"></rect>
    <rect x="11" y="4" width="2" height="16" rx="1"></rect>
    <rect x="16" y="9" width="2" height="6" rx="1"></rect>
  </svg>
);

const StoppedEqualizer = () => (
  <svg
    version="1.1"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <rect x="6" y="11" width="2" height="2" rx="2"></rect>
    <rect x="10" y="11" width="2" height="2" rx="2"></rect>
    <rect x="14" y="11" width="2" height="2" rx="2"></rect>
  </svg>
);
