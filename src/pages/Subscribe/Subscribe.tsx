import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { TwoColLayout } from '@layouts/TwoColLayout/TwoColLayout';
import { Column } from '@layouts/TwoColLayout/Column/Column';
import { Button, makeStyles, Typography } from '@material-ui/core';
import client from '@api/client';
import useQueryParams from '@hooks/useQueryParams/useQueryParams';
import { Page } from '@layouts/Page/Page';
import Subscribed from './images/subscribed.png';
import { RouteNames } from '@constants/RouteNames';
import { logger } from '@utils/logger';
import { ApiError } from '@src/errors/ApiError';

interface ISubscribeProps {}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.brandColors.sand.regular,
  },
  container: {
    maxWidth: '300px',
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
    width: '190px',
  },
}));

export const Subscribe: React.FC<ISubscribeProps> = (props) => {
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
      .magicLinkSubscribe(otp, mlid)
      .catch((e: any) => {
        logger.error(`Error subcribing to newsletter for magic link ${mlid} with otp ${otp}`, e);
        setError(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [otp, mlid, history]);

  const onClickHandler = () => {
    history.push(RouteNames.ROOT);
  };

  return (
    <Page isLoading={isLoading} error={error} className={classes.root}>
      <TwoColLayout>
        <Column centerContent={true} useColMargin={true}>
          <div className={classes.container}>
            <Typography variant="h1">{t('pages.subscribe.title')}</Typography>
            <Typography variant="body1" className={classes.body}>
              {t('pages.subscribe.body')}
            </Typography>
            <Button className={classes.button} onClick={onClickHandler}>
              {t('pages.subscribe.button')}
            </Button>
          </div>
        </Column>
        <Column centerContent={true} hide="sm">
          <div className={classes.imageContainer}>
            {<img className={classes.image} src={Subscribed} alt={t('pages.subscribe.imgAltText')} />}
          </div>
        </Column>
      </TwoColLayout>
    </Page>
  );
};
