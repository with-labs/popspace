import { Typography } from '@material-ui/core';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from '@components/Link/Link';
import img from '../../images/illustrations/check_your_email.jpg';
import mobileImg from '../../images/illustrations/check_your_email_responsive.jpg';
import { FormPage } from '@layouts/formPage/FormPage';
import { FormPageImage } from '@layouts/formPage/FormPageImage';
import { FormPageContent } from '@layouts/formPage/FormPageContent';
import { FormPageTitle } from '@layouts/formPage/FormPageTitle';

export function SignupComplete({ resend, email }: { resend: () => any; email: string }) {
  const { t } = useTranslation();

  return (
    <FormPage>
      <FormPageContent>
        <FormPageTitle>{t('pages.signup.invitationSent')}</FormPageTitle>
        <Typography paragraph>
          <Trans as="span" i18nKey="pages.signup.invitationDestination" values={{ email }}>
            We sent a confirmation link to <span>{email}</span>
          </Trans>
        </Typography>
        <Typography paragraph>
          <Trans as="span" i18nKey="pages.signup.invitationHelp">
            If you didn't receive the email, you can
            <Link to="#" onClick={resend}>
              {t('pages.signup.invitationRequestNewLink')}
            </Link>
            . Don't forget to check your spam folder!
          </Trans>
        </Typography>
      </FormPageContent>
      <FormPageImage src={img} mobileSrc={mobileImg} />
    </FormPage>
  );
}
