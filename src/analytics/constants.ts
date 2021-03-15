export enum EventNames {
  JOIN_ROOM = 'join_room',
  CREATE_WIDGET = 'create_widget',
  DELETE_WIDGET = 'delete_widget',
  CHANGED_WALLPAPER = 'changed_wallpaper',
  CHANGED_AVATAR = 'changed_avatar',
  CHANGED_DISPLAYNAME = 'changed_displayName',
  CHANGED_STATUS = 'changed_status',
  TOGGLED_CAMERA_ON = 'toggled_camera_on',
  TOGGLED_MICROPHONE_ON = 'toggled_microphone_on',
  TOGGLED_STEPAWAY = 'toggled_stepAway',
  EXPAND_LINK_WIDGET = 'expand_link_widget',
  COLLAPSE_LINK_WIDGET = 'collapse_link_widget',
}

export enum Origin {
  OMNIBAR = 'omnibar',
  WIDGET_MENU = 'widget_menu',
  PASTE = 'paste',
  NOT_SET = 'not_set',
}

export enum StatusUpdate {
  EMOJI = 'emoji',
  TEXT = 'text',
  BOTH_UPDATED = 'both_updated',
}

export enum UserEventData {
  IS_AWAY_START = 'isAwayStart',
  MIC_START = 'micStart',
  VIDEO_START = 'videoStart',
}
