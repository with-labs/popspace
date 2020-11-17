import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { Alert } from '@material-ui/lab';
import { Snackbar } from '@material-ui/core';

export default {
  title: 'components/Alert',
  component: Alert,
  argTypes: {},
};

const Template: Story<{}> = (args) => (
  <Snackbar open>
    <Alert>Hello world</Alert>
  </Snackbar>
);

export const Default = Template.bind({});
