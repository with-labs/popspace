import { WidgetType } from '@api/roomState/types/widgets';
import * as React from 'react';
import { useWidgetContext } from '../useWidgetContext';
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

function isFramedMedia(contentType: string) {
  return contentType.startsWith('audio') || contentType === 'application/pdf';
}

export const FileWidget: React.FC<IFileWidgetProps> = ({}) => {
  const { widget } = useWidgetContext<WidgetType.File>();

  if (widget.widgetState.uploadProgress < 100) {
    return <UploadingWidget />;
  }

  if (isFullSizeMedia(widget.widgetState.contentType)) {
    return <FullSizeFileWidget />;
  }

  if (isFramedMedia(widget.widgetState.contentType)) {
    return <FramedFileWidget />;
  }

  return <StubFileWidget />;
};
