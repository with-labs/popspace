import { useRef, useCallback } from 'react';

export function useExport() {
  const ref = useRef<{ exportToImageURL: () => string }>(null);

  const handleExport = useCallback(() => {
    const url = ref.current?.exportToImageURL();
    if (!url) {
      console.log('no url!');
      return;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = `whiteboard_${new Date().toString()}.png`;

    const clickHandler = () => {
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.removeEventListener('click', clickHandler);
        a.remove();
      }, 150);
    };

    a.addEventListener('click', clickHandler, false);

    a.click();
  }, []);

  return { ref, handleExport };
}
