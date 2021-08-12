import { DragEvent } from 'react';

export function getFileDropItems(ev: DragEvent) {
  const items: File[] = [];
  if (ev.dataTransfer.items) {
    for (const item of ev.dataTransfer.items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          items.push(file);
        }
      }
    }
  } else {
    // alternate usage - .files
    for (const file of ev.dataTransfer.files) {
      items.push(file);
    }
  }
  return items;
}
