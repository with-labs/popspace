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
  ONBOARDING_BEGIN_SIGNUP = 'onboarding_begin_signup',
  ONBOARDING_RESEND_EMAIL = 'onboarding_resend_email',
  ONBOARDING_NAME_ROOM = 'onboarding_name_room',
  ONBOARDING_CONFIRM_EMAIL = 'onboarding_confirm_email',
  INVITE_CONFIRM_EMAIL = 'invite_confirm_email',
  ONBOARDING_INVITE_TEAM_MEMBERS = 'onboarding_invite_team_members',
  INVITE_TEAM_MEMBERS = 'invite_team_members',
  BROWSER_PERMISSION = 'browser_permission',
  CREATE_ROOM = 'create_room',
  CHANGE_WIDGET_COLOR = 'change_widget_color',
}

export enum Origin {
  NOT_SET = 'not_set',
  OMNIBAR = 'omnibar',
  WIDGET_MENU = 'widget_menu',
  PASTE = 'paste',
  CREATE_ROOM_BUTTON = 'create_room_button',
  ONBOARDING = 'onboarding',
  DASHBOARD = 'dashboard',
  INVITE = 'invite',
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
