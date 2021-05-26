import * as React from 'react';
import { IconButton, makeStyles } from '@material-ui/core';
import { animated, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { AudioIndicator } from '@components/AudioIndicator/AudioIndicator';

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
        <AudioIndicator variant="sine" isActive={!props.isMuted} isPaused={!props.isPlaying && !props.isMuted} />
      </IconButton>
    </div>
  );
};
