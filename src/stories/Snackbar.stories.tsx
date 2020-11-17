import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { Snackbar, SnackbarContent } from '@material-ui/core';

export default {
  title: 'components/Snackbar',
  component: Snackbar,
  argTypes: {},
};

const Template: Story<{}> = (args) => (
  <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} open>
    <SnackbarContent message="Reconnecting..." />
  </Snackbar>
);

export const Default = Template.bind({});
