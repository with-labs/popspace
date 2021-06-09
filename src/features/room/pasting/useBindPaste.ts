import { useEffect } from 'react';
import { usePasteStore } from './usePasteStore';
import TurndownService from 'turndown';

const turndown = new TurndownService();

function targetWasNotepadWidget(el: HTMLElement | null) {
  /*
    The notepad widget relies on Quill.js

    Quill.js relies on a single div being put into the DOM and passed into its framework.

    After that it injects DOM elements depending on the theme.

    The actual copy+paste can land on a variety of elements. Quill is segmented into <p>aragraphs.
    If the paragraph is empty, it will have a <br/> inside, and that will be the element in this context.
    If the paragraph has text, the <p> itself will be the target element.
    If the cursor is on a list, el will be the <li>, under a <ul>.

    To avoid having to hack into Quill's internals, we deliberately wrap it in a div -
    with a special selector class (like ".notepad_selector").

    If a div with that class is an ancestor, we think that the current selection is copy+paste in a notepad.
  */
  while (el) {
    if (el.classList.contains('notepad_selector')) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

function targetWasField(ev: ClipboardEvent) {
  const el = ev.target as HTMLElement;
  return ['INPUT', 'TEXTAREA'].includes(el.tagName) || el.getAttribute('contenteditable') || targetWasNotepadWidget(el);
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
