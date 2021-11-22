import { CheckboxField, ICheckboxFieldProps } from './CheckboxField';
import { Story } from '@storybook/react/types-6-0';
import React from 'react';

export default {
  title: 'components/CheckboxField',
  component: CheckboxField,
  argTypes: {},
};

const Template: Story<ICheckboxFieldProps> = (args) => <CheckboxField {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  label: 'Hello world',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  label: 'Unalterable',
};

export const DisabledChecked = Template.bind({});
DisabledChecked.args = {
  disabled: true,
  checked: true,
  label: 'On forever',
};
