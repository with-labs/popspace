import * as React from 'react';
import { ListItemIcon, ListItemText } from '@material-ui/core';
import { QuickAction as QuickActionData, QuickActionKind, AddAccessoryQuickAction } from './useQuickAction';
import { AccessoryIcon } from '../../../../withComponents/icons/AccessoryIcon';

export interface IQuickActionProps {
  value: QuickActionData;
}

export const QuickAction: React.FC<IQuickActionProps> = ({ value }) => {
  switch (value.kind) {
    case QuickActionKind.AddAccessory:
      return <QuickActionAddAccessory value={value} />;
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
