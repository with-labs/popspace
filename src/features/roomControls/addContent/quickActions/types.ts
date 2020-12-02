import { WidgetType, WidgetData } from '../../../../types/room';

export enum QuickActionKind {
  AddAccessory,
  SetStatus,
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
};

export type AddAccessoryQuickAction = BaseQuickAction & {
  kind: QuickActionKind.AddAccessory;
  accessoryType: WidgetType;
  accessoryData: WidgetData;
  draft?: boolean;
};

export type SetStatusQuickAction = BaseQuickAction & {
  kind: QuickActionKind.SetStatus;
  status: string;
};

// TODO: union other types of actions into this discriminated union type
export type QuickAction = AddAccessoryQuickAction | SetStatusQuickAction;

/**
 * A quick action provider is a function that generates valid quick
 * actions based on the provided user input string
 */
export type QuickActionProvider = (query: string) => QuickAction[];
