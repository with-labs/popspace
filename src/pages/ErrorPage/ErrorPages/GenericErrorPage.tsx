import React from 'react';
import { TwoColLayout } from '../../../Layouts/TwoColLayout/TwoColLayout';
import { Column } from '../../../Layouts/TwoColLayout/Column/Column';
import { Button, makeStyles, Typography } from '@material-ui/core';

interface IGenericErrorPageProps {
  buttonText: string;
  onClick: () => void;
  quoteText: string;
  title: string;
  body: string;
  errorMessage?: string;
  imgSrc?: string;
  imgAltText?: string;
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
}));

export const GenericErrorPage: React.FC<IGenericErrorPageProps> = (props) => {
  const classes = useStyles();
  const { buttonText, onClick, quoteText, title, body, errorMessage, imgSrc, imgAltText } = props;

  return (
    <main className={classes.root}>
      <TwoColLayout>
        <Column centerContent={true} useColMargin={true}>
          <div className={classes.container}>
            <div>{quoteText}</div>
            <Typography variant="h1">{title}</Typography>
            <Typography variant="body1" className={classes.bodyText}>
              {body}
            </Typography>
            <Typography variant="body1" className={classes.errorText}>
              {errorMessage}
            </Typography>
            <Button className={classes.button} onClick={onClick}>
              {buttonText}
            </Button>
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
    </main>
  );
};
