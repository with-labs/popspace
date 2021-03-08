import * as React from 'react';
import { Stage, Layer, Line, Rect, StageProps, useStrictMode } from 'react-konva';
import { WhiteboardState, DrawingLine } from './types';
import Konva from 'konva';
import { makeStyles, useTheme } from '@material-ui/core';
import clsx from 'clsx';

// eslint-disable-next-line react-hooks/rules-of-hooks
useStrictMode(true);

export interface IWhiteboardProps extends StageProps {
  value: WhiteboardState;
  activeLine?: DrawingLine | null;
  onChange: (val: WhiteboardState) => any;
  width?: number;
  height?: number;
  className?: string;
}

const useStyles = makeStyles({
  root: {
    cursor: 'crosshair',
  },
});

/**
 * Our custom Whiteboard implementation. This is a controllable component -
 * so if you pass value/onChange it will use your external state, but if you don't
 * it will store its own state (useful for testing)
 */
export const Whiteboard = React.forwardRef<Konva.Stage, IWhiteboardProps>(
  ({ value, onChange, stageRef, activeLine, width = 720, height = 480, className, ...rest }, ref) => {
    const classes = useStyles();
    const theme = useTheme();

    return (
      <Stage width={width} height={height} ref={ref} className={clsx(classes.root, className)} {...rest}>
        <Layer>
          <Rect width={width} height={height} fill={theme.palette.background.paper} />
        </Layer>
        <Layer>
          {value.lines.map(({ path, color, isEraser, strokeWidth, id }) => (
            <Line
              points={path}
              fill={color}
              stroke={color}
              key={id}
              strokeWidth={strokeWidth}
              globalCompositeOperation={isEraser ? 'destination-out' : 'source-over'}
            />
          ))}
          {activeLine && (
            <Line
              points={activeLine.path}
              fill={activeLine.color}
              stroke={activeLine.color}
              strokeWidth={activeLine.strokeWidth}
              globalCompositeOperation={activeLine.isEraser ? 'destination-out' : 'source-over'}
              _useStrictMode
            />
          )}
        </Layer>
      </Stage>
    );
  }
);
