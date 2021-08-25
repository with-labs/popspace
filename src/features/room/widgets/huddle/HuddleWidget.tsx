import { Box, makeStyles, ThemeProvider, Typography } from '@material-ui/core';
import { animated, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { SPRINGS } from '@constants/springs';
import { CanvasObject } from '@providers/canvas/CanvasObject';
import { useLocalMediaGroup } from '@providers/media/useLocalMediaGroup';
import { snow } from '@src/theme/theme';
import { useWidgetContext } from '../useWidgetContext';
import { WidgetContent } from '../WidgetContent';
import { WidgetResizeHandle } from '../WidgetResizeHandle';
import { WidgetEditableTitlebar } from '../WidgetEditableTitlebar';
import { MAX_SIZE, MIN_SIZE } from './constants';
import { WidgetType } from '@api/roomState/types/widgets';
export interface IHuddleWidgetProps {
  children?: React.ReactNode;
}

const useStyles = makeStyles((theme) => ({
  root: {
    pointerEvents: 'none',
    userSelect: 'none',
    cursor: 'default',
  },
  frame: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: 'transparent',
    borderRadius: theme.shape.borderRadius,
    flex: 1,
    height: '100%',
  },
  titlebar: {
    pointerEvents: 'initial',
  },
  resizeHandle: {
    pointerEvents: 'initial',
  },
  resizeContainer: {
    pointerEvents: 'none',
  },
  region: {
    backgroundColor: `rgba(255, 255, 255, 0.5)`,
    height: '100%',
    boxShadow: `inset 0 0 0 0 transparent`,
    transition: theme.transitions.create(['background-color', 'box-shadow']),
  },
  active: {
    backgroundColor: `rgba(255, 255, 255, 0.75)`,
    boxShadow: `inset 0 0 0 4px ${theme.palette.primary.main}`,
  },
}));

export const HuddleWidget: React.FC<IHuddleWidgetProps> = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    widget: { widgetId, widgetState },
    save,
  } = useWidgetContext<WidgetType.Huddle>();

  const localMediaGroup = useLocalMediaGroup((store) => store.localMediaGroup);
  const isActiveHuddle = localMediaGroup === widgetId;

  // manages the 'bounce' animation that happens when a user enters
  // a huddle
  const [frameStyle, frameSpring] = useSpring(() => ({
    scale: 1,
    config: SPRINGS.WOBBLY,
  }));

  React.useEffect(() => {
    if (isActiveHuddle) {
      frameSpring.start({ scale: 1.05 });
      setTimeout(() => {
        frameSpring.start({ scale: 1 });
      }, 50);
    }
  }, [isActiveHuddle, frameSpring]);

  const onTitleChanged = (newTitle: string) => {
    save({
      title: newTitle,
    });
  };

  // note we don't use WidgetFrame here as it's too opinionated toward a standard
  // widget use-case, we just manually render CanvasObject (an invisible container now)
  // and then put the animated div which is our new 'frame' inside it.
  return (
    <ThemeProvider theme={snow}>
      <CanvasObject
        objectId={widgetId}
        objectKind="widget"
        zIndex={0}
        className={classes.root}
        minWidth={MIN_SIZE.width}
        minHeight={MIN_SIZE.height}
        maxWidth={MAX_SIZE.width}
        maxHeight={MAX_SIZE.height}
      >
        <animated.div className={classes.frame} style={frameStyle}>
          <WidgetEditableTitlebar
            title={widgetState.title ? widgetState.title : t('widgets.huddle.name')}
            className={classes.titlebar}
            onTitleChanged={onTitleChanged}
          />
          <WidgetContent className={clsx(classes.region, isActiveHuddle && classes.active)}>
            <Box display="flex" alignItems="center" justifyContent="center" width="100%" height="100%">
              {isActiveHuddle ? (
                <Typography>{t('widgets.huddle.welcome')}</Typography>
              ) : (
                <Typography>{t('widgets.huddle.explainer')}</Typography>
              )}
            </Box>
          </WidgetContent>
          <WidgetResizeHandle className={classes.resizeHandle} />
        </animated.div>
      </CanvasObject>
    </ThemeProvider>
  );
};
