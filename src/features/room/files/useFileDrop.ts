import { Vector2 } from '../../../types/spatials';
import { useCallback, DragEvent, useState, useRef, useMemo } from 'react';
import { useAddAccessory } from '../../roomControls/addContent/quickActions/useAddAccessory';
import api from '../../../utils/api';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { debounce } from '@material-ui/core';
import { WidgetType } from '../../../roomState/types/widgets';
import { logger } from '../../../utils/logger';

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
  const { t } = useTranslation();

  const [targetPosition, setTargetPosition] = useState<Vector2 | null>(null);
  const isFileDropRef = useRef<boolean | null>(false);
  // https://stackoverflow.com/questions/3144881/how-do-i-detect-a-html5-drag-event-entering-and-leaving-the-window-like-gmail-d
  const isDraggingRef = useRef<boolean | null>(false);

  const { enqueueSnackbar } = useSnackbar();

  const addWidget = useAddAccessory();

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
        // get our signed upload url to send the file directly to S3
        const { success, uploadUrl, downloadUrl } = await api.getRoomFileUploadUrl(file.name, file.type);

        try {
          if (!success) {
            enqueueSnackbar(t('error.messages.fileDropUnknownFailure'), { color: 'error' });
          } else {
            // read file as arraybuffer
            const fileBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
              const reader = new FileReader();
              reader.addEventListener('loadend', () => {
                resolve(reader.result as ArrayBuffer);
              });
              reader.addEventListener('error', () => {
                reject(reader.error);
              });
              reader.readAsArrayBuffer(file);
            });
            // upload the file to S3
            await fetch(uploadUrl, {
              method: 'PUT',
              body: new Blob([fileBuffer], { type: file.type }),
            });

            addWidget({
              type: WidgetType.Link,
              initialData: {
                url: downloadUrl,
                title: file.name,
                mediaContentType: file.type,
                mediaUrl: downloadUrl,
              },
              screenCoordinate: mousePosition,
            });
          }
        } catch (err) {
          logger.error(err);
        } finally {
          setTargetPosition(null);
          isFileDropRef.current = false;
        }
      };

      files.map(createWidget);
    },
    [addWidget, enqueueSnackbar, t]
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
