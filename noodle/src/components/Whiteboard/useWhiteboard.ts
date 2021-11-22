import * as React from 'react';
import Konva from 'konva';
import { nanoid } from '@reduxjs/toolkit';
import { COLORS, ERASER_COLOR, ERASER_WIDTH, STROKE_WIDTH } from './constants';
import { DrawingLine, WhiteboardState } from './types';
import throttle from 'lodash.throttle';
import { isMiddleClick, isRightClick } from '@utils/mouseButtons';

function getMousePosition(ev: Konva.KonvaEventObject<MouseEvent>) {
  return ev.target?.getStage()?.getPointerPosition() ?? { x: 0, y: 0 };
}

export function useWhiteboard(controlledValue?: WhiteboardState, controlledOnChange?: (val: WhiteboardState) => any) {
  // a ref to the Konva stage, which we can use to export an image.
  const stageRef = React.useRef<Konva.Stage>(null);

  const [internalState, setInternalState] = React.useState<WhiteboardState>({ lines: [] });
  const [activeLine, setActiveLine] = React.useState<DrawingLine | null>(null);
  const [activeColor, setActiveColor] = React.useState<string>(COLORS[1]);

  const finalState = controlledValue || internalState;
  const finalOnChange = controlledValue ? controlledOnChange : setInternalState;

  const handlePointerDown = React.useCallback(
    (ev: Konva.KonvaEventObject<MouseEvent>) => {
      // ignore events from right and middle mouse, but not left or touch events
      if (isMiddleClick(ev.evt) || isRightClick(ev.evt)) return;
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

  const handlePointerUp = React.useCallback(
    (ev: Konva.KonvaEventObject<MouseEvent>) => {
      if (!activeLine) return;
      // ignore events from right and middle mouse, but not left or touch events
      if (isMiddleClick(ev.evt) || isRightClick(ev.evt)) return;
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

  const handlePointerMove = React.useMemo(
    () =>
      throttle(
        (ev: Konva.KonvaEventObject<MouseEvent>) => {
          // ignore events from right and middle mouse, but not left or touch events
          if (isMiddleClick(ev.evt) || isRightClick(ev.evt)) return;
          const { x, y } = getMousePosition(ev);

          setActiveLine((cur) => {
            if (!cur) return cur;
            cur.path.push(x, y);
            return { ...cur };
          });
        },
        20,
        { leading: true, trailing: true }
      ),
    []
  );

  const handleEraserClick = React.useCallback(() => {
    if (activeColor === ERASER_COLOR) {
      finalOnChange?.({
        lines: [],
      });
      setActiveColor(COLORS[1]);
    } else {
      setActiveColor(ERASER_COLOR);
    }
  }, [finalOnChange, activeColor]);

  const whiteboardProps = {
    onMouseDown: handlePointerDown,
    onMouseUp: handlePointerUp,
    onMouseMove: handlePointerMove,
    onTouchStart: handlePointerDown,
    onTouchEnd: handlePointerUp,
    onTouchMove: handlePointerMove,
    ref: stageRef,
    value: finalState,
    onChange: finalOnChange,
    activeLine,
  };

  const toolsProps = {
    onEraserClick: handleEraserClick,
    setActiveColor,
    activeColor,
  };

  const exportToImageURL = () => {
    if (!stageRef.current) {
      throw new Error('Tried to export whiteboard to image, but Konva was not yet mounted');
    }
    return stageRef.current.toDataURL();
  };

  return {
    whiteboardProps,
    toolsProps,
    exportToImageURL,
    activeColor,
  };
}
