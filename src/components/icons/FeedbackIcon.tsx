import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as Glyph } from './svg/feedback.svg';

export interface IFeedbackIconProps extends SvgIconProps {}

export const FeedbackIcon: React.FC<IFeedbackIconProps> = (props) => (
  <SvgIcon {...props}>
    <Glyph />
  </SvgIcon>
);
