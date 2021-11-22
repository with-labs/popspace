import { useEffect } from 'react';

/**
 * Appends a script tag to the DOM, using the contents specified.
 * DO NOT EVER PASS IN USER INPUT TO THIS FUNCTION.
 */
export function useScript(scriptContents: string) {
  useEffect(() => {
    const tag = document.createElement('script');
    tag.textContent = scriptContents;
    document.head.appendChild(tag);
    return () => {
      document.head.removeChild(tag);
    };
  }, [scriptContents]);
}
