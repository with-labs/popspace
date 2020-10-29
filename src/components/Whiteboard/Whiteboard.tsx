import * as React from 'react';
import { Stage, Layer, Line, Rect, StageProps } from 'react-konva';
import { WhiteboardState, DrawingLine } from './types';
import Konva from 'konva';
import { useTheme } from '@material-ui/core';

export interface IWhiteboardProps extends StageProps {
  value: WhiteboardState;
  activeLine?: DrawingLine | null;
  onChange: (val: WhiteboardState) => any;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Our custom Whiteboard implementation. This is a controllable component -
 * so if you pass value/onChange it will use your external state, but if you don't
 * it will store its own state (useful for testing)
 */
export const Whiteboard = React.forwardRef<Konva.Stage, IWhiteboardProps>(
  ({ value, onChange, stageRef, activeLine, width = 720, height = 480, ...rest }, ref) => {
    const theme = useTheme();
    const visibleLines = [...value.lines, activeLine].filter(Boolean) as DrawingLine[];

    return (
      <Stage width={width} height={height} ref={ref} {...rest}>
        <Layer>
          <Rect width={width} height={height} fill={theme.palette.background.paper} />
        </Layer>
        <Layer>
          {visibleLines.map(({ path, color, isEraser, strokeWidth, id }) => (
            <Line
              points={path}
              fill={color}
              stroke={color}
              key={id}
              strokeWidth={strokeWidth}
              globalCompositeOperation={isEraser ? 'destination-out' : 'source-over'}
            />
          ))}
        </Layer>
      </Stage>
    );
  }
);
