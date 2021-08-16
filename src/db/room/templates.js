const prisma = require('../prisma');
const { SYSTEM_USER_ID } = require('../constants.js');
let mockCreator;

const getMockCreator = async () => {
  if (mockCreator) {
    return mockCreator;
  }
  mockCreator = await shared.db.accounts.actorById(SYSTEM_USER_ID);
  if (!mockCreator) {
    log.app.info(
      `Creating mock actor with id ${SYSTEM_USER_ID} for creating widgets in room templates.`,
    );
    mockCreator = await prisma.actor.create({
      data: {
        id: SYSTEM_USER_ID,
        kind: 'system',
        displayName: 'Tilde',
        admin: true,
      },
    });
    log.app.info('Successfully created mock widget creator!', mockCreator);
  }
  return mockCreator;
};

/**
 * @typedef {Object} RoomState
 * @property {string} wallpaperUrl
 * @property {number} width
 * @property {number} height
 *
 * @typedef {Object} TemplateData
 * @property {RoomState} state
 * @property {string} displayName
 * @property {Array} widgets - A tuple of [WidgetType, WidgetState, Transform]
 */

module.exports = {
  /**
   *
   * @param {number} roomId
   * @param {TemplateData} templateData
   */
  setUpRoomFromTemplate: async (roomId, templateData) => {
    const creator = await getMockCreator();
    /*
      Sample room template as of 2021/07/12
      {
        display_name: 'Room',
        state: {
          wallpaper_url: 'https://s3-us-west-2.amazonaws.com/with.playground/negativespave_wallpaper.png',
          is_custom_wallpaper: true,
          wallpaper_repeats: true,
          background_color: '#000000',
        },
        widgets: [
          ["STICKY_NOTE", { text: "Hello world" }, { size: { width: 200, height: 200 }, position: { x: 0, y: 0 } }]
        ]
      }
    */
    const state = {
      ...templateData.state,
      zOrder: [],
    };
    await shared.db.room.data.setRoomState(roomId, state);

    // add widgets
    const widgets = [];
    for (const [type, widgetState, transform] of templateData.widgets) {
      const roomWidget = await shared.db.room.data.addWidgetInRoom(
        creator.id,
        roomId,
        type,
        widgetState,
        transform,
        creator,
      );
      widgets.push(roomWidget);
    }

    return {
      state,
      widgets: await Promise.all(widgets.map((w) => w.serialize())),
      id: roomId,
    };
  },

  empty: (displayName = 'generated') => {
    return {
      displayName,
      state: {},
      widgets: [],
    };
  },

  /**
   * Creates a new template under the default System user.
   * TODO: create templates under other users
   * @param {string} templateName
   * @param {TemplateData} data
   * @param {string} creatorId
   */
  createTemplate: (templateName, data, creatorId = SYSTEM_USER_ID) => {
    return prisma.roomTemplate.create({
      data: {
        name: templateName,
        data: data,
        creatorId,
      },
    });
  },
};
