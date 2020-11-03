import React, { useEffect, useState, useMemo } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import * as typeformEmbed from '@typeform/embed';
import { useHistory } from 'react-router-dom';
import { TwoColLayout } from '../../Layouts/TwoColLayout/TwoColLayout';
import { Column } from '../../Layouts/TwoColLayout/Column/Column';
import { Button, makeStyles, CircularProgress, Box } from '@material-ui/core';
import Api from '../../utils/api';
import useQueryParams from '../../hooks/useQueryParams/useQueryParams';
import { ErrorTypes } from '../../constants/ErrorType';
import { ErrorInfo } from '../../types/api';
import * as Sentry from '@sentry/react';
import { Page } from '../../Layouts/Page/Page';

import { RouteNames } from '../../constants/RouteNames';
import SadBlobby from './images/sadblobby.png';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(null!);

  // get the query params from the url
  const query = useQueryParams();

  const otp = useMemo(() => query.get('otp'), [query]);
  const mlid = useMemo(() => query.get('mlid'), [query]);

  useEffect(() => {
    setIsLoading(true);
    if (!otp || !mlid) {
      // pop the invalid link page
      setError({
        errorType: ErrorTypes.LINK_EXPIRED,
        error: t('error.messages.malformedUrl'),
      });
    } else {
      Api.unsubscribeFromEmail(otp, mlid)
        .then((result: any) => {
          setIsLoading(false);
          if (!result.success) {
            // TODO: we could be handling INVALID/EXPIRED/RESOLVED errors separately
            setError({
              errorType: ErrorTypes.LINK_EXPIRED,
              error: { message: '' },
            });
          }
        })
        .catch((e: any) => {
          setIsLoading(false);
          Sentry.captureMessage(`Error unsubcribing email for ${mlid}`, Sentry.Severity.Error);
          setError({
            errorType: ErrorTypes.UNEXPECTED,
            error: e,
          });
        });
    }
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
        <Column classNames="u-flexJustifyCenter u-flexAlignItemsCenter" useColMargin={true}>
          <div className={classes.container}>
            <div>{t('pages.unsubscribe.quoteText')}</div>
            <div className="u-fontH0">{t('pages.unsubscribe.title')}</div>
            <div className={clsx(classes.body, 'u-fontP1')}>{t('pages.unsubscribe.body')}</div>
            <Button className={classes.button} onClick={onClickHandler}>
              {t('pages.unsubscribe.button')}
            </Button>
          </div>
        </Column>
        <Column classNames="u-flexJustifyCenter u-flexAlignItemsCenter u-sm-displayNone">
          <div className={classes.imageContainer}>
            <img className={classes.image} src={SadBlobby} alt={t('pages.unsubscribe.imgAltText')} />
          </div>
        </Column>
      </TwoColLayout>
    </Page>
  );
};
