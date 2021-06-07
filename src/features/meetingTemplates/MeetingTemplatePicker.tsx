import { MeetingTemplateName } from '@features/meetingTemplates/constants';
import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { templateMetadata } from './constants';

export interface IMeetingTemplatePickerProps {
  onSelect: (templateName: MeetingTemplateName) => void;
  className?: string;
}

export const MeetingTemplatePicker: React.FC<IMeetingTemplatePickerProps> = ({ onSelect, className }) => {
  return (
    <Grid container spacing={2} style={{ width: '100%' }} className={className}>
      {Object.values(MeetingTemplateName).map((templateName) => (
        <Grid item key={templateName} xs={12} sm={6} md={6} lg={4}>
          <MeetingTemplateCard templateName={templateName} onClick={() => onSelect(templateName)} />
        </Grid>
      ))}
    </Grid>
  );
};

const MeetingTemplateCard: React.FC<{ templateName: MeetingTemplateName; onClick: () => void }> = ({
  templateName,
  onClick,
}) => {
  const { t } = useTranslation();

  return (
    <Card elevation={0}>
      <CardActionArea onClick={onClick} disableRipple disableTouchRipple>
        <CardMedia>
          <img
            src={templateMetadata[templateName].image}
            alt={templateMetadata[templateName].imageAlt}
            style={{ width: '100%' }}
          />
        </CardMedia>
        <CardContent>
          <Typography variant="body2">{t(templateMetadata[templateName].descriptionI18nKey)}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
