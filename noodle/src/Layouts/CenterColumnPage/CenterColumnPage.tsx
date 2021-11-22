import * as React from 'react';
import { makeStyles, Container } from '@material-ui/core';
import { Header } from '@components/Header/Header';
import { PageTitle } from '@components/PageTitle/PageTitle';

export interface ICenterColumnPageProps {
  pageTitle?: string;
  children: React.ReactNode;
}

const useStyles = makeStyles((theme) => ({
  mainRoot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing(7.5),
  },
}));

export const CenterColumnPage: React.FC<ICenterColumnPageProps> = ({ pageTitle, children }) => {
  const classes = useStyles();

  return (
    <>
      <PageTitle title={pageTitle} />
      <Container maxWidth="md">
        <Header />
        <main className={classes.mainRoot}>{children}</main>
      </Container>
    </>
  );
};
