import { WidgetType } from '@api/roomState/types/widgets';
import { Link } from '@components/Link/Link';
import { Box, ClickAwayListener, makeStyles, TextareaAutosize } from '@material-ui/core';
import throttle from 'lodash.throttle';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

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
    fontWeight: theme.typography.fontWeightBold as any,
    color: theme.palette.grey[900],
    textAlign: 'center',
  },
}));

export const EditStickyNoteWidgetForm: React.FC<IEditStickyNoteWidgetFormProps> = ({ onClose }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  // slighly annoying behavior - if the edit mode is entered
  // by clicking a button outside of this component (as is often
  // the case), the button click itself will immediately close the
  // edit mode as an 'outside click' - to prevent this we use this
  // flag to wait one frame before allowing an outside click
  // to close the editor
  const [allowClickAwayClose, setAllowClickAwayClose] = React.useState(false);
  React.useEffect(() => {
    setTimeout(() => {
      setAllowClickAwayClose(true);
    });
  }, []);

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

  const closeIfAllowed = () => {
    // prevent closing if we are not yet ready or if
    // the text is empty
    if (!allowClickAwayClose || !text) return;
    onClose();
  };

  const checkForClose = (ev: React.KeyboardEvent) => {
    if (!text) return;
    if ((ev.key === 'Enter' && ev.shiftKey) || ev.key === 'Escape') {
      closeIfAllowed();
    }
  };

  const moveCursorToEnd = (ev: React.FocusEvent<HTMLTextAreaElement>) => {
    ev.target.setSelectionRange(ev.target.value.length, ev.target.value.length);
  };

  return (
    <ClickAwayListener onClickAway={closeIfAllowed}>
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
            onKeyDown={checkForClose}
          />
        </WidgetScrollPane>
        <Box mt={1} textAlign="center" flex="0 0 auto">
          <Link to="https://www.markdownguide.org/cheat-sheet" newTab className={classes.cheatSheet}>
            {t('widgets.stickyNote.markdownCheatSheet')}
          </Link>
        </Box>
      </Box>
    </ClickAwayListener>
  );
};
