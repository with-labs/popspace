import { WidgetType } from '@api/roomState/types/widgets';
import { AudioIndicator } from '@components/AudioIndicator/AudioIndicator';
import { FormikSubmitButton } from '@components/fieldBindings/FormikSubmitButton';
import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import { MuteIconSmall } from '@components/icons/MuteIconSmall';
import { SpatialVideo } from '@components/SpatialVideo/SpatialVideo';
import { makeStyles, MenuItem, Typography } from '@material-ui/core';
import { CanvasObject } from '@providers/canvas/CanvasObject';
import { CanvasObjectDragHandle } from '@providers/canvas/CanvasObjectDragHandle';
import { Form, Formik } from 'formik';
import * as React from 'react';

import { ThemeName } from '../../../../theme/theme';
import { useWidgetContext } from '../useWidgetContext';
import { WidgetContent } from '../WidgetContent';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import videos from './videos';

const useStyles = makeStyles((theme) => ({
  draggable: {
    // you hate to see it, but since this is an internal hacky tool anyway...
    zIndex: `10000 !important` as any,
  },
  root: {
    width: 280,
    height: 280,
    borderRadius: 32,
    border: `4px solid ${theme.palette.background.paper}`,
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: theme.mainShadows.surface,
    overflow: 'hidden',
  },
  handle: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  videoContainer: {
    borderRadius: 28,
    height: 248,
    width: '100%',
    overflow: 'hidden',
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
  },
  voiceIndicator: {
    right: '8%',
    bottom: -10,
    position: 'absolute',
    transform: 'translate(50%, -50%)',
  },
  bottomSection: {
    lineHeight: '1',
    height: 24,
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: theme.typography.pxToRem(13),
    fontWeight: theme.typography.fontWeightMedium as any,
    textOverflow: 'ellipsis',
    margin: '0 auto',
    maxWidth: '70%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  voiceWave: {
    width: 24,
    height: 24,
    position: 'relative',
    top: 7,
  },
  mutedIcon: {
    width: 16,
    height: 16,
    fontSize: theme.typography.pxToRem(16),
    color: theme.palette.brandColors.cherry.bold,
  },
}));

/**
 * Renders a fake user which can be repositioned by other users. The fake user
 * shows a prerecorded video rather than a stream.
 *
 * Note: this component was thrown together just for demos and other non-critical
 * stuff. As such it's not reusing PersonBubble or other components we'd normally
 * use to render a Person. If this feature is promoted to something more meaningful
 * or long-term, we should refactor this to utilize shared visual components to
 * ensure consistency.
 */
export const MockUserWidget: React.FC = () => {
  const classes = useStyles();
  const { save: onSave, widget: state, remove: onClose } = useWidgetContext<WidgetType.MockUser>();

  if (!state.widgetState.displayName || !state.widgetState.video) {
    return (
      <WidgetFrame color={ThemeName.Cherry}>
        <WidgetTitlebar title="Create mock user" />
        <WidgetContent>
          <Formik onSubmit={onSave} initialValues={state.widgetState}>
            <Form>
              <FormikTextField label="Username" name="displayName" margin="normal" required />
              <FormikTextField select label="Video" name="video" margin="normal" required>
                {videos.map((vid) => (
                  <MenuItem value={vid} key={vid}>
                    {vid.split('/').pop()}
                  </MenuItem>
                ))}
              </FormikTextField>
              <FormikSubmitButton>Create</FormikSubmitButton>
            </Form>
          </Formik>
        </WidgetContent>
      </WidgetFrame>
    );
  }

  const src = state.widgetState.video;
  const muted = src.includes('listening');

  return (
    <CanvasObject objectId={state.widgetId} objectKind="widget" className={classes.draggable}>
      <div className={classes.root}>
        <CanvasObjectDragHandle className={classes.handle}>
          <div className={classes.videoContainer}>
            {src && (
              <SpatialVideo
                objectId={state.widgetId}
                objectKind="widget"
                autoPlay
                loop
                className={classes.video}
                muted={muted}
                src={src}
              />
            )}
          </div>
          <div className={classes.bottomSection}>
            <Typography className={classes.name}>{state.widgetState.displayName}</Typography>
          </div>
          <div className={classes.voiceIndicator} onClick={onClose}>
            {muted ? (
              <MuteIconSmall className={classes.mutedIcon} />
            ) : (
              <AudioIndicator className={classes.voiceWave} isActive variant="sine" />
            )}
          </div>
        </CanvasObjectDragHandle>
      </div>
    </CanvasObject>
  );
};
