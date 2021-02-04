import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { Typography, TypographyProps } from '@material-ui/core';

export default {
  title: 'components/Typography',
  component: Typography,
  argTypes: {},
};

const Template: Story<TypographyProps> = (args) => <Typography {...args} />;

export const H1 = Template.bind({});
H1.args = {
  variant: 'h1',
  children: 'Kerning & Ligatures 1',
};

export const H2 = Template.bind({});
H2.args = {
  variant: 'h2',
  children: 'Kerning & Ligatures 2',
};

export const H3 = Template.bind({});
H3.args = {
  variant: 'h3',
  children: 'Kerning & Ligatures 3',
};

export const H4 = Template.bind({});
H4.args = {
  variant: 'h4',
  children: 'Kerning & Ligatures 4',
};

export const Body1 = Template.bind({});
Body1.args = {
  variant: 'body1',
  children: 'Kerning & Ligatures',
};

export const Body2 = Template.bind({});
Body2.args = {
  variant: 'body2',
  children: 'Kerning & Ligatures',
};
