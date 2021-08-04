import client from '@api/client';
import { useRoomStore } from '@api/useRoomStore';
import { debounce, TextField } from '@material-ui/core';
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

export function DisplayNameField() {
  const { t } = useTranslation();

  const currentUser = useRoomStore((room) => room.cacheApi.getCurrentUser());
  const displayName = currentUser?.actor.displayName || '';

  const [value, setValue] = React.useState(displayName);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const commitChange = React.useCallback(
    (value: string) => {
      const validationError = validate(value, t);
      if (validationError) {
        setValidationError(validationError);
      } else {
        client.participants.updateDisplayName(value);
      }
    },
    [t]
  );

  const debouncedCommitChange = React.useMemo(() => debounce(commitChange, 500), [commitChange]);

  return (
    <TextField
      label="Display Name"
      value={value}
      onChange={(event) => {
        setValidationError(null);
        setValue(event.target.value);
        debouncedCommitChange(event.target.value);
      }}
      onBlur={(ev) => commitChange(ev.target.value)}
      helperText={validationError}
      error={!!validationError}
    />
  );
}
