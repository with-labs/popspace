import * as React from 'react';
import { useAddAccessory } from '../useAddAccessory';
import { QuickAction, QuickActionKind } from './types';
import { useQuickActionOptions } from './useQuickActionOptions';

export function useQuickAction() {
  const [inputValue, setInputValue] = React.useState('');
  const handleInputChange = React.useCallback((ev: any, value: string) => {
    setInputValue(value);
  }, []);

  const options = useQuickActionOptions(inputValue);

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
      // this is a hack - Autocomplete will only show options whose label
      // matches the inputValue, but all of our options are selected specifically
      // so there is no need to do that test - TODO: override the filter function
      // instead...
      getOptionLabel: () => inputValue,
      // the value is always null - we never actually "select"
      // anything, we just use the options to do particular actions.
      value: null,
    },
  };
}
