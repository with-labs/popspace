import { Form, Formik } from 'formik';
import * as React from 'react';
import { FormikSubmitButton } from '../../../../withComponents/fieldBindings/FormikSubmitButton';
import { FormikTextField } from '../../../../withComponents/fieldBindings/FormikTextField';
import { YoutubeWidgetData } from '../../../../types/room';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

/**
 * Unlike other simpler widgets, the data in the form
 * is not the same as the actual widget data, we parse it
 * and create the data from the URL.
 */
export type EditYoutubeFormData = {
  url: string;
};

export interface IEditYoutubeWidgetFormProps {
  onSave: (data: YoutubeWidgetData) => any;
  initialValues?: EditYoutubeFormData;
}

const EMPTY_VALUES: EditYoutubeFormData = {
  url: '',
};

function validateYoutubeUrl(url: string, translate: TFunction) {
  if (!extractVideoData(url)) {
    return translate('error.messages.provideValidYoutubeUrl');
  }
}

function extractVideoData(url: string) {
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  // check to see if we have match
  // video ids are always 11 characters
  if (match && match[2].length === 11) {
    // match will return our video id, so get it here
    const videoId = match[2];

    // check to see if we have query params and parse them out
    const querySplit = url.split('?');
    if (querySplit.length === 2) {
      const queryString = querySplit[1];

      // split the query
      const variables = queryString.split('&');

      // get the content
      const videoData = variables.reduce<{ videoId: string; start?: number; end?: number }>(
        (data, variable) => {
          const [param, value] = variable.split('=');

          //TODO: expand on this list of supported things, but
          // but for now jus support start and end times and t as start
          if (param === 'start' || param === 'end' || param === 't') {
            // normalize "t" to "start"
            const propertyName = param === 't' ? 'start' : param;
            // TODO: check if we have a time string like '1m22s' or just a seconds value
            data[propertyName] = parseInt(value, 10);
          }

          return data;
        },
        { videoId }
      );

      return videoData;
    }
  } else {
    return null;
  }
}

export const EditYoutubeWidgetForm: React.FC<IEditYoutubeWidgetFormProps> = ({
  initialValues = EMPTY_VALUES,
  onSave,
}) => {
  const { t } = useTranslation();

  const onSubmit = React.useCallback(
    (values: EditYoutubeFormData) => {
      const parsed = extractVideoData(values.url);

      if (!parsed) {
        throw new Error(t('error.messages.provideValidYoutubeUrl'));
      }

      return onSave({
        videoId: parsed.videoId,
        timestamp: parsed.start || 0,
        isPlaying: true,
        playStartedTimestampUTC: new Date().toUTCString(),
      });
    },
    [onSave, t]
  );

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validateOnMount>
      <Form>
        <FormikTextField
          name="url"
          label={t('widgets.youtube.urlLabel')}
          required
          margin="normal"
          validate={(url) => validateYoutubeUrl(url, t)}
          autoFocus
        />
        <FormikSubmitButton>{t('widgets.youtube.addBtn')}</FormikSubmitButton>
      </Form>
    </Formik>
  );
};
