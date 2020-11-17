import React from 'react';
import { makeStyles, Box } from '@material-ui/core';

interface IDashboardProps {
  children?: React.ReactNode;
}

const useStyles = makeStyles((theme) => ({
  dashboardItem: {
    backgroundColor: theme.palette.brandColors.snow.regular,
    padding: theme.spacing(2),
    height: 196,
    borderRadius: theme.shape.contentBorderRadius,
    border: `1px solid ${theme.palette.brandColors.slate.light}`,
    [theme.breakpoints.up('md')]: {
      maxWidth: 340,
    },
  },
}));

export const DashboardItem: React.FC<IDashboardProps> = (props) => {
  const classes = useStyles();
  const { children } = props;

  return (
    <Box display="flex" flexDirection="column" className={classes.dashboardItem}>
      {children}
    </Box>
  );
};
