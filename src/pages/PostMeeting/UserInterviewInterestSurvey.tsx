import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import { Spacing } from '@components/Spacing/Spacing';
import { useSurvey } from '@features/surveys/useSurvey';
import { Button, Typography } from '@material-ui/core';
import { Form, Formik } from 'formik';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export function UserInterviewInterestSurvey(props: React.HTMLAttributes<HTMLFormElement>) {
  const { t } = useTranslation();
  const { submitSurvey, dismissSurvey, previousResponse } = useSurvey('userInterviewInterest');

  if (!!previousResponse) {
    return <Typography>{t('surveys.userInterviewInterest.thanks')}</Typography>;
  }

  return (
    <Formik onSubmit={({ email }) => submitSurvey(email)} initialValues={{ email: '' }}>
      <Form {...props}>
        <Spacing flexDirection="column" gap={2} alignItems="flex-start" textAlign="start">
          <Typography paragraph>{t('surveys.userInterviewInterest.question')}</Typography>
          <FormikTextField
            type="email"
            name="email"
            label={t('surveys.userInterviewInterest.email')}
            placeholder={t('surveys.userInterviewInterest.emailPlaceholder')}
          />
          <Spacing alignSelf="flex-end">
            <Button fullWidth={false} onClick={dismissSurvey} color="inherit" variant="text">
              {t('surveys.userInterviewInterest.cancel')}
            </Button>
            <Button fullWidth={false} type="submit" variant="contained" color="primary">
              {t('surveys.userInterviewInterest.submit')}
            </Button>
          </Spacing>
        </Spacing>
      </Form>
    </Formik>
  );
}
