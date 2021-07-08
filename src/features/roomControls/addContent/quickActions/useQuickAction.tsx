import * as React from 'react';
import { useAddAccessory } from './useAddAccessory';
import { QuickAction, QuickActionKind } from '../../../quickActions/types';
import { useAddFile } from '../../../room/files/useAddFile';
import { browseForFile } from '@utils/browseForFile';
import { Origin } from '@analytics/constants';

/**
 * Processes a QuickAction object, applying the action
 */
export function useQuickAction() {
  const addAccessory = useAddAccessory();
  const addFile = useAddFile(Origin.OMNIBAR);
  const uploadFile = React.useCallback(async () => {
    const files = await browseForFile(true);
    files?.forEach((file) => addFile(file));
  }, [addFile]);

  return React.useCallback(
    (value: QuickAction | null) => {
      if (!value) return;

      // handle the action
      // TODO: split this into a dedicated function
      // to reduce complexity of this handler
      switch (value.kind) {
        case QuickActionKind.AddAccessory:
          addAccessory(
            {
              type: value.accessoryType,
              initialData: value.accessoryData,
              size: value.size,
            },
            Origin.OMNIBAR
          );
          break;
        case QuickActionKind.AddFile:
          uploadFile();
          break;
      }
    },
    [addAccessory, uploadFile]
  );
}
