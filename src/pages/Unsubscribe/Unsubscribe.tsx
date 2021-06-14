import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as typeformEmbed from '@typeform/embed';
import { useHistory } from 'react-router-dom';
import { TwoColLayout } from '@layouts/TwoColLayout/TwoColLayout';
import { Column } from '@layouts/TwoColLayout/Column/Column';
import { Button, makeStyles, Typography } from '@material-ui/core';
import client from '@api/client';
import useQueryParams from '@hooks/useQueryParams/useQueryParams';
import { ErrorCodes } from '@constants/ErrorCodes';
import { Page } from '@layouts/Page/Page';

import { RouteNames } from '@constants/RouteNames';
import SadBlobby from './images/sadblobby.png';
import { logger } from '@utils/logger';
import { ApiError } from '@src/errors/ApiError';

interface IUnsubscribeProps {}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.brandColors.sand.regular,
  },
  container: {
    maxWidth: '440px',
  },
  body: {
    marginTop: theme.spacing(2),
    color: theme.palette.text.primary,
  },
  imageContainer: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
  image: {
    display: 'block',
    width: '100%',
    maxWidth: '600px',
  },
  button: {
    marginTop: theme.spacing(4),
    width: '148px',
  },
}));

export const Unsubscribe: React.FC<IUnsubscribeProps> = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // get the query params from the url
  const query = useQueryParams();

  const otp = query.get('otp') || '';
  const mlid = query.get('mlid') || '';

  useEffect(() => {
    client
      .magicLinkUnsubscribe(otp, mlid)
      .catch((e: any) => {
        setIsLoading(false);
        logger.error(`Error unsubcribing email for ${mlid}`, e);
        setError(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [history, otp, mlid, t]);

  const onClickHandler = () => {
    // create typeform pop up that will auto close the popup 3 seconds after the user
    // submits their response and then redirect to root
    const typeFormPopUp = typeformEmbed.makePopup('https://form.typeform.com/to/QPqxaB2n', {
      mode: 'popup',
      autoClose: 3,
      onClose: () => {
        history.push(RouteNames.ROOT);
      },
    });

    typeFormPopUp.open();
  };

  return (
    <Page isLoading={isLoading} error={error} className={classes.root}>
      <TwoColLayout>
        <Column centerContent={true} useColMargin={true}>
          <div className={classes.container}>
            <div>{t('pages.unsubscribe.quoteText')}</div>
            <Typography variant="h1">{t('pages.unsubscribe.title')}</Typography>
            <Typography variant="body1" className={classes.body}>
              {t('pages.unsubscribe.body')}
            </Typography>
            <Button className={classes.button} onClick={onClickHandler}>
              {t('pages.unsubscribe.button')}
            </Button>
          </div>
        </Column>
        <Column centerContent={true} hide="sm">
          <div className={classes.imageContainer}>
            <img className={classes.image} src={SadBlobby} alt={t('pages.unsubscribe.imgAltText')} />
          </div>
        </Column>
      </TwoColLayout>
    </Page>
  );
};
