import { Button, Card, ThemeProvider, Typography } from '@material-ui/core';
import { Spacing } from '@components/Spacing/Spacing';
import * as React from 'react';
import { snow } from '@src/theme/theme';
import { SaveIcon } from '@components/icons/SaveIcon';
import { useTranslation } from 'react-i18next';

export interface IExtensionCardProps {
  iconSrc: string;
  iconAlt: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export const ExtensionCard: React.FC<IExtensionCardProps> = ({
  iconSrc,
  iconAlt,
  label,
  disabled = false,
  onClick,
}) => {
  const { t } = useTranslation();
  return (
    <Spacing component={Card} p={2} flexDirection="column" alignItems="center">
      <img width={48} height={48} src={iconSrc} alt={iconAlt} />
      <Typography variant="body2">{label}</Typography>
      <ThemeProvider theme={snow}>
        <Button color="default" disabled={disabled} onClick={onClick} startIcon={!disabled ? <SaveIcon /> : null}>
          {t(`pages.meetingLink.extensions.${!disabled ? 'install' : 'comingSoon'}`)}
        </Button>
      </ThemeProvider>
    </Spacing>
  );
};
