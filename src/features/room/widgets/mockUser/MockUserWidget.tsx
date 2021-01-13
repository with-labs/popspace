import { makeStyles, MenuItem, Typography } from '@material-ui/core';
import { Form, Formik } from 'formik';
import * as React from 'react';
import { AudioIndicator } from '../../../../components/AudioIndicator/AudioIndicator';
import { FormikCheckboxField } from '../../../../components/fieldBindings/FormikCheckboxField';
import { FormikSubmitButton } from '../../../../components/fieldBindings/FormikSubmitButton';
import { FormikTextField } from '../../../../components/fieldBindings/FormikTextField';
import { MuteIconSmall } from '../../../../components/icons/MuteIconSmall';
import { MediaReadinessContext } from '../../../../components/MediaReadinessProvider/MediaReadinessProvider';
import { useSpatialAudioVolume } from '../../../../hooks/useSpatialAudioVolume/useSpatialAudioVolume';
import { MockUserWidgetShape } from '../../../../roomState/types/widgets';
import { Draggable } from '../../Draggable';
import { DraggableHandle } from '../../DraggableHandle';
import { useSaveWidget } from '../useSaveWidget';
import { WidgetContent } from '../WidgetContent';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import videos from './videos';

export interface IMockUserWidgetProps {
  state: MockUserWidgetShape;
  onClose: () => void;
}

const useStyles = makeStyles((theme) => ({
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
    fontWeight: theme.typography.fontWeightMedium,
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
export const MockUserWidget: React.FC<IMockUserWidgetProps> = ({ state, onClose }) => {
  const classes = useStyles();
  const onSave = useSaveWidget(state.widgetId);

  // sets the volume on change. needs to rely on isReady so that it will
  // be run again when isReady = true and the audio node is mounted.
  const ref = React.useRef<HTMLVideoElement>(null);
  const { isReady } = React.useContext(MediaReadinessContext);
  const volume = useSpatialAudioVolume('widget', state.widgetId);
  React.useEffect(() => {
    if (!ref.current || !isReady) return;
    // sanity check
    if (!isNaN(volume)) {
      ref.current.volume = volume;
    }
  }, [volume, isReady]);

  if (!state.widgetState.displayName || !state.widgetState.video) {
    return (
      <WidgetFrame color="cherry" widgetId={state.widgetId}>
        <WidgetTitlebar title="Create mock user" onClose={onClose} />
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
    <Draggable id={state.widgetId} kind="widget">
      <div className={classes.root}>
        <DraggableHandle className={classes.handle}>
          <div className={classes.videoContainer}>
            {src && <video autoPlay ref={ref} className={classes.video} muted={muted} src={src} />}
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
        </DraggableHandle>
      </div>
    </Draggable>
  );
};
