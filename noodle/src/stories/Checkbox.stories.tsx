import { Checkbox, CheckboxProps } from '@material-ui/core';
import { Story } from '@storybook/react/types-6-0';
import React from 'react';

export default {
  title: 'components/Checkbox',
  component: Checkbox,
  argTypes: {},
};

const Template: Story<CheckboxProps> = (args) => <Checkbox {...args} />;

export const Primary = Template.bind({});
Primary.args = {};

export const PrimaryChecked = Template.bind({});
PrimaryChecked.args = {
  checked: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

export const DisabledChecked = Template.bind({});
DisabledChecked.args = {
  disabled: true,
  checked: true,
};
