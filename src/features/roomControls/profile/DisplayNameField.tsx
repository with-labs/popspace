import client from '@api/client';
import { useRoomStore } from '@api/useRoomStore';
import { DoneIcon } from '@components/icons/DoneIcon';
import { IconButton, makeStyles, TextField } from '@material-ui/core';
import { MAX_DISPLAY_NAME_LENGTH } from '@src/constants';
import * as React from 'react';
import { TFunction, useTranslation } from 'react-i18next';

const validate = (value: string, t: TFunction) => {
  if (!value.length) {
    return t('modals.userSettingsModal.displayNameInput.blankError');
  }
  if (value.length > MAX_DISPLAY_NAME_LENGTH) {
    return t('modals.userSettingsModal.displayNameInput.maxSize');
  }
};

const useStyles = makeStyles((theme) => ({
  iconButton: {
    color: theme.palette.success.dark,
  },
}));

/**
 * A simple text field for setting the display name.
 * Automatically syncs value with the current actor. Validation is also included.
 *
 * Not meant to be used in a form! Use this on its own.
 */
export function DisplayNameField({ onChange }: { onChange?: (value: string) => void }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const currentUser = useRoomStore((room) => room.cacheApi.getCurrentUser());
  const displayName = currentUser?.actor.displayName || '';

  const [value, setValue] = React.useState(displayName);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  // storing in a ref so we don't invalidate the memoization of the debounced function
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const commitChange = React.useCallback(
    (value: string) => {
      const validationError = validate(value, t);
      if (validationError) {
        setValidationError(validationError);
      } else {
        client.participants.updateDisplayName(value);
        onChangeRef.current?.(value);
      }
    },
    [t]
  );

  return (
    <TextField
      label={t('modals.userSettingsModal.displayNameInput.label')}
      value={value}
      onChange={(event) => {
        setValidationError(null);
        setValue(event.target.value);
      }}
      placeholder={t('modals.userSettingsModal.displayNameInput.placeholder')}
      helperText={validationError}
      error={!!validationError}
      InputProps={{
        endAdornment: (
          <IconButton className={classes.iconButton} color="secondary" onClick={() => commitChange(value)}>
            <DoneIcon />
          </IconButton>
        ),
        autoComplete: 'name',
      }}
    />
  );
}
