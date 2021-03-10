import { makeStyles, Box, TextareaAutosize } from '@material-ui/core';
import throttle from 'lodash.throttle';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '../../../../components/Link/Link';
import { WidgetType } from '../../../../roomState/types/widgets';
import { useWidgetContext } from '../useWidgetContext';
import { WidgetScrollPane } from '../WidgetScrollPane';

export interface IEditStickyNoteWidgetFormProps {
  onClose: () => any;
}

const useStyles = makeStyles((theme) => ({
  form: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  textarea: {
    width: '100%',
    resize: 'none',
    padding: 0,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.pxToRem(16),
    border: 'none',
    '&:focus': {
      outline: 'none',
    },
  },
  scrollPane: {
    flex: `1 1 160px`,
    width: '100%',
  },
  cheatSheet: {
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.grey[900],
    textAlign: 'center',
  },
}));

export const EditStickyNoteWidgetForm: React.FC<IEditStickyNoteWidgetFormProps> = ({ onClose }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    save,
    widget: { widgetState },
  } = useWidgetContext<WidgetType.StickyNote>();

  const [text, setText] = React.useState(widgetState.text);

  const throttledSave = React.useMemo(
    () =>
      throttle(
        (value: string) =>
          save({
            text: value,
          }),
        200,
        { leading: true, trailing: true }
      ),
    [save]
  );

  const onChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(ev.target.value);
    throttledSave(ev.target.value);
  };

  const checkForClose = (ev: React.KeyboardEvent) => {
    if ((ev.key === 'Enter' && ev.shiftKey) || ev.key === 'Escape') {
      onClose();
    }
  };

  const moveCursorToEnd = (ev: React.FocusEvent<HTMLTextAreaElement>) => {
    ev.target.setSelectionRange(ev.target.value.length, ev.target.value.length);
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <WidgetScrollPane className={classes.scrollPane}>
        <TextareaAutosize
          required
          name="text"
          value={text}
          onChange={onChange}
          placeholder={t('widgets.stickyNote.textPlaceholder')}
          className={classes.textarea}
          autoFocus
          onFocus={moveCursorToEnd}
          onBlur={onClose}
          onKeyDown={checkForClose}
        />
      </WidgetScrollPane>

      <Box mt={1} textAlign="center" flex="0 0 auto">
        <Link to="https://www.markdownguide.org/cheat-sheet" newTab className={classes.cheatSheet}>
          {t('widgets.stickyNote.markdownCheatSheet')}
        </Link>
      </Box>
    </Box>
  );
};
