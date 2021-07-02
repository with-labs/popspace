import { Button, Card, Typography } from '@material-ui/core';
import { Spacing } from '@components/Spacing/Spacing';
import * as React from 'react';

export interface IExtensionCardProps {
  iconSrc: string;
  iconAlt: string;
  label: string;
  href?: string;
  onClick: () => void;
}

export const ExtensionCard: React.FC<IExtensionCardProps> = ({ iconSrc, iconAlt, label, href, onClick }) => {
  return (
    <Spacing component={Card} p={2} flexDirection="column" alignItems="center">
      <img width={48} height={48} src={iconSrc} alt={iconAlt} />
      <Typography variant="body2">{label}</Typography>
      <Button color="default" disabled={!href} onClick={onClick}>
        {href ? 'Install' : 'Coming Soon'}
      </Button>
    </Spacing>
  );
};
