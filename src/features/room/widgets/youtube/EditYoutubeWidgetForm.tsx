import { Form, Formik } from 'formik';
import * as React from 'react';
import { FormikSubmitButton } from '@components/fieldBindings/FormikSubmitButton';
import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { parseYoutubeLink } from '@utils/youtube';
import { YoutubeWidgetState } from '@api/roomState/types/widgets';
import { useCanvasObject } from '@providers/canvas/CanvasObject';
import { INITIAL_SIZE_PLAYER } from './constants';

/**
 * Unlike other simpler widgets, the data in the form
 * is not the same as the actual widget data, we parse it
 * and create the data from the URL.
 */
export type EditYoutubeFormData = {
  url: string;
};

export interface IEditYoutubeWidgetFormProps {
  onSave: (data: YoutubeWidgetState) => any;
  initialValues?: EditYoutubeFormData;
}

const EMPTY_VALUES: EditYoutubeFormData = {
  url: '',
};

function validateYoutubeUrl(url: string, translate: TFunction) {
  if (!parseYoutubeLink(url)) {
    return translate('error.messages.provideValidYoutubeUrl');
  }
}

export const EditYoutubeWidgetForm: React.FC<IEditYoutubeWidgetFormProps> = ({
  initialValues = EMPTY_VALUES,
  onSave,
}) => {
  const { t } = useTranslation();

  const { resize } = useCanvasObject();

  const onSubmit = React.useCallback(
    (values: EditYoutubeFormData) => {
      const parsed = parseYoutubeLink(values.url);

      if (!parsed) {
        throw new Error(t('error.messages.provideValidYoutubeUrl'));
      }

      onSave({
        videoId: parsed.videoId,
        mediaState: {
          timestamp: parsed.timestamp || parsed.start || 0,
          isPlaying: true,
          playStartedTimestampUtc: new Date().toUTCString(),
        },
      });

      resize(INITIAL_SIZE_PLAYER, true);
    },
    [onSave, resize, t]
  );

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validateOnMount>
      <Form style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
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
