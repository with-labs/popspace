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

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};
