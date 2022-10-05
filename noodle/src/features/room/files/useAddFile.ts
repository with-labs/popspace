import { toast } from 'react-hot-toast';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { WidgetType } from '@api/roomState/types/widgets';
import { Vector2 } from '../../../types/spatials';
import api from '@api/client';
import { useAddAccessory } from '../../roomControls/addContent/quickActions/useAddAccessory';
import { SIZE_STUB } from '../widgets/link/constants';
import { Origin } from '@analytics/constants';

const MAX_MEGABYTES = 30;
const ONE_MEGABYTE_IN_BYTES = 1024 * 1024;
const MAX_FILE_BYTE_LENGTH = MAX_MEGABYTES * ONE_MEGABYTE_IN_BYTES;

export function useAddFile(origin?: Origin) {
  const { t } = useTranslation();

  const addWidget = useAddAccessory();

  const createWidget = useCallback(
    async (file: File, position?: Vector2) => {
      // prevent closing the tab while uploading unless the user confirms.
      function confirmClose(e: Event) {
        e.preventDefault();
        e.returnValue = true;
        return t('widgets.link.confirmCloseTabDuringUpload');
      }
      window.addEventListener('beforeunload', confirmClose, true);

      // immediately add a pending widget, but don't block on it yet
      const widgetAddedPromise = addWidget(
        {
          type: WidgetType.File,
          initialData: {
            url: '',
            fileId: '',
            fileName: file.name,
            contentType: file.type,
            uploadProgress: 0,
          },
          screenCoordinate: position,
          size: SIZE_STUB,
        },
        origin
      );

      const abort = async () => {
        window.removeEventListener('beforeunload', confirmClose, true);
        const widget = await widgetAddedPromise;
        await api.widgets.deleteWidget(widget);
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

      const { success, file: uploadedFile } = await api.files.uploadFile(file);

      if (!success) {
        toast.error(t('error.messages.fileDropUnknownFailure') as string);
      } else {
        // wait for widget creation to complete too
        const widget = await widgetAddedPromise;

        // add the URL data to the widget now that the file is ready
        api.widgets.updateWidget({
          widgetId: widget.widgetId,
          widgetState: {
            ...widget.widgetState,
            url: uploadedFile.url,
            fileId: uploadedFile.id,
            uploadProgress: 100,
          },
        });
      }
      window.removeEventListener('beforeunload', confirmClose, true);
    },
    [addWidget, t, origin]
  );

  return createWidget;
}
