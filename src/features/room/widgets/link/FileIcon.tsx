import * as React from 'react';
import { LinkWidgetState } from '../../../../roomState/types/widgets';
import { fileIcons } from './fileIcons';

type FileIconType = keyof typeof fileIcons;

const fileIconContentTypes: Record<Exclude<FileIconType, 'fallback'>, Array<string | RegExp>> = {
  spreadsheet: [
    'text/csv',
    'application/x-iwork-numbers-sffnumbers',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  presentation: [
    'application/x-iwork-keynote-sffkey',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  document: [
    'text/plain',
    'text/rtf',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/x-iwork-pages-sffpages',
  ],
  archive: [
    'application/zip',
    'application/x-tar',
    'application/x-diskcopy',
    'application/vnd.android.package-archive',
  ],
  audio: [/^audio\//, 'video/ogg'],
  source: [
    'text/html',
    'text/javascript',
    'application/x-javascript',
    'application/json',
    'text/xml',
    'text/css',
    'application/x-sh',
    'text/x-sh',
    'text/x-perl-script',
    'text/x-python-script',
    'text/x-ruby-script',
    'text/php',
  ],
};

function getIconType({ mediaContentType }: LinkWidgetState): FileIconType {
  if (!mediaContentType) {
    return 'fallback';
  }
  for (const [fileType, matchers] of Object.entries(fileIconContentTypes)) {
    if (
      matchers.some((match) => (match instanceof RegExp ? match.test(mediaContentType) : mediaContentType === match))
    ) {
      return fileType as keyof typeof fileIconContentTypes;
    }
  }
  return 'fallback';
}

export const FileIcon = ({ state, ...rest }: { state: LinkWidgetState; className?: string }) => {
  if (state.iconUrl) {
    return <img src={state.iconUrl} alt="" style={{ width: 48, height: 48 }} />;
  }

  const Component = fileIcons[getIconType(state)];

  return <Component {...rest} />;
};
