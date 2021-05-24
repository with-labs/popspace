import { makeStyles } from '@material-ui/core';
import { animated, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import * as React from 'react';
import { SPRINGS } from '../../../constants/springs';

export interface IPersonBubbleVoiceIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  isVideoOn: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    bottom: -8,
    position: 'absolute',
    transform: 'translate(50%, -50%)',
  },
}));

export const PersonBubbleVoiceIndicator = React.forwardRef<HTMLDivElement, IPersonBubbleVoiceIndicatorProps>(
  ({ isVideoOn, className, ...rest }, ref) => {
    const classes = useStyles();

    const [speakingIndicatorStyles, spring] = useSpring(() => ({
      right: isVideoOn ? '32px' : '50%',
      bottom: isVideoOn ? -10 : -8,
      opacity: 1,
      config: SPRINGS.RESPONSIVE,
    }));

    // scripted animation for the transition to and from video for the speaking indicator
    // graphic - this makes the transition of the position of the icon feel less
    // awkward by hiding it while it moves, popping it in later
    React.useEffect(() => {
      (async function () {
        if (isVideoOn) {
          // returns of .start are a list of promises, we only care about 1st
          await spring.start({ opacity: 0 })[0];
          await spring.start({
            right: '32px',
            bottom: -20,
          })[0];
          await spring.start({ opacity: 1, bottom: -10 })[0];
        } else {
          await spring.start({ opacity: 0 })[0];
          await spring.start({
            right: '50%',
            bottom: -18,
          })[0];
          await spring.start({ opacity: 1, bottom: -8 })[0];
        }
      })();
    }, [isVideoOn, spring]);

    return (
      <animated.div
        ref={ref}
        className={clsx(classes.root, className)}
        style={speakingIndicatorStyles as any}
        {...rest}
      />
    );
  }
);
