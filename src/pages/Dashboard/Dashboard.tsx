import { useCreateMeeting } from '@hooks/useCreateMeeting/useCreateMeeting';
import { Box, Button } from '@material-ui/core';
import * as React from 'react';
import toast from 'react-hot-toast';
import { useHistory } from 'react-router';

export interface IDashboardProps {}

export const Dashboard: React.FC<IDashboardProps> = () => {
  const createMeeting = useCreateMeeting();

  const history = useHistory();

  const handleCreate = async () => {
    try {
      const meeting = await createMeeting();
      history.push(`/${meeting.route}?join`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Box width="100%" height="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      <Button onClick={handleCreate}>New meeting</Button>
      {/* TODO: anything else */}
    </Box>
  );
};
