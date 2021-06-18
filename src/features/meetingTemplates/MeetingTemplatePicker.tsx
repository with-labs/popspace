import { MeetingTemplateName, templateMetadata } from '@src/constants/MeetingTypeMetadata';
import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography, Box, makeStyles } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
export interface IMeetingTemplatePickerProps {
  onSelect: (templateName: MeetingTemplateName) => void;
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  cardRoot: {
    '&:hover': {
      outline: 'none',
      boxShadow: `inset 0 0 0 4px ${theme.palette.brandColors.lavender.bold}`,
    },
  },
}));

export const MeetingTemplatePicker: React.FC<IMeetingTemplatePickerProps> = ({ onSelect, className }) => {
  return (
    <Box mt={2}>
      <Grid container spacing={2} style={{ width: '100%' }} className={className}>
        {Object.values(MeetingTemplateName).map((templateName) => (
          <Grid item key={templateName} xs={12} sm={6} md={6} lg={4}>
            <MeetingTemplateCard templateName={templateName} onClick={() => onSelect(templateName)} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const MeetingTemplateCard: React.FC<{ templateName: MeetingTemplateName; onClick: () => void }> = ({
  templateName,
  onClick,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Card elevation={0} classes={{ root: classes.cardRoot }}>
      <CardActionArea onClick={onClick} disableRipple disableTouchRipple>
        <CardMedia>
          <img
            src={templateMetadata[templateName].image}
            alt={t(`${templateMetadata[templateName].i18nKey}.imgAlt`)}
            style={{ width: '100%', paddingLeft: 5, paddingRight: 5, paddingTop: 5 }}
          />
        </CardMedia>
        <CardContent>
          <Box mb={1}>
            <Typography variant="body1">{t(`${templateMetadata[templateName].i18nKey}.title`)}</Typography>
          </Box>
          <Typography variant="body2">{t(`${templateMetadata[templateName].i18nKey}.description`)}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
