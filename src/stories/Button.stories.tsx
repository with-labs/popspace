import { Button, ButtonProps, ThemeProvider } from '@material-ui/core';
import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { cherry, lavender, turquoise } from '../theme/theme';

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

export const Disabled = Template.bind({});
Disabled.args = {
  children: 'Disabled',
  disabled: true,
};

export const Submitting = Template.bind({});
Submitting.args = {
  children: 'Submitting',
};

export const Colors = () => (
  <>
    <ThemeProvider theme={cherry}>
      <Button style={{ marginBottom: 8 }}>Cherry</Button>
    </ThemeProvider>
    <ThemeProvider theme={turquoise}>
      <Button style={{ marginBottom: 8 }}>Turquoise</Button>
    </ThemeProvider>
    <ThemeProvider theme={lavender}>
      <Button style={{ marginBottom: 8 }}>Lavender</Button>
    </ThemeProvider>
  </>
);
