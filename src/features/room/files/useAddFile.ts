import { toast } from 'react-hot-toast';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { WidgetType } from '../../../roomState/types/widgets';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { Vector2 } from '../../../types/spatials';
import api from '../../../utils/api';
import { useAddAccessory } from '../../roomControls/addContent/quickActions/useAddAccessory';

const MAX_MEGABYTES = 30;
const ONE_MEGABYTE_IN_BYTES = 1024 * 1024;
const MAX_FILE_BYTE_LENGTH = MAX_MEGABYTES * ONE_MEGABYTE_IN_BYTES;

export function useAddFile() {
  const { t } = useTranslation();

  const addWidget = useAddAccessory();
  const updateWidget = useRoomStore((room) => room.api.updateWidget);
  const deleteWidget = useRoomStore((room) => room.api.deleteWidget);

  const createWidget = useCallback(
    async (file: File, position?: Vector2) => {
      // prevent closing the tab while uploading unless the user confirms.
      function confirmClose(e: Event) {
        e.preventDefault();
        e.returnValue = true;
        return t('widgets.link.confirmCloseTabDuringUpload');
      }
      window.addEventListener('beforeunload', confirmClose, true);

      // get our signed upload url to send the file directly to S3
      const { success, uploadUrl, downloadUrl } = await api.getRoomFileUploadUrl(file.name, file.type);

      if (!success) {
        toast.error(t('error.messages.fileDropUnknownFailure') as string);
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
            isFileUpload: true,
          },
          screenCoordinate: position,
        });

        const abort = async () => {
          window.removeEventListener('beforeunload', confirmClose, true);
          const widget = await widgetAddedPromise;
          await deleteWidget(widget);
        };

        // read file as arraybuffer
        const fileBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.addEventListener('loadend', async () => {
            const loadedFile: ArrayBuffer = reader.result as ArrayBuffer;
            if (loadedFile.byteLength > MAX_FILE_BYTE_LENGTH) {
              toast.error(t('error.messages.fileTooLarge', { maxMegabytes: MAX_MEGABYTES }) as string);
              await abort();
              return reject(`File exceeds ${MAX_FILE_BYTE_LENGTH} bytes`);
            }
            resolve(loadedFile);
          });
          reader.addEventListener('error', async () => {
            await abort();
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

        window.removeEventListener('beforeunload', confirmClose, true);
      }
    },
    [addWidget, t, updateWidget, deleteWidget]
  );

  return createWidget;
}
