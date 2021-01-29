import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { WidgetType } from '../../../roomState/types/widgets';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { Vector2 } from '../../../types/spatials';
import api from '../../../utils/api';
import { useAddAccessory } from '../../roomControls/addContent/quickActions/useAddAccessory';

export function useAddFile() {
  const { t } = useTranslation();

  const addWidget = useAddAccessory();
  const { enqueueSnackbar } = useSnackbar();
  const updateWidget = useRoomStore((room) => room.api.updateWidget);

  const createWidget = useCallback(
    async (file: File, position?: Vector2) => {
      // get our signed upload url to send the file directly to S3
      const { success, uploadUrl, downloadUrl } = await api.getRoomFileUploadUrl(file.name, file.type);

      if (!success) {
        enqueueSnackbar(t('error.messages.fileDropUnknownFailure'), { color: 'error' });
      } else {
        // immediately add a pending widget, but don't block on it yet
        const widgetAddedPromise = addWidget({
          type: WidgetType.Link,
          initialData: {
            url: downloadUrl,
            mediaUrl: downloadUrl,
            title: file.name,
            mediaContentType: file.type,
            uploadProgress: 0,
          },
          screenCoordinate: position,
        });

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

        // wait for widget creation to complete too
        const widget = await widgetAddedPromise;

        // add the URL data to the widget now that the file is ready
        updateWidget({
          widgetId: widget.widgetId,
          widgetState: {
            ...widget.widgetState,
            url: downloadUrl,
            uploadProgress: 100,
          },
        });
      }
    },
    [addWidget, enqueueSnackbar, t, updateWidget]
  );

  return createWidget;
}
