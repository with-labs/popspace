import * as React from 'react';
import { Typography, makeStyles, Button, Box } from '@material-ui/core';
import { useTranslation, Trans } from 'react-i18next';
import { CenterColumnPage } from '../../Layouts/CenterColumnPage/CenterColumnPage';
import { Links } from '@constants/Links';
import { Link } from '@components/Link/Link';

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
      <Link disableStyling to={Links.LANDING_PAGE} newTab={false}>
        <Button fullWidth={false} tabIndex={-1}>
          {t('pages.notSupported.buttonText')}
        </Button>
      </Link>
    </CenterColumnPage>
  );
};
