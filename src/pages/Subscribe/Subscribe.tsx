import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { TwoColLayout } from '@layouts/TwoColLayout/TwoColLayout';
import { Column } from '@layouts/TwoColLayout/Column/Column';
import { Button, makeStyles, Typography } from '@material-ui/core';
import Api from '@utils/api';
import useQueryParams from '@hooks/useQueryParams/useQueryParams';
import { ErrorCodes } from '@constants/ErrorCodes';
import { ErrorInfo } from '../../types/api';
import { Page } from '@layouts/Page/Page';
import { getSessionToken } from '@utils/sessionToken';
import Subscribed from './images/subscribed.png';
import { RouteNames } from '@constants/RouteNames';
import { logger } from '@utils/logger';

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
  const [error, setError] = useState<ErrorInfo>(null!);

  // get the query params from the url
  const query = useQueryParams();

  const otp = query.get('otp') || '';
  const mlid = query.get('mlid') || '';

  useEffect(() => {
    Api.magicLinkSubscribe(otp, mlid)
      .then((result: any) => {
        if (!result.success) {
          if (result.errorCode === ErrorCodes.INVALID_OTP) {
            // the link is invalid, expired, or already resolved
            if (getSessionToken()) {
              history.push(`${RouteNames.ROOT}?e=${ErrorCodes.INVALID_LINK}`);
            } else {
              // the user is not logged in, something is wrong with the link
              // redirect to signin page with invalid popup message
              history.push(`${RouteNames.SIGN_IN}?e=${ErrorCodes.INVALID_LINK}`);
            }
          } else {
            // something unexpected happened with the link
            logger.warn(
              `Warning subcribing to newsletter for magic link ${mlid} with otp ${otp}`,
              result.message,
              result.errorCode
            );
            setError({
              errorCode: ErrorCodes.UNEXPECTED,
            });
          }
        }
      })
      .catch((e: any) => {
        logger.error(`Error subcribing to newsletter for magic link ${mlid} with otp ${otp}`, e);
        setError({
          errorCode: ErrorCodes.UNEXPECTED,
          error: e,
        });
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
