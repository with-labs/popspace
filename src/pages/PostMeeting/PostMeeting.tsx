import { FormikSubmitButton } from '@components/fieldBindings/FormikSubmitButton';
import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import { Link } from '@components/Link/Link';
import { StarRating } from '@components/StarRating/StarRating';
import { RouteNames } from '@constants/RouteNames';
import { Box, Button, makeStyles, Typography } from '@material-ui/core';
import api from '@api/client';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps, useHistory } from 'react-router';
import { logger } from '@utils/logger';

export interface PostMeetingProps extends RouteComponentProps<{ roomRoute: string }> {}

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(8),
  },
  starRating: {
    marginBottom: theme.spacing(2),
    margin: 'auto',
  },
  ratingText: {
    marginBottom: theme.spacing(4),
    textAlign: 'center',
  },
}));

export function PostMeeting({ match }: PostMeetingProps) {
  const { t } = useTranslation();

  const classes = useStyles();
  const history = useHistory();

  const [state, setState] = useState<{ ratingId: number | null; rating: number }>({ ratingId: null, rating: -1 });

  const submitRating = async (rating: number) => {
    try {
      let result: { success: boolean; message?: string; ratingId: number; rating: number };
      if (state.ratingId) {
        // updating existing rating
        result = await api.experienceRatings.updateExperienceRating({ ratingId: state.ratingId, rating });
      } else {
        result = await api.experienceRatings.submitExperienceRating({ rating, roomRoute: match.params.roomRoute });
      }

      setState({ ratingId: result.ratingId, rating: result.rating });
    } catch (err) {
      logger.error(err);
      toast.error(t('error.messages.genericUnexpected') as string);
    }
  };

  const submitFeedback = async (feedback: string) => {
    try {
      if (!state.ratingId) {
        throw new Error("Can't submit feedback, no rating provided");
      }
      await api.experienceRatings.updateExperienceRating({ ratingId: state.ratingId, feedback });

      history.push(RouteNames.ROOT);
      toast.success(t('pages.postMeeting.surveyThanks') as string);
    } catch (err) {
      logger.error(err);
      toast.error(t('error.messages.genericUnexpected') as string);
    }
  };

  const collectFeedback = !!state.ratingId;
  const wasPositive = state.rating >= 3;

  return (
    <Box width="100%" height="100%" flex={1} display="flex" flexDirection="column" p={4}>
      <Box width="100%" maxWidth="600px" margin="auto">
        {collectFeedback ? (
          <Formik onSubmit={(data) => submitFeedback(data.feedback)} initialValues={{ feedback: '' }}>
            <Box component={Form} display="flex" flexDirection="column">
              <Typography variant="h1" className={classes.title}>
                {wasPositive
                  ? t('pages.postMeeting.positiveFeedbackPrompt')
                  : t('pages.postMeeting.negativeFeedbackPrompt')}
              </Typography>
              <FormikTextField
                multiline
                rows={3}
                name="feedback"
                margin="normal"
                placeholder={
                  wasPositive
                    ? t('pages.postMeeting.positiveFeedbackPlaceholder')
                    : t('pages.postMeeting.negativeFeedbackPlaceholder')
                }
              />
              <Box display="flex" flexDirection="row" justifyContent="space-between">
                <SkipButton />
                <FormikSubmitButton fullWidth={false}>{t('pages.postMeeting.submitFeedback')}</FormikSubmitButton>
              </Box>
            </Box>
          </Formik>
        ) : (
          <Box display="flex" flexDirection="column">
            <Typography variant="h1" className={classes.title}>
              {t('pages.postMeeting.title')}
            </Typography>

            <StarRating value={state.rating} onChange={submitRating} className={classes.starRating} />

            <Typography variant="body1" className={classes.ratingText}>
              {t('pages.postMeeting.ratingCaption')}
            </Typography>

            <SkipButton />
          </Box>
        )}
      </Box>
    </Box>
  );
}

function SkipButton() {
  const { t } = useTranslation();

  return (
    <Link disableStyling to={RouteNames.ROOT}>
      <Button variant="text" color="inherit">
        {t('pages.postMeeting.skipSurvey')}
      </Button>
    </Link>
  );
}
