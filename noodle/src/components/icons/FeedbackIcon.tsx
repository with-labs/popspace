import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import Glyph from './svg/feedback.svg?react';

export interface IFeedbackIconProps extends SvgIconProps {}

export const FeedbackIcon: React.FC<IFeedbackIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
