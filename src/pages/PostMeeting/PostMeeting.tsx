import { Analytics } from '@analytics/Analytics';
import api from '@api/client';
import { FormikSubmitButton } from '@components/fieldBindings/FormikSubmitButton';
import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import { Link } from '@components/Link/Link';
import { Logo } from '@components/Logo/Logo';
import { ProductHuntButton } from '@components/ProductHuntButton/ProductHuntButton';
import { Spacing } from '@components/Spacing/Spacing';
import { StarRating } from '@components/StarRating/StarRating';
import { Links } from '@constants/Links';
import { Box, Button, makeStyles, Typography } from '@material-ui/core';
import i18n from '@src/i18n';
import { logger } from '@utils/logger';
import { Form, Formik } from 'formik';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router';
import * as Yup from 'yup';

const ANALYTICS_PAGE_ID = 'page_postMeeting';

export interface PostMeetingProps extends RouteComponentProps<{ roomRoute: string }> {}

const useStyles = makeStyles((theme) => ({
  logo: {
    marginBottom: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(4),
    textAlign: 'center',
  },
  starRating: {},
  mainBlock: {
    boxShadow: theme.focusRings.create(theme.palette.primary.dark),
    borderRadius: 8,
  },
}));

const validationSchema = Yup.object().shape({
  feedback: Yup.string()
    .required(i18n.t('common.required'))
    .max(2048, i18n.t('pages.postMeeting.tooLong', { maxChars: 2048 })),
});

export function PostMeeting({ match }: PostMeetingProps) {
  const { t } = useTranslation();

  const classes = useStyles();

  const [state, setState] = useState<{ ratingId: number | null; rating: number; done: boolean }>({
    ratingId: null,
    rating: -1,
    done: false,
  });

  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    Analytics.trackEvent(`${ANALYTICS_PAGE_ID}_visited`, new Date().toUTCString());
  }, []);

  useEffect(() => {
    function trackClosing() {
      Analytics.trackEvent(`${ANALYTICS_PAGE_ID}_closed`, hasInteracted);
    }

    window.addEventListener('beforeunload', trackClosing);

    return () => {
      window.removeEventListener('beforeunload', trackClosing);
    };
  }, [hasInteracted]);

  const submitRating = async (rating: number) => {
    try {
      setHasInteracted(true);
      setState((cur) => ({ ...cur, rating }));

      let result: { success: boolean; message?: string; ratingId: number; rating: number };
      if (state.ratingId) {
        // updating existing rating
        result = await api.experienceRatings.updateExperienceRating({ ratingId: state.ratingId, rating });
      } else {
        result = await api.experienceRatings.submitExperienceRating({ rating, roomRoute: match.params.roomRoute });
      }

      Analytics.trackEvent(`${ANALYTICS_PAGE_ID}_rating`, rating, { rating, roomRoute: match.params.roomRoute });

      setState({ ratingId: result.ratingId, rating: result.rating, done: false });
    } catch (err) {
      logger.error(err);
      toast.error(t('error.messages.genericUnexpected') as string);
    }
  };

  const onDone = () => setState((cur) => ({ ...cur, done: true }));

  const submitFeedback = async (feedback: string) => {
    try {
      if (!state.ratingId) {
        throw new Error("Can't submit feedback, no rating provided");
      }
      await api.experienceRatings.updateExperienceRating({ ratingId: state.ratingId, feedback });
      onDone();
    } catch (err) {
      logger.error(err);
      toast.error(t('error.messages.genericUnexpected') as string);
    }
  };

  const collectFeedback = !!state.ratingId;
  const wasPositive = state.rating >= 3;

  const titleKey = collectFeedback
    ? wasPositive
      ? 'pages.postMeeting.positiveFeedbackPrompt'
      : 'pages.postMeeting.negativeFeedbackPrompt'
    : 'pages.postMeeting.title';

  return (
    <Box
      width="100%"
      height="100%"
      flex={1}
      display="flex"
      flexDirection="column"
      alignItems="center"
      pl={4}
      pr={4}
      pt={6}
      pb={4}
    >
      <Logo className={classes.logo} link newTab />
      <Typography variant="h1" className={classes.title}>
        <Trans i18nKey={titleKey} />
      </Typography>
      <Box width="100%" maxWidth="760px" mx="auto" p={4} mb={3} className={classes.mainBlock}>
        {state.done ? (
          <Spacing flexDirection="column" alignItems="center" textAlign="center" p={2}>
            <Typography variant="h2" gutterBottom>
              {t('pages.postMeeting.surveyThanks')}
            </Typography>
            <Link
              to={Links.CREATE_MEETING}
              disableStyling
              onClick={() => {
                Analytics.trackEvent(`${ANALYTICS_PAGE_ID}_createNewMeeting`, true);
              }}
            >
              <Button color="primary" tabIndex={-1}>
                {t('pages.postMeeting.createAnother')}
              </Button>
            </Link>
          </Spacing>
        ) : collectFeedback ? (
          <Formik
            onSubmit={(data) => {
              Analytics.trackEvent(`${ANALYTICS_PAGE_ID}_collectedFeedback`, true);
              submitFeedback(data.feedback);
            }}
            initialValues={{ feedback: '' }}
            validateOnBlur
            validateOnMount
            validationSchema={validationSchema}
          >
            <Spacing component={Form} flexDirection="column" alignItems="center" gap={2} textAlign="center">
              <FormikTextField
                multiline
                rows={4}
                name="feedback"
                margin="normal"
                placeholder={
                  wasPositive
                    ? t('pages.postMeeting.positiveFeedbackPlaceholder')
                    : t('pages.postMeeting.negativeFeedbackPlaceholder')
                }
              />
              <Spacing justifyContent="flex-end" width="100%">
                <Button
                  onClick={() => {
                    Analytics.trackEvent(`${ANALYTICS_PAGE_ID}_collectedFeedback`, false);
                    onDone();
                  }}
                  color="default"
                  fullWidth={false}
                >
                  {t('pages.postMeeting.skipSurvey')}
                </Button>
                <FormikSubmitButton fullWidth={false}>{t('pages.postMeeting.submitFeedback')}</FormikSubmitButton>
              </Spacing>
            </Spacing>
          </Formik>
        ) : (
          <Spacing flexDirection="column" gap={2} alignItems="center" textAlign="center">
            <Typography variant="h2">
              <Trans i18nKey="pages.postMeeting.ratingCaption" />
            </Typography>
            <Typography variant="body1">{t('pages.postMeeting.howWasIt')}</Typography>
            <StarRating value={state.rating} onChange={submitRating} className={classes.starRating} />
          </Spacing>
        )}
      </Box>
      <SaveLinkSection />
      <ProductHuntButton />
    </Box>
  );
}

function SaveLinkSection() {
  const { t } = useTranslation();

  const roomLink = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return window.location.toString().replace('/post_meeting', '');
  }, []);

  return (
    <Box
      p={4}
      borderRadius={8}
      maxWidth="760px"
      bgcolor="primary.contrastText"
      color="white"
      textAlign="center"
      width="100%"
    >
      <Typography variant="body1" paragraph style={{ textAlign: 'center' }}>
        {t('pages.postMeeting.saveThisLink')}
      </Typography>
      <Typography variant="body1">
        <Link style={{ color: 'inherit' }} to={roomLink}>
          {roomLink}
        </Link>
      </Typography>
    </Box>
  );
}
