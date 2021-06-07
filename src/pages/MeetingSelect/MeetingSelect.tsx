import * as React from 'react';
import clsx from 'clsx';
import { makeStyles, Typography, Box, Container, TextField, Button, MuiThemeProvider } from '@material-ui/core';
import { useCreateMeeting } from '@hooks/useCreateMeeting/useCreateMeeting';
import { useHistory } from 'react-router';
import { ApiNamedRoom } from '@utils/api';
import { useTranslation } from 'react-i18next';
import { RouteNames } from '@constants/RouteNames';
import toast from 'react-hot-toast';
import { MeetingTemplateName } from '@features/meetingTemplates/constants';

export interface IMeetingSelectProps {}

const useStyles = makeStyles((theme) => ({
  explanationText: {
    width: 500,
    textAlign: 'center',
  },
}));

export const MeetingSelect: React.FC<IMeetingSelectProps> = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const createMeeting = useCreateMeeting();

  const onMeetingSelect = async () => {
    try {
      const meeting = await createMeeting(MeetingTemplateName.Custom);
      history.push(RouteNames.MEETING_LINK, {
        meetingInfo: meeting,
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <Container maxWidth="md">
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box mt={10} mb={6}>
            LOGO FPO
          </Box>
          <Typography variant="h1" className={classes.explanationText}>
            {t('pages.meetingSelect.titleText')}
          </Typography>
          <Button onClick={onMeetingSelect}>Only option</Button>
        </Box>
      </Container>
    </>
  );
};
