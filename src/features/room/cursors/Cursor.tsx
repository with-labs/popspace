import { makeStyles, useTheme } from '@material-ui/core';
import { animated, useSpring } from '@react-spring/web';
import * as React from 'react';
import { useAvatar } from '@hooks/useAvatar/useAvatar';
import { RoomStateShape, useRoomStore } from '@roomState/useRoomStore';
import { Vector2 } from '../../../types/spatials';
import { ReactComponent as CursorSvg } from './cursor.svg';
import { getContrastRatio } from '@material-ui/core/styles/colorManipulator';
import { getAvatarFromUserId } from '@constants/AvatarMetadata';

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

  const selectPosition = React.useCallback((room: RoomStateShape) => room.cursors[userId]?.position ?? { x: 0, y: 0 }, [
    userId,
  ]);
  const selectActive = React.useCallback((room: RoomStateShape) => room.cursors[userId]?.active ?? false, [userId]);

  const name = useRoomStore((room) => room.users[userId]?.participantState.displayName ?? '???');
  const avatarName = useRoomStore(
    (room) => room.users[userId]?.participantState.avatarName ?? getAvatarFromUserId('brandedPatterns', userId)
  );
  const avatar = useAvatar(avatarName);
  const color = avatar?.backgroundColor ?? theme.palette.primary.dark;

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
