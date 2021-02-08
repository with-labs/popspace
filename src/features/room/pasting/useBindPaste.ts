import { useEffect } from 'react';
import { usePasteStore } from './usePasteStore';
import TurndownService from 'turndown';

const turndown = new TurndownService();

function targetWasField(ev: ClipboardEvent) {
  const el = ev.target as HTMLElement;
  return ['INPUT', 'TEXTAREA'].includes(el.tagName) || el.getAttribute('contenteditable');
}

function getFileItems(data: DataTransfer) {
  const fileItems: File[] = [];
  for (const item of data.items) {
    if (item.kind === 'file') {
      const file = item.getAsFile();
      if (file) {
        fileItems.push(file);
      }
    }
  }
  return fileItems;
}

function getText(data: DataTransfer) {
  const html = data.getData('text/html');

  if (html) {
    return turndown.turndown(html);
  }

  return data.getData('text/plain');
}

/**
 * Provides props to bind the handler to handle paste events,
 * ignores events targeting editable elements and treats other
 * events as content to paste into the room.
 */
export function useBindPaste() {
  const api = usePasteStore((store) => store.api);

  useEffect(() => {
    const onPaste = async (ev: ClipboardEvent) => {
      // filter out pasting into text fields
      if (targetWasField(ev)) {
        return;
      }

      // back-compat path (IE, etc)
      const data: DataTransfer = (window as any).clipboardData ?? ev.clipboardData;
      if (data.files.length > 0) {
        api.setFiles(Array.from(data.files));
      } else {
        // check for files in items too
        const fileItems = getFileItems(data);
        if (fileItems.length) {
          api.setFiles(fileItems);
        } else {
          api.setText(getText(data));
        }
      }
    };

    document.addEventListener('paste', onPaste);
    return () => {
      document.removeEventListener('paste', onPaste);
    };
  }, [api]);
}
