import * as React from 'react';
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

function getIconType(mediaContentType?: string): FileIconType {
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

export const FileIcon = ({
  contentType,
  iconUrl,
  ...rest
}: {
  contentType?: string;
  iconUrl?: string | null;
  className?: string;
}) => {
  if (iconUrl) {
    return <img src={iconUrl} alt="" style={{ width: 48, height: 48 }} />;
  }

  const Component = fileIcons[getIconType(contentType)];

  return <Component {...rest} />;
};
