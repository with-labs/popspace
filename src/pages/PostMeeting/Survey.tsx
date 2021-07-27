import { FormikSubmitButton } from '@components/fieldBindings/FormikSubmitButton';
import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import { Spacing } from '@components/Spacing/Spacing';
import { Button, FormControlLabel, Radio, RadioGroup, Typography } from '@material-ui/core';
import i18n from '@src/i18n';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export interface SurveyProps {
  onSubmit: (feedback: string) => any;
  onSkip: () => any;
}

const OPTIONS = [
  'pages.postMeeting.surveyOptions.choppy',
  'pages.postMeeting.surveyOptions.oneCantHear',
  'pages.postMeeting.surveyOptions.cantHearOne',
  'pages.postMeeting.surveyOptions.echo',
  'pages.postMeeting.surveyOptions.delay',
  'pages.postMeeting.surveyOptions.volume',
  'pages.postMeeting.surveyOptions.static',
  'pages.postMeeting.surveyOptions.screenshareBlank',
  'pages.postMeeting.surveyOptions.cantUnmute',
  'pages.postMeeting.surveyOptions.other',
];

const validationSchema = Yup.object().shape({
  other: Yup.string().max(2048, i18n.t('pages.postMeeting.tooLong', { maxChars: 2048 })),
});

export function Survey({ onSubmit, onSkip }: SurveyProps) {
  const { t } = useTranslation();

  return (
    <Formik
      initialValues={{ feedback: '', other: '' }}
      validationSchema={validationSchema}
      validateOnBlur
      validateOnMount
      onSubmit={({ feedback, other }) => {
        if (feedback === OPTIONS[OPTIONS.length - 1]) {
          return onSubmit(other);
        } else {
          // submit localized English text
          return onSubmit(
            t(feedback, {
              lng: 'en',
            })
          );
        }
      }}
    >
      {({ values, handleChange, handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <Typography paragraph>Which problem most affected your experience?</Typography>
          <RadioGroup name="feedback" value={values.feedback} onChange={handleChange}>
            <Spacing flexDirection="column" mb={2}>
              {OPTIONS.map((option) => (
                <FormControlLabel value={option} key={option} control={<Radio />} label={t(option)} />
              ))}
            </Spacing>
          </RadioGroup>
          {values.feedback === OPTIONS[OPTIONS.length - 1] && (
            <FormikTextField
              margin="normal"
              multiline
              rows={4}
              placeholder={t('pages.postMeeting.negativeFeedbackPlaceholder')}
              name="other"
            />
          )}
          <Spacing justifyContent="flex-end" width="100%">
            <Button onClick={onSkip} color="default" fullWidth={false}>
              {t('pages.postMeeting.skipSurvey')}
            </Button>
            <FormikSubmitButton fullWidth={false}>{t('pages.postMeeting.submitFeedback')}</FormikSubmitButton>
          </Spacing>
        </form>
      )}
    </Formik>
  );
}
