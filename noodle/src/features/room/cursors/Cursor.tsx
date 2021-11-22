import { RoomStateShape, useRoomStore } from '@api/useRoomStore';
import { useAvatarBackgroundColor } from '@components/Avatar/useAvatarBackgroundColor';
import { getAvatarFromUserId } from '@constants/AvatarMetadata';
import { makeStyles, useTheme } from '@material-ui/core';
import { getContrastRatio } from '@material-ui/core/styles/colorManipulator';
import { animated, useSpring } from '@react-spring/web';
import * as React from 'react';

import { Vector2 } from '../../../types/spatials';
import { ReactComponent as CursorSvg } from './cursor.svg';

export interface ICursorProps {
  userId: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    overflow: 'visible',
  },
  nameWrapper: {
    position: 'absolute',
    top: '14px',
    left: '10px',
    fontSize: theme.typography.pxToRem(12),
    backgroundColor: 'currentColor',
    padding: '2px 8px 2px 8px',
    borderRadius: 12,
    whiteSpace: 'nowrap',
    maxWidth: 200,
    textOverflow: 'hidden',
    overflow: 'hidden',
  },
}));

export const Cursor = React.memo<ICursorProps>(({ userId }) => {
  const classes = useStyles();
  const theme = useTheme();

  const selectPosition = React.useCallback(
    (room: RoomStateShape) => room.cursors[userId]?.position ?? { x: 0, y: 0 },
    [userId]
  );
  const selectActive = React.useCallback((room: RoomStateShape) => room.cursors[userId]?.active ?? false, [userId]);

  const name = useRoomStore((room) => room.users[userId]?.actor.displayName ?? '???');
  const avatarName = useRoomStore((room) => room.users[userId]?.actor.avatarName ?? getAvatarFromUserId(userId));
  const color = useAvatarBackgroundColor(avatarName);

  const [styles, spring] = useSpring(() => ({
    // populate initial state from store
    ...selectPosition(useRoomStore.getState()),
    visibility: selectActive(useRoomStore.getState()) ? ('visible' as const) : ('hidden' as const),
    color,
  }));

  React.useEffect(() => {
    useRoomStore.subscribe<Vector2>((pos) => {
      spring.start({
        x: pos.x,
        y: pos.y,
      });
    }, selectPosition);

    useRoomStore.subscribe<boolean>((active) => {
      spring.start({ visibility: active ? 'visible' : 'hidden' });
    }, selectActive);
  }, [selectPosition, selectActive, spring]);

  // update spring when avatar color changes
  React.useEffect(() => {
    spring.start({ color });
  }, [color, spring]);

  const contrastColor = React.useMemo(() => {
    const ratio = getContrastRatio(theme.palette.common.black, color);
    if (ratio < 8) {
      return theme.palette.common.white;
    } else {
      return theme.palette.common.black;
    }
  }, [color, theme]);

  return (
    <animated.div className={classes.root} style={styles as any}>
      <CursorSvg />
      <div className={classes.nameWrapper}>
        <span style={{ color: contrastColor }}>{name}</span>
      </div>
    </animated.div>
  );
});
