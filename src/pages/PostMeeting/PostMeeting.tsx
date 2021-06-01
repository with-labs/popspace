import { FormikStarRating } from '@components/fieldBindings/FormikStarRating';
import { FormikSubmitButton } from '@components/fieldBindings/FormikSubmitButton';
import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import { Link } from '@components/Link/Link';
import { Spacing } from '@components/Spacing/Spacing';
import { StarRating } from '@components/StarRating/StarRating';
import { RouteNames } from '@constants/RouteNames';
import { Box, Button, makeStyles, Typography } from '@material-ui/core';
import api from '@api/client';
import { Form, Formik } from 'formik';
import { useReducer, useState } from 'react';
import toast from 'react-hot-toast';
import { RouteComponentProps, useHistory } from 'react-router';
import { object, number } from 'yup';
import { ApiError } from '@src/errors/ApiError';

export interface PostMeetingProps extends RouteComponentProps<{ roomRoute: string }> {}

const validationSchema = object().shape({
  rating: number().required().moreThan(-1).lessThan(5).integer(),
});

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

interface RatingState {
  ratingId: number | undefined;
  rating: number;
  feedback: string;
}
type RatingAction = { type: 'rate'; rating: number; ratingId: number } | { type: 'feedback'; feedback: string };

const ratingReducer = (state: RatingState, action: RatingAction) => {
  switch (action.type) {
    case 'feedback':
      return { ...state, feedback: action.feedback };
    case 'rate':
      return { ...state, rating: action.rating, ratingId: action.ratingId };
  }
};

export function PostMeeting({ match }: PostMeetingProps) {
  const classes = useStyles();
  const history = useHistory();

  const [state, setState] = useState<{ ratingId: number | null; rating: number }>({ ratingId: null, rating: -1 });

  const submitRating = async (rating: number) => {
    let result: { success: boolean; message?: string; ratingId: number; rating: number };
    try {
      if (state.ratingId) {
        // updating existing rating
        result = await api.experienceRatings.updateExperienceRating({ ratingId: state.ratingId, rating });
      } else {
        result = await api.experienceRatings.submitExperienceRating({ rating, roomRoute: match.params.roomRoute });
      }
      setState({ ratingId: result.ratingId, rating: result.rating });
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Something went wrong, please try again');
      }
    }
  };

  const submitFeedback = async (feedback: string) => {
    if (!state.ratingId) {
      throw new Error("Can't submit feedback, no rating provided");
    }
    try {
      await api.experienceRatings.updateExperienceRating({ ratingId: state.ratingId, feedback });
      history.push(RouteNames.ROOT);
      toast.success('Thanks for helping us make Noodle better!');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Something went wrong, please try again');
      }
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
                {wasPositive ? `We're glad you enjoyed it!` : `We're sorry it didn't go great...`}
              </Typography>
              <FormikTextField
                multiline
                rows={3}
                name="feedback"
                margin="normal"
                placeholder={wasPositive ? `Anything we could do to improve?` : `Please tell us why!`}
              />
              <Box display="flex" flexDirection="row" justifyContent="space-between">
                <SkipButton />
                <FormikSubmitButton fullWidth={false}>Send feedback</FormikSubmitButton>
              </Box>
            </Box>
          </Formik>
        ) : (
          <Box display="flex" flexDirection="column">
            <Typography variant="h1" className={classes.title}>
              Thank you for using Noodle!
            </Typography>

            <StarRating value={state.rating} onChange={submitRating} className={classes.starRating} />

            <Typography variant="body1" className={classes.ratingText}>
              To make sure we are providing your with the best possible app, please rate your experience
            </Typography>

            <SkipButton />
          </Box>
        )}
      </Box>
    </Box>
  );
}

function SkipButton() {
  return (
    <Link disableStyling to={RouteNames.ROOT}>
      <Button variant="text" color="inherit">
        Skip survey
      </Button>
    </Link>
  );
}
