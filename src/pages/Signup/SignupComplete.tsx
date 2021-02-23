import { Typography } from '@material-ui/core';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from '../../components/Link/Link';
import invitationImg from '../../images/illustrations/mail.svg';
import { FormPage } from '../../Layouts/formPage/FormPage';
import { FormPageImage } from '../../Layouts/formPage/FormPageImage';
import { FormPageContent } from '../../Layouts/formPage/FormPageContent';
import { FormPageTitle } from '../../Layouts/formPage/FormPageTitle';

export function SignupComplete({ resend, email }: { resend: () => any; email: string }) {
  const { t } = useTranslation();

  return (
    <FormPage>
      <FormPageContent>
        <FormPageTitle>{t('pages.signup.invitationSent')}</FormPageTitle>
        <Typography paragraph>
          <Trans as="span" i18nKey={t('pages.signup.invitationDestination')}>
            We went an invitation to <span>{email}</span>
          </Trans>
        </Typography>
        <Typography paragraph>
          <Trans as="span" i18nKey={t('pages.signup.invitationHelp')}>
            If you didn't receive the email, you can{' '}
            <Link to="#" onClick={resend}>
              {t('pages.signup.invitationRequestNewLink')}
            </Link>
            . Don't forget to check your spam folder!
          </Trans>
        </Typography>
      </FormPageContent>
      <FormPageImage src={invitationImg} alt={t('pages.signup.invitationImg')} />
    </FormPage>
  );
}
