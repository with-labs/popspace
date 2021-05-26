import React from 'react';
import { TwoColLayout } from '@layouts/TwoColLayout/TwoColLayout';
import { Column } from '@layouts/TwoColLayout/Column/Column';
import { Button, makeStyles, Typography, Box, CircularProgress } from '@material-ui/core';
import { Trans } from 'react-i18next';
import { PageTitle } from '@components/PageTitle/PageTitle';

interface IGenericErrorPageProps {
  buttonText: string;
  onClick: () => void;
  quoteText: string;
  title: string;
  body: string;
  errorMessage?: string;
  imgSrc?: string;
  imgAltText?: string;
  subMessage?: string | React.ReactElement;
  isLoading?: boolean;
  pageTitle?: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: theme.palette.brandColors.sand.regular,
  },
  bodyText: {
    marginTop: theme.spacing(2),
  },
  errorText: {
    marginTop: theme.spacing(2),
    color: theme.palette.error.dark,
  },
  button: {
    marginTop: theme.spacing(4),
    minsWidth: 190,
  },
  container: {
    maxWidth: 440,
  },
  imgContainer: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
  image: {
    width: '100%',
    maxWidth: 600,
    display: 'block',
  },
  subMessage: {
    display: 'block',
    marginTop: theme.spacing(5),
  },
}));

export const GenericErrorPage: React.FC<IGenericErrorPageProps> = (props) => {
  const classes = useStyles();
  const {
    buttonText,
    onClick,
    quoteText,
    title,
    body,
    errorMessage,
    imgSrc,
    imgAltText,
    subMessage,
    isLoading,
    pageTitle,
    ...rest
  } = props;

  return (
    <main className={classes.root} {...rest}>
      <PageTitle title={pageTitle} />
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
          <CircularProgress />
        </Box>
      ) : (
        <TwoColLayout>
          <Column centerContent={true} useColMargin={true}>
            <div className={classes.container}>
              <div>{quoteText}</div>
              <Typography variant="h1">
                <Trans>{title}</Trans>
              </Typography>
              <Typography variant="body1" className={classes.bodyText}>
                {body}
              </Typography>
              <Typography variant="body1" className={classes.errorText}>
                {errorMessage}
              </Typography>
              <Button className={classes.button} onClick={onClick} fullWidth={false}>
                {buttonText}
              </Button>
              <Typography component={'span'} variant="body1" className={classes.subMessage}>
                {subMessage}
              </Typography>
            </div>
          </Column>
          {imgSrc && imgAltText ? (
            <Column centerContent={true} hide="sm">
              <div className={classes.imgContainer}>
                <img className={classes.image} src={imgSrc} alt={imgAltText} />
              </div>
            </Column>
          ) : null}
        </TwoColLayout>
      )}
    </main>
  );
};
