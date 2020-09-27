import { MenuItem, TextField, TextFieldProps } from '@material-ui/core';
import { Story } from '@storybook/react/types-6-0';
import React from 'react';

export default {
  title: 'components/TextField',
  component: TextField,
  argTypes: {},
};

const Template: Story<TextFieldProps> = (args) => <TextField {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'Label',
  placeholder: 'Action Type',
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: 'Disabled',
  disabled: true,
  placeholder: "Can't touch this",
};

export const Invalid = Template.bind({});
Invalid.args = {
  label: 'Invalid',
  placeholder: 'Oops',
  error: true,
};

export const Select = Template.bind({});
Select.args = {
  label: 'Select',
  placeholder: 'Choose one...',
  select: true,
  children: [
    <MenuItem value="apple" key="apple">
      Apple
    </MenuItem>,
    <MenuItem value="banana" key="banana">
      Banana
    </MenuItem>,
    <MenuItem value="orange" key="orange">
      Orange
    </MenuItem>,
  ],
};
