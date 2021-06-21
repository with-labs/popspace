import * as React from 'react';
import { Typography, makeStyles, Button, Box } from '@material-ui/core';
import { useTranslation, Trans } from 'react-i18next';
import { CenterColumnPage } from '../../Layouts/CenterColumnPage/CenterColumnPage';
import { Links } from '@constants/Links';
import { useHistory } from 'react-router-dom';

export interface INotSupportedProps {}

const useStyles = makeStyles((theme) => ({
  title: {
    textAlign: 'center',
    paddingBottom: theme.spacing(4),
  },
}));

export const NotSupported: React.FC<INotSupportedProps> = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();

  return (
    <CenterColumnPage>
      <Typography variant="h1" className={classes.title}>
        {t('pages.notSupported.title')}
      </Typography>
      <Box pb={4}>
        <Typography variant="body1">
          <Trans i18nKey="pages.notSupported.body">test</Trans>
        </Typography>
      </Box>
      <Button fullWidth={false} onClick={() => history.push(Links.LANDING_PAGE)}>
        {t('pages.notSupported.buttonText')}
      </Button>
    </CenterColumnPage>
  );
};
