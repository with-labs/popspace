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

/**
 * A simple text field for setting the display name.
 * Automatically syncs value with the current actor. It will update
 * the name as the user types with a debounced effect or immediately
 * on field blur. Validation is also included.
 *
 * Not meant to be used in a form! Use this on its own.
 */
export function DisplayNameField({ onChange }: { onChange?: (value: string) => void }) {
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

  const debouncedCommitChange = React.useMemo(() => debounce(commitChange, 500), [commitChange]);

  return (
    <TextField
      label={t('modals.userSettingsModal.displayNameInput.placeholder')}
      value={value}
      onChange={(event) => {
        setValidationError(null);
        setValue(event.target.value);
        debouncedCommitChange(event.target.value);
      }}
      placeholder={t('modals.userSettingsModal.displayNameInput.placeholder')}
      onBlur={(ev) => commitChange(ev.target.value)}
      helperText={validationError}
      error={!!validationError}
    />
  );
}
