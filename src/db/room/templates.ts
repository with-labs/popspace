import { Actor } from '@prisma/client';

import accounts from '../accounts';
import { SYSTEM_USER_ID } from '../constants';
import prisma from '../prisma';
import data from './data';

let mockCreator: Actor;

const getMockCreator = async () => {
  if (mockCreator) {
    return mockCreator;
  }
  mockCreator = await accounts.actorById(SYSTEM_USER_ID);
  if (!mockCreator) {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
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

export default {
  setUpRoomFromTemplate: async (roomId: bigint, templateData: any) => {
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
    await data.setRoomState(roomId, state);

    // add widgets
    const widgets = [];
    for (const [type, widgetState, transform] of templateData.widgets) {
      const roomWidget = await data.addWidgetInRoom(
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

  createTemplate: (
    templateName: string,
    data: any,
    creatorId = SYSTEM_USER_ID,
  ) => {
    return prisma.roomTemplate.create({
      data: {
        name: templateName,
        data: data,
        creatorId,
      },
    });
  },
};
