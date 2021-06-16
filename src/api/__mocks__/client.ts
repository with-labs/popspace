const mockClient = {
  actor: null,
  sessionToken: null,
  roomId: null,

  requireActor: jest.fn((cb) => cb),
  login: jest.fn(),
  logout: jest.fn(),
  joinMeeting: jest.fn().mockResolvedValue('fake-token'),
  leaveMeeting: jest.fn(),

  post: jest.fn(),
  get: jest.fn(),

  // eventemitter
  on: jest.fn(),
  off: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),

  // sub-clients

  files: {
    getRoomFileUploadUrl: jest.fn(),
    deleteFile: jest.fn(),
  },
  magicLinks: {
    magicLinkUnsubscribe: jest.fn(),
    magicLinkSubscribe: jest.fn(),
  },
  openGraph: {
    getOpenGraph: jest.fn(),
  },
  participants: {
    updateSelf: jest.fn(),
  },
  passthrough: {
    updateCursor: jest.fn(),
  },
  roomState: {
    setWallpaperUrl: jest.fn(),
    bringToFront: jest.fn(),
  },
  transforms: {
    transformWidget: jest.fn().mockResolvedValue(undefined),
    transformSelf: jest.fn().mockResolvedValue(undefined),
  },
  widgets: {
    addWidget: jest.fn().mockResolvedValue(undefined),
    updateWidget: jest.fn(),
    deleteWidget: jest.fn(),
  },
};

export default mockClient;
