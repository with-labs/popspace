import { AccessoryIconType } from '@components/icons/AccessoryIcon';
import { WidgetType, WidgetStateByType } from '@api/roomState/types/widgets';
import { Bounds } from '../../types/spatials';

export enum QuickActionKind {
  AddAccessory,
  SetStatus,
  AddFile,
}

type BaseQuickAction = {
  /**
   * How the action will appear to the user in the list
   */
  displayName: string;
  /**
   * Confidence indicates, on a 0-10 scale, how likely this action
   * is to be the one the user intended. More specific actions (like,
   * if they pasted a YouTube link specifically) should be graded highly,
   * less specific actions (like pasting in random text to create a sticky
   * note) should be graded lower.
   */
  confidence: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  /**
   * What icon should be shown as part of the item? This corresponds to
   * the multi-variant icon component AccessoryIcon
   */
  icon: AccessoryIconType;
};

export type AddAccessoryQuickAction<Type extends WidgetType> = BaseQuickAction & {
  kind: QuickActionKind.AddAccessory;
  accessoryType: Type;
  accessoryData: WidgetStateByType[Type];
  size: Bounds;
};

export type AddFileQuickAction = BaseQuickAction & {
  kind: QuickActionKind.AddFile;
};

// TODO: union other types of actions into this discriminated union type
export type QuickAction = AddAccessoryQuickAction<any> | AddFileQuickAction;

/**
 * A quick action provider is a function that generates valid quick
 * actions based on the provided user input string
 */
export type QuickActionProvider = (query: string) => QuickAction[];
