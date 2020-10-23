import { Button, ButtonProps, ThemeProvider } from '@material-ui/core';
import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { cherry, lavender, oregano } from '../theme/theme';

export default {
  title: 'components/Button',
  component: Button,
  argTypes: {},
};

const Template: Story<ButtonProps> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: 'Hello world',
};

export const Default = Template.bind({});
Default.args = {
  color: 'default',
  children: 'Default (Snow)',
};

export const Disabled = Template.bind({});
Disabled.args = {
  children: 'Disabled',
  disabled: true,
};

// TODO: see https://github.com/mui-org/material-ui/pull/21389,
// this is coming in MUI v5 and we can wait for that.
export const Submitting = Template.bind({});
Submitting.args = {
  children: 'Submitting',
};

export const Colors = () => (
  <>
    <ThemeProvider theme={cherry}>
      <Button style={{ marginBottom: 8 }}>Cherry</Button>
    </ThemeProvider>
    <ThemeProvider theme={oregano}>
      <Button style={{ marginBottom: 8 }}>Oregano</Button>
    </ThemeProvider>
    <ThemeProvider theme={lavender}>
      <Button style={{ marginBottom: 8 }}>Lavender</Button>
    </ThemeProvider>
  </>
);
