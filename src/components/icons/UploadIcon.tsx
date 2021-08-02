import { SvgIcon, SvgIconProps } from '@material-ui/core';
import * as React from 'react';

import { ReactComponent as Glyph } from './svg/upload.svg';

export interface IUploadIconProps extends SvgIconProps {}

export const UploadIcon: React.FC<IUploadIconProps> = (props) => (
  <SvgIcon {...props} viewBox="0 0 32 32">
    <Glyph />
  </SvgIcon>
);
