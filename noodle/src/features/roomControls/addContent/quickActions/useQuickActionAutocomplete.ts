import * as React from 'react';
import { QuickAction } from '../../../quickActions/types';
import { useQuickActionOptions } from './useQuickActionOptions';
import { useQuickAction } from './useQuickAction';

export function useQuickActionAutocomplete({ onChange }: { onChange?: (value: QuickAction | null) => void } = {}) {
  const [inputValue, setInputValue] = React.useState('');
  const handleInputChange = React.useCallback((ev: any, value: string) => {
    setInputValue(value);
  }, []);

  const options = useQuickActionOptions(inputValue);

  const applyAction = useQuickAction();
  const handleSelection = React.useCallback(
    (ev: any, value: QuickAction | null) => {
      // reset input value
      setInputValue('');

      applyAction(value);
      onChange?.(value);
    },
    [applyAction, onChange]
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
