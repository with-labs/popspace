import client from '@api/client';
import { CaretIcon } from '@components/icons/CaretIcon';
import { VolumeIcon } from '@components/icons/VolumeIcon';
import { ResponsivePopover } from '@components/ResponsivePopover/ResponsivePopover';
import { Button, makeStyles, Slider } from '@material-ui/core';
import * as React from 'react';

import { useWidgetContext } from '../useWidgetContext';

const DEFAULT_INITIAL_VOLUME = 0.5;

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(0.5),
    paddingRight: 0,
    paddingLeft: theme.spacing(1),
    borderRadius: 24,
    '&:focus': {
      boxShadow: theme.focusRings.create(theme.palette.common.white),
    },
  },
  caret: {
    marginLeft: -4,
    marginRight: -4,
  },
  sliderContainer: {
    height: 200,
  },
}));

export function VolumeControl() {
  const classes = useStyles();
  const { widget } = useWidgetContext<any>();

  const [targetEl, setTargetEl] = React.useState<HTMLButtonElement | null>(null);

  const currentVolume = widget.widgetState.mediaState?.volume || DEFAULT_INITIAL_VOLUME;

  const setVolume = (volume: number) => {
    client.widgets.localOnlyUpdateWidget({
      widgetId: widget.widgetId,
      widgetState: {
        mediaState: {
          ...widget.widgetState.mediaState,
          volume,
        },
      },
    });
  };

  const commitVolume = (volume: number) => {
    client.widgets.updateWidget({
      widgetId: widget.widgetId,
      widgetState: {
        mediaState: {
          ...widget.widgetState.mediaState,
          volume,
        },
      },
    });
  };

  return (
    <>
      <Button
        fullWidth={false}
        variant="text"
        color="inherit"
        className={classes.root}
        onClick={(ev) => setTargetEl(ev.currentTarget)}
        startIcon={<VolumeIcon />}
      >
        <CaretIcon className={classes.caret} fontSize="small" />
      </Button>
      <ResponsivePopover
        open={!!targetEl}
        anchorEl={targetEl}
        onClose={() => setTargetEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <div className={classes.sliderContainer}>
          <Slider
            value={currentVolume}
            orientation="vertical"
            max={1}
            step={0.1}
            onChange={(_ev: any, value: number | number[]) => {
              setVolume(value as number);
            }}
            onChangeCommitted={(_ev: any, volume: number | number[]) => commitVolume(volume as number)}
          />
        </div>
      </ResponsivePopover>
    </>
  );
}
