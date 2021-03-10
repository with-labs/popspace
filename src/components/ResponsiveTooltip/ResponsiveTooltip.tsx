import { Tooltip, TooltipProps } from '@material-ui/core';
import * as React from 'react';
import { useResponsivePopoverPlacement } from '../ResponsivePopover/ResponsivePopover';

function getOffset(placement: TooltipProps['placement'], offset: number) {
  if (placement?.includes('left')) {
    return `0, -${offset}px`;
  } else if (placement?.includes('right')) {
    return `0, ${offset}px`;
  } else if (placement?.includes('top')) {
    return `-${offset}px`;
  } else {
    return `${offset}px`;
  }
}

export const ResponsiveTooltip: React.FC<TooltipProps & { offset?: number }> = ({ offset = 0, ...props }) => {
  const placement = useResponsivePopoverPlacement();

  const PopperProps = React.useMemo(() => {
    return {
      modifiers: {
        offset: {
          enabled: true,
          offset: getOffset(placement, offset),
        },
      },
    };
  }, [placement, offset]);

  return <Tooltip placement={placement} PopperProps={PopperProps} {...props} />;
};
