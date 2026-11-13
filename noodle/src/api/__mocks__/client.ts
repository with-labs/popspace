const mockClient = {
  actor: null,
  sessionToken: null,
  roomId: null,

  requireActor: vi.fn((cb) => cb),
  login: vi.fn(),
  logout: vi.fn(),
  joinMeeting: vi.fn().mockResolvedValue('fake-token'),
  leaveMeeting: vi.fn(),

  post: vi.fn(),
  get: vi.fn(),

  // eventemitter
  on: vi.fn(),
  off: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),

  // sub-clients

  files: {
    getRoomFileUploadUrl: vi.fn(),
    deleteFile: vi.fn(),
  },
  magicLinks: {
    magicLinkUnsubscribe: vi.fn(),
    magicLinkSubscribe: vi.fn(),
  },
  openGraph: {
    getOpenGraph: vi.fn(),
  },
  participants: {
    updateSelf: vi.fn(),
  },
  passthrough: {
    updateCursor: vi.fn(),
  },
  roomState: {
    setWallpaperUrl: vi.fn(),
    bringToFront: vi.fn(),
  },
  transforms: {
    transformWidget: vi.fn().mockResolvedValue(undefined),
    transformSelf: vi.fn().mockResolvedValue(undefined),
  },
  widgets: {
    addWidget: vi.fn().mockResolvedValue(undefined),
    updateWidget: vi.fn(),
    deleteWidget: vi.fn(),
  },
};

export default mockClient;
