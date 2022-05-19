import { Box, makeStyles, ThemeProvider, Typography } from '@material-ui/core';
import { animated, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { SPRINGS } from '@constants/springs';
import { CanvasObject } from '@providers/canvas/CanvasObject';
import { useLocalMediaGroup } from '@src/media/useLocalMediaGroup';
import { snow } from '@src/theme/theme';
import { useWidgetContext } from '../useWidgetContext';
import { WidgetContent } from '../WidgetContent';
import { WidgetResizeHandle } from '../WidgetResizeHandle';
import { WidgetEditableTitlebar } from '../WidgetEditableTitlebar';
import { MAX_SIZE, MIN_SIZE } from './constants';
import { WidgetType } from '@api/roomState/types/widgets';
import { ThemeName, getThemeFromName } from '../../../../theme/theme';
import { Analytics } from '@analytics/Analytics';
import { useRoomStore } from '@api/useRoomStore';

const ANALYTICS_ID = 'huddle_widget';

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
  const roomId = useRoomStore((store) => store.id);

  const {
    widget: { widgetId, type, widgetState },
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
    Analytics.trackEvent(`${ANALYTICS_ID}_change_widget_title`, newTitle, {
      title: newTitle,
      widgetId: widgetId,
      type: type,
      roomId,
    });
  };

  const onColorPicked = (color: ThemeName) => {
    save({
      color,
    });
    Analytics.trackEvent(`${ANALYTICS_ID}_change_widget_color`, color, {
      color,
      widgetId: widgetId,
      type: type,
      roomId,
    });
  };

  // note we don't use WidgetFrame here as it's too opinionated toward a standard
  // widget use-case, we just manually render CanvasObject (an invisible container now)
  // and then put the animated div which is our new 'frame' inside it.
  return (
    <ThemeProvider theme={widgetState.color ? getThemeFromName(widgetState.color) : snow}>
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
            title={widgetState.title}
            className={classes.titlebar}
            onTitleChanged={onTitleChanged}
            defaultTitle={t('widgets.huddle.name')}
            setActiveColor={onColorPicked}
            activeColor={widgetState.color ?? ThemeName.Snow}
          ></WidgetEditableTitlebar>
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
