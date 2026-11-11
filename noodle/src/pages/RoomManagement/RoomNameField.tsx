import client from '@api/client';
import { RoomNameCheck } from '@api/types';
import { TextField, TextFieldProps } from '@material-ui/core';
import { logger } from '@utils/logger';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

const CHECK_DELAY_MS = 400;

export interface IRoomNameFieldProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  /** the room being renamed, so its current name counts as available */
  roomId?: number;
  /** null while the name is empty or still being checked */
  onCheck?: (check: RoomNameCheck | null) => void;
}

/**
 * A room name input that shows the link the name turns into
 * and whether that link is still free.
 */
export const RoomNameField: React.FC<IRoomNameFieldProps> = ({ value, onChange, roomId, onCheck, ...rest }) => {
  const { t } = useTranslation();
  const [check, setCheck] = React.useState<RoomNameCheck | null>(null);
  const onCheckRef = React.useRef(onCheck);
  onCheckRef.current = onCheck;

  React.useEffect(() => {
    setCheck(null);
    onCheckRef.current?.(null);
    if (!value.trim()) return;

    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const result = await client.checkRoomName(value, roomId);
        if (cancelled) return;
        setCheck(result);
        onCheckRef.current?.(result);
      } catch (err) {
        logger.error(err);
      }
    }, CHECK_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [value, roomId]);

  let helperText = rest.helperText;
  if (check) {
    const link = `${window.location.host}/${check.route}`;
    helperText = check.available
      ? t('pages.roomManagement.nameAvailable', { link })
      : t(`pages.roomManagement.nameUnavailable.${check.reason}`, { link });
  } else if (value.trim()) {
    helperText = t('pages.roomManagement.nameChecking');
  }

  return (
    <TextField
      label={t('pages.roomManagement.nameLabel')}
      inputProps={{ maxLength: 100 }}
      {...rest}
      value={value}
      onChange={(ev) => onChange(ev.target.value)}
      error={!!check && !check.available}
      helperText={helperText}
    />
  );
};
