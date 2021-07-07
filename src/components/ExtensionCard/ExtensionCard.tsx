import { Button, Card, ThemeProvider, Typography, makeStyles } from '@material-ui/core';
import { Spacing } from '@components/Spacing/Spacing';
import * as React from 'react';
import { snow } from '@src/theme/theme';

export interface IExtensionCardProps {
  iconSrc: string;
  iconAlt: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
  buttonStartIcon?: React.ReactNode;
  buttonText?: string;
}

const useStyles = makeStyles((theme) => ({
  disabledButton: {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

export const ExtensionCard: React.FC<IExtensionCardProps> = ({
  iconSrc,
  iconAlt,
  label,
  disabled = false,
  onClick,
  buttonStartIcon,
  buttonText,
}) => {
  const classes = useStyles();

  return (
    <Spacing component={Card} p={2} flexDirection="column" alignItems="center">
      <img width={48} height={48} src={iconSrc} alt={iconAlt} />
      <Typography variant="body2">{label}</Typography>
      <ThemeProvider theme={snow}>
        <Button
          color="default"
          disabled={disabled}
          onClick={onClick}
          startIcon={buttonStartIcon}
          className={disabled ? classes.disabledButton : ''}
        >
          {buttonText}
        </Button>
      </ThemeProvider>
    </Spacing>
  );
};
