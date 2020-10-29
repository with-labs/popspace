import * as React from 'react';
import { ListItemIcon, ListItemText } from '@material-ui/core';
import { QuickAction as QuickActionData, QuickActionKind, AddAccessoryQuickAction } from './quickActions/types';
import { AccessoryIcon } from '../../../components/icons/AccessoryIcon';
import { EditIcon } from '../../../components/icons/EditIcon';

export interface IQuickActionProps {
  value: QuickActionData;
}

export const QuickAction: React.FC<IQuickActionProps> = ({ value }) => {
  switch (value.kind) {
    case QuickActionKind.AddAccessory:
      return <QuickActionAddAccessory value={value} />;
    case QuickActionKind.SetStatus:
      return (
        <>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>{value.displayName}</ListItemText>
        </>
      );
    default:
      return null;
  }
};

const QuickActionAddAccessory: React.FC<{ value: AddAccessoryQuickAction }> = ({ value }) => {
  return (
    <>
      <ListItemIcon>
        <AccessoryIcon type={value.accessoryType} />
      </ListItemIcon>
      <ListItemText>{value.displayName}</ListItemText>
    </>
  );
};
