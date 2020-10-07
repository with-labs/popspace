import * as React from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import Konva from 'konva';
import { makeStyles, Box, Tooltip } from '@material-ui/core';
import { ColorButton } from './ColorButton';
import { nanoid } from '@reduxjs/toolkit';
import palette from '../../theme/palette';
import { COLORS, ERASER_COLOR, ERASER_WIDTH, STROKE_WIDTH } from './constants';

export interface IWhiteboardProps {
  value?: WhiteboardState;
  onChange?: (val: WhiteboardState) => any;
  width?: number;
  height?: number;
}

export type DrawingLine = {
  path: number[];
  color: string;
  isEraser: boolean;
  strokeWidth: number;
  id: string;
};

export type WhiteboardState = {
  lines: DrawingLine[];
};

function getMousePosition(ev: Konva.KonvaEventObject<MouseEvent>) {
  return ev.target?.getStage()?.getPointerPosition() ?? { x: 0, y: 0 };
}

const useStyles = makeStyles((theme) => ({
  root: {},
  controls: {
    borderTop: `1px solid ${theme.palette.grey[50]}`,
    backgroundColor: theme.palette.background.paper,
    paddingTop: theme.spacing(0.5),
  },
  eraserButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginRight: 8,
  },
}));

/**
 * Our custom Whiteboard implementation. This is a controllable component -
 * so if you pass value/onChange it will use your external state, but if you don't
 * it will store its own state (useful for testing)
 */
export const Whiteboard = React.forwardRef<{ exportToImageURL: () => string }, IWhiteboardProps>(
  ({ value: controlledValue, onChange: controlledOnChange, width = 720, height = 480 }, ref) => {
    const classes = useStyles();

    // a ref to the Konva stage, which we can use to export an image.
    const stageRef = React.useRef<Konva.Stage>(null);
    // this allows a parent which has a ref to this component to call
    // the exportToImageURL function imperatively to export the contents.
    React.useImperativeHandle(ref, () => ({
      exportToImageURL: () => {
        if (!stageRef.current) {
          throw new Error('Tried to export whiteboard to image, but Konva was not yet mounted');
        }
        return stageRef.current.toDataURL();
      },
    }));

    const [internalState, setInternalState] = React.useState<WhiteboardState>({ lines: [] });
    const [activeLine, setActiveLine] = React.useState<DrawingLine | null>(null);
    const [activeColor, setActiveColor] = React.useState<string>(COLORS[1]);
    const lastEraserClickTimeRef = React.useRef<number | null>(null);

    const finalState = controlledValue || internalState;
    const finalOnChange = controlledValue ? controlledOnChange : setInternalState;

    const handleMouseDown = React.useCallback(
      (ev: Konva.KonvaEventObject<MouseEvent>) => {
        setActiveLine((current) => {
          // we are already drawing something, ignore this
          if (current) return current;

          const { x, y } = getMousePosition(ev);

          const isEraser = activeColor === ERASER_COLOR;

          return {
            id: nanoid(),
            color: activeColor,
            isEraser,
            strokeWidth: isEraser ? ERASER_WIDTH : STROKE_WIDTH,
            path: [x, y],
          };
        });
      },
      [activeColor]
    );

    const handleMouseUp = React.useCallback(
      (ev: Konva.KonvaEventObject<MouseEvent>) => {
        if (!activeLine) return;
        const { x, y } = getMousePosition(ev);

        // add that last bit
        activeLine.path.push(x, y);

        setActiveLine(null);
        finalOnChange?.({
          ...finalState,
          lines: [...finalState.lines, activeLine],
        });
      },
      [activeLine, finalOnChange, finalState]
    );

    const handleMouseMove = React.useCallback((ev: Konva.KonvaEventObject<MouseEvent>) => {
      const { x, y } = getMousePosition(ev);

      setActiveLine(
        (cur) =>
          cur && {
            ...cur,
            path: [...cur.path, x, y],
          }
      );
    }, []);

    const handleEraserClick = React.useCallback(() => {
      if (lastEraserClickTimeRef.current && Date.now() - lastEraserClickTimeRef.current < 500) {
        finalOnChange?.({
          lines: [],
        });
        setActiveColor(COLORS[1]);
      } else {
        setActiveColor(ERASER_COLOR);
      }
      lastEraserClickTimeRef.current = Date.now();
    }, [finalOnChange]);

    const visibleLines = [...finalState.lines, activeLine].filter(Boolean) as DrawingLine[];

    return (
      <div className={classes.root}>
        <Stage
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          width={width}
          height={height}
          ref={stageRef}
        >
          <Layer>
            <Rect width={width} height={height} fill={palette.snow.main} />
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
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          className={classes.controls}
        >
          <Tooltip title="Double tap to clear">
            <div>
              {/* div wrapper needed for tooltip to work right */}
              <ColorButton onClick={handleEraserClick} color={ERASER_COLOR} active={activeColor === ERASER_COLOR} />
            </div>
          </Tooltip>
          {COLORS.slice(1).map((color) => (
            <ColorButton
              key={color}
              color={color}
              onClick={() => setActiveColor(color)}
              active={activeColor === color}
            />
          ))}
        </Box>
      </div>
    );
  }
);
