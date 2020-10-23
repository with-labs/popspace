import * as React from 'react';
import { useAddAccessory } from './useAddAccessory';
import { WidgetType, WidgetData } from '../../../../types/room';

export enum QuickActionKind {
  AddAccessory,
  // TODO:
  // SetStatus,
}

type BaseQuickAction = {
  label: string;
  displayName: string;
};

export type AddAccessoryQuickAction = BaseQuickAction & {
  kind: QuickActionKind.AddAccessory;
  accessoryType: WidgetType;
  accessoryData: WidgetData;
};

// TODO: union other types of actions into this discriminated union type
export type QuickAction = AddAccessoryQuickAction;

/**
 * This function processes the input the user typed and
 * determines which actions are available, as well as what
 * metadata will be associated with those actions.
 */
function computeOptions(prompt: string): QuickAction[] {
  // TODO: other accessory types
  // For now we just have the ability to create a sticky note.
  const actions: QuickAction[] = [];

  if (!!prompt) {
    // any text can be added to a sticky note.
    actions.push({
      label: prompt,
      kind: QuickActionKind.AddAccessory,
      accessoryType: WidgetType.StickyNote,
      displayName: 'Add as Sticky Note',
      accessoryData: {
        text: prompt,
        author: '', // this must be filled in later...
      },
    });
  }

  return actions;
}

function getOptionLabel(opt: QuickAction) {
  return opt.label;
}

export function useQuickAction() {
  const [inputValue, setInputValue] = React.useState('');
  const handleInputChange = React.useCallback((ev: any, value: string) => {
    setInputValue(value);
  }, []);

  const options = computeOptions(inputValue);

  const addAccessory = useAddAccessory();

  const handleSelection = React.useCallback(
    (ev: any, value: QuickAction | null) => {
      // reset input value
      setInputValue('');

      if (!value) return;

      // handle the action
      // TODO: split this into a dedicated function
      // to reduce complexity of this handler
      switch (value.kind) {
        case QuickActionKind.AddAccessory:
          addAccessory({
            type: value.accessoryType,
            initialData: value.accessoryData,
            publishImmediately: true,
          });
          break;
      }
    },
    [addAccessory]
  );

  return {
    autocompleteProps: {
      inputValue,
      onInputChange: handleInputChange,
      onChange: handleSelection,
      options,
      getOptionLabel,
      // the value is always null - we never actually "select"
      // anything, we just use the options to do particular actions.
      value: null,
    },
  };
}
