import client from '@api/client';
import { AdminRoom, RoomNameCheck } from '@api/types';
import { ConfirmModal } from '@components/ConfirmModal/ConfirmModal';
import { CopyIcon } from '@components/icons/CopyIcon';
import { DeleteIcon } from '@components/icons/DeleteIcon';
import { EditIcon } from '@components/icons/EditIcon';
import { Link } from '@components/Link/Link';
import { RouteNames } from '@constants/RouteNames';
import { MeetingTemplateName, templateMetadata } from '@features/meetingTemplates/templateData';
import { useCreateMeeting } from '@hooks/useCreateMeeting/useCreateMeeting';
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  makeStyles,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { LockOpenOutlined, LockOutlined } from '@material-ui/icons';
import { ThemeName } from '@src/theme/theme';
import { logger } from '@utils/logger';
import * as React from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { CenterColumnPage } from '../../Layouts/CenterColumnPage/CenterColumnPage';
import { RenameRoomModal } from './RenameRoomModal';
import { RoomAccessModal } from './RoomAccessModal';
import { RoomNameField } from './RoomNameField';

const MIN_ROOM_PASSWORD_LENGTH = 12;

const useStyles = makeStyles((theme) => ({
  section: {
    width: '100%',
    padding: theme.spacing(3),
    marginTop: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    padding: theme.spacing(2, 0),
    '& + &': {
      borderTop: `1px solid ${theme.palette.grey[300]}`,
    },
  },
  roomInfo: {
    flex: '1 1 240px',
    minWidth: 0,
  },
  link: {
    overflowWrap: 'anywhere',
  },
  actions: {
    display: 'flex',
    flexShrink: 0,
  },
}));

const roomLink = (room: AdminRoom) => `${window.location.origin}/${room.vanityRoute || room.route}`;

export const RoomManagement: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const create = useCreateMeeting();

  const [rooms, setRooms] = React.useState<AdminRoom[] | null>(null);
  const [renaming, setRenaming] = React.useState<AdminRoom | null>(null);
  const [changingAccess, setChangingAccess] = React.useState<AdminRoom | null>(null);
  const [deleting, setDeleting] = React.useState<AdminRoom | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [name, setName] = React.useState('');
  const [nameCheck, setNameCheck] = React.useState<RoomNameCheck | null>(null);
  const [templateName, setTemplateName] = React.useState(MeetingTemplateName.Blank);
  const [accessMode, setAccessMode] = React.useState<'public' | 'password'>('public');
  const [roomPassword, setRoomPassword] = React.useState('');
  const [creating, setCreating] = React.useState(false);

  const loadRooms = React.useCallback(async () => {
    try {
      setRooms(await client.listRooms());
    } catch (err: any) {
      logger.error(err);
      toast.error(err.message);
    }
  }, []);

  React.useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const onCreate = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const password = accessMode === 'password' ? roomPassword : undefined;
    if (password !== undefined && password.length < MIN_ROOM_PASSWORD_LENGTH) {
      toast.error(t('pages.meetingSelect.passwordTooShort') as string);
      return;
    }
    setCreating(true);
    try {
      const meeting = await create(templateName, password, name.trim() || undefined);
      toast.success(t('pages.roomManagement.created', { link: `${window.location.host}/${meeting.route}` }) as string);
      setName('');
      setRoomPassword('');
      await loadRooms();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const onCopy = async (room: AdminRoom) => {
    try {
      await navigator.clipboard.writeText(roomLink(room));
      toast.success(t('pages.meetingLink.copied') as string);
    } catch (err) {
      logger.error(err);
      toast.error(t('pages.meetingLink.copyErrorMsg') as string);
    }
  };

  const onDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await client.deleteRoom(deleting.roomId);
      toast.success(t('pages.roomManagement.deleted') as string);
      setDeleting(null);
      await loadRooms();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // a typed name has to be free; an empty one gets a generated link
  const canCreate = !creating && (!name.trim() || !!nameCheck?.available);

  return (
    <CenterColumnPage pageTitle={t('pages.roomManagement.title')}>
      <Typography variant="h1">{t('pages.roomManagement.title')}</Typography>

      <Paper className={classes.section} component="section">
        <Typography variant="h2">{t('pages.roomManagement.createTitle')}</Typography>
        <Box component="form" onSubmit={onCreate} mt={1}>
          <RoomNameField
            value={name}
            onChange={setName}
            onCheck={setNameCheck}
            helperText={t('pages.roomManagement.nameHint')}
            fullWidth
            margin="normal"
          />
          <TextField
            select
            label={t('pages.roomManagement.templateLabel')}
            value={templateName}
            onChange={(ev) => setTemplateName(ev.target.value as MeetingTemplateName)}
            fullWidth
            margin="normal"
          >
            {Object.values(MeetingTemplateName).map((template) => (
              <MenuItem key={template} value={template}>
                {t(`${templateMetadata[template].i18nKey}.title`)}
              </MenuItem>
            ))}
          </TextField>
          <RadioGroup row value={accessMode} onChange={(ev) => setAccessMode(ev.target.value as any)}>
            <FormControlLabel value="public" control={<Radio />} label={t('pages.meetingSelect.publicOption')} />
            <FormControlLabel value="password" control={<Radio />} label={t('pages.meetingSelect.passwordOption')} />
          </RadioGroup>
          {accessMode === 'password' && (
            <TextField
              label={t('pages.meetingSelect.passwordLabel')}
              type="password"
              autoComplete="new-password"
              value={roomPassword}
              onChange={(ev) => setRoomPassword(ev.target.value)}
              inputProps={{ maxLength: 128 }}
              fullWidth
              margin="normal"
            />
          )}
          <Box mt={2}>
            <Button type="submit" disabled={!canCreate}>
              {creating ? <CircularProgress size={22} /> : t('pages.roomManagement.createButton')}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper className={classes.section} component="section">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h2" style={{ flex: 1, whiteSpace: 'nowrap' }}>
            {t('pages.roomManagement.listTitle', { count: rooms?.length ?? 0 })}
          </Typography>
          <Button variant="text" onClick={loadRooms}>
            {t('common.refresh')}
          </Button>
        </Box>
        {rooms === null && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        )}
        {rooms?.length === 0 && (
          <Box py={4}>
            <Typography>{t('pages.roomManagement.empty')}</Typography>
          </Box>
        )}
        {rooms?.map((room) => (
          <div key={room.roomId} className={classes.row}>
            <div className={classes.roomInfo}>
              <Typography variant="h3">{room.displayName || t('pages.roomManagement.untitled')}</Typography>
              <Link to={`/${room.vanityRoute || room.route}`} newTab={false} className={classes.link}>
                {roomLink(room)}
              </Link>
              <Typography variant="body2" color="textSecondary">
                {[
                  room.passwordProtected
                    ? t('pages.roomManagement.passwordProtected')
                    : t('pages.roomManagement.public'),
                  t('pages.roomManagement.createdAt', { date: new Date(room.createdAt).toLocaleString() }),
                ].join(' · ')}
              </Typography>
            </div>
            <div className={classes.actions}>
              <Tooltip title={t('pages.meetingLink.copyLinkButton') as string}>
                <IconButton onClick={() => onCopy(room)} aria-label={t('pages.meetingLink.copyLinkButton')}>
                  <CopyIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('pages.roomManagement.access.title') as string}>
                <IconButton onClick={() => setChangingAccess(room)} aria-label={t('pages.roomManagement.access.title')}>
                  {room.passwordProtected ? <LockOutlined /> : <LockOpenOutlined />}
                </IconButton>
              </Tooltip>
              <Tooltip title={t('pages.roomManagement.rename') as string}>
                <IconButton onClick={() => setRenaming(room)} aria-label={t('pages.roomManagement.rename')}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('pages.roomManagement.delete') as string}>
                <IconButton onClick={() => setDeleting(room)} aria-label={t('pages.roomManagement.delete')}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        ))}
      </Paper>

      <Box mt={4} display="flex" gridGap={8}>
        <Link to={RouteNames.CREATE_MEETING.replace('/:meetingType?', '')} newTab={false} disableStyling>
          <Button variant="text" tabIndex={-1}>
            {t('pages.roomManagement.templatesLink')}
          </Button>
        </Link>
        <Button variant="text" onClick={() => client.adminLogout()}>
          {t('pages.meetingSelect.signOut')}
        </Button>
      </Box>

      <RenameRoomModal room={renaming} onClose={() => setRenaming(null)} onRenamed={loadRooms} />
      <RoomAccessModal room={changingAccess} onClose={() => setChangingAccess(null)} onChanged={loadRooms} />
      <ConfirmModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={onDelete}
        isBusy={isDeleting}
        title={t('pages.roomManagement.deleteTitle')}
        primaryButtonText={t('pages.roomManagement.delete')}
        buttonColor={ThemeName.Cherry}
      >
        <Typography>
          {t('pages.roomManagement.deleteConfirm', {
            name: deleting?.displayName || t('pages.roomManagement.untitled'),
          })}
        </Typography>
      </ConfirmModal>
    </CenterColumnPage>
  );
};
