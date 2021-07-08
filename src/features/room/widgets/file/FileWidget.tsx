import { WidgetType } from '@api/roomState/types/widgets';
import * as React from 'react';
import { useWidgetContext } from '../useWidgetContext';
import { AudioFileWidget } from './AudioFileWidget';
import { FramedFileWidget } from './FramedFileWidget';
import { FullSizeFileWidget } from './FullSizeFileWidget';
import { StubFileWidget } from './StubFileWidget';
import { UploadingWidget } from './UploadingWidget';

export interface IFileWidgetProps {}

// these media types can't be played inline
const FULL_SIZE_BLOCK_LIST = ['video/mov'];

function isFullSizeMedia(contentType: string) {
  return (
    (contentType.startsWith('video') || contentType.startsWith('image')) && !FULL_SIZE_BLOCK_LIST.includes(contentType)
  );
}

export const FileWidget: React.FC<IFileWidgetProps> = () => {
  const { widget } = useWidgetContext<WidgetType.File>();

  if (widget.widgetState.uploadProgress < 100) {
    return <UploadingWidget />;
  }

  const contentType = widget.widgetState.contentType;

  if (isFullSizeMedia(contentType)) {
    return <FullSizeFileWidget />;
  }

  if (contentType.startsWith('audio')) {
    return <AudioFileWidget />;
  }

  if (contentType === 'application/pdf' || contentType.startsWith('text')) {
    return <FramedFileWidget />;
  }

  return <StubFileWidget />;
};
