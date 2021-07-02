/**
 * WARNING: experimental / dev-centric feature! Do not
 * build user features relying on this functionality!
 *
 * This global object acts as a register of all active notepad
 * Quill instances. It can be used to access their state by
 * widget ID.
 */

class NotepadRegistry {
  quills: Record<string, any> = {};
  register = (widgetId: string, quill: any) => {
    this.quills[widgetId] = quill;
    return () => {
      delete this.quills[widgetId];
    };
  };
}

export const notepadRegistry = new NotepadRegistry();

// @ts-ignore
window.unicorn = notepadRegistry;
