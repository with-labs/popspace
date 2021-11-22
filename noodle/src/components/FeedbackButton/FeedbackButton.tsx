import { FeedbackFish } from '@feedback-fish/react';
import { Button, ButtonProps } from '@material-ui/core';
import * as React from 'react';

export interface IFeedbackButtonProps extends ButtonProps {}

export const FeedbackButton: React.FC<IFeedbackButtonProps> = (props) => {
  return (
    <FeedbackFish projectId="c887d68c668ce8">
      <Button fullWidth={false} variant="text" {...props} />
    </FeedbackFish>
  );
};
