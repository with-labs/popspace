import * as React from 'react';
import { useMediaQuery, Theme } from '@material-ui/core';
import { Omnidrawer } from './mobile/Omnidrawer';
import { Omnibar } from './desktop/Omnibar';

export interface IOmnibarProps {}

export const RoomAddContent: React.FC<IOmnibarProps> = (props) => {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

  if (isSmall) {
    return <Omnidrawer />;
  }

  return <Omnibar />;
};
