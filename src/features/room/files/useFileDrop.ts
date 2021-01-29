import { Vector2 } from '../../../types/spatials';
import { useCallback, DragEvent, useState, useRef, useMemo } from 'react';
import { debounce } from '@material-ui/core';
import { logger } from '../../../utils/logger';
import { useAddFile } from './useAddFile';

function getFileDropItems(ev: DragEvent) {
  const items: File[] = [];
  if (ev.dataTransfer.items) {
    for (const item of ev.dataTransfer.items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          items.push(file);
        }
      }
    }
  } else {
    // alternate usage - .files
    for (const file of ev.dataTransfer.files) {
      items.push(file);
    }
  }
  return items;
}

/**
 * Returns a set of props to pass to the element you want to process
 * file drops, and state for if there is a drag over the container
 * right now, plus the position of the cursor
 */
export function useFileDrop() {
  const [targetPosition, setTargetPosition] = useState<Vector2 | null>(null);
  const isFileDropRef = useRef<boolean | null>(false);
  // https://stackoverflow.com/questions/3144881/how-do-i-detect-a-html5-drag-event-entering-and-leaving-the-window-like-gmail-d
  const isDraggingRef = useRef<boolean | null>(false);

  const addFile = useAddFile();

  const onDrop = useCallback(
    (ev: DragEvent) => {
      const files = getFileDropItems(ev);
      if (!files) return;

      ev.preventDefault();
      const mousePosition = {
        x: ev.clientX,
        y: ev.clientY,
      };

      const createWidget = async (file: File) => {
        try {
          await addFile(file, mousePosition);
          setTargetPosition(null);
        } catch (err) {
          logger.error(err);
        } finally {
          isFileDropRef.current = false;
        }
      };

      files.map(createWidget);
    },
    [addFile]
  );

  const onDragEnter = useCallback((ev: DragEvent) => {
    isFileDropRef.current = ev.dataTransfer.types.includes('Files');
    isDraggingRef.current = true;
  }, []);

  const onDragOver = useCallback((ev: DragEvent) => {
    if (isFileDropRef.current) {
      ev.preventDefault();
      isDraggingRef.current = true;
      setTargetPosition({
        x: ev.clientX,
        y: ev.clientY,
      });
    }
  }, []);

  const debouncedResetState = useMemo(
    () =>
      debounce(() => {
        if (!isDraggingRef.current) {
          setTargetPosition(null);
          isFileDropRef.current = false;
        }
      }, 200),
    []
  );
  // https://stackoverflow.com/questions/3144881/how-do-i-detect-a-html5-drag-event-entering-and-leaving-the-window-like-gmail-d
  const onDragLeave = useCallback(
    (ev: DragEvent) => {
      isDraggingRef.current = false;
      debouncedResetState();
    },
    [debouncedResetState]
  );

  return [
    {
      onDrop,
      onDragEnter,
      onDragOver,
      onDragLeave,
    },
    {
      targetPosition,
    },
  ] as const;
}
