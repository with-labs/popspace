import * as React from 'react';
import { ListItemIcon, ListItemText } from '@material-ui/core';
import { QuickAction as QuickActionData } from '../../../quickActions/types';
import { AccessoryIcon } from '@components/icons/AccessoryIcon';

export interface IQuickActionProps {
  value: QuickActionData;
}

export const QuickAction: React.FC<IQuickActionProps> = ({ value }) => {
  return (
    <>
      <ListItemIcon>
        <AccessoryIcon type={value.icon} style={{ fontSize: 32, width: 32, height: 32 }} />
      </ListItemIcon>
      <ListItemText>{value.displayName}</ListItemText>
    </>
  );
};
