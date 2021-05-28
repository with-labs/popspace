import { FormikSubmitButton } from '@components/fieldBindings/FormikSubmitButton';
import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import { MeetingTemplateName } from '@constants/meetingTemplates';
import { useCreateMeeting } from '@hooks/useCreateMeeting/useCreateMeeting';
import { Box, MenuItem } from '@material-ui/core';
import { Form, Formik } from 'formik';
import { useHistory } from 'react-router';

export function CreateMeeting() {
  const create = useCreateMeeting();
  const history = useHistory();

  const onSubmit = async (values: { templateName: MeetingTemplateName }) => {
    const meeting = await create(values.templateName);
    history.push(`/${meeting.route}?join`);
  };

  return (
    <Box flex={1} width="100%" height="100%" display="flex" alignItems="center" justifyContent="center">
      <Box width="100%" maxWidth="600px">
        <Formik initialValues={{ templateName: MeetingTemplateName.Empty }} onSubmit={onSubmit}>
          <Form>
            <FormikTextField select name="templateName" margin="normal">
              {Object.values(MeetingTemplateName).map((templateName) => (
                <MenuItem value={templateName}>{templateName}</MenuItem>
              ))}
            </FormikTextField>
            <FormikSubmitButton>Create Meeting</FormikSubmitButton>
          </Form>
        </Formik>
      </Box>
    </Box>
  );
}
