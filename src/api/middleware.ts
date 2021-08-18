const base64Decode = (str) => Buffer.from(str, 'base64').toString('utf-8');

const middleware = {
  getActor: async (req, res, next) => {
    // support Authorization header with a bearer token,
    // fallback to a `token` field on a POST body
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token =
      authHeader && authHeader.startsWith('Bearer')
        ? base64Decode(authHeader.replace('Bearer ', ''))
        : null;
    if (!token) {
      return next();
    }
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
    const session = await shared.lib.auth.sessionFromToken(token);
    if (!session) {
      return next();
    }
    const actorId = parseInt(session.actorId);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
    const actor = await shared.db.accounts.actorById(actorId);
    if (!actor) {
      return next();
    }
    req.actor = actor;
    req.session = session;
    next();
  },

  getIp: async (req, res, next) => {
    /*
      https://stackoverflow.com/questions/10849687/express-js-how-to-get-remote-client-address
    */
    req.ip =
      req.headers['x-forwarded-for'] ||
      (req.connection ? req.connection.remoteAddress : null);
    next();
  },

  requireActor: async (req, res, next) => {
    if (!req.actor) {
      return next({
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
        errorCode: shared.error.code.SESSION_REQUIRED,
        message: 'Must have a valid session',
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
        httpCode: shared.api.http.code.UNAUTHORIZED,
      });
    }
    next();
  },

  roomFromRoute: async (req, res, next) => {
    const roomRoute = req.body.room_route || req.body.roomRoute;
    if (!roomRoute) {
      return next(
        {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
          errorCode: shared.error.code.INVALID_API_PARAMS,
          message: 'Must provide room_route',
        },
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
        shared.api.http.code.BAD_REQUEST,
      );
    }
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
    req.room = await shared.db.room.core.roomByRoute(roomRoute);
    next();
  },

  requireRoom: async (req, res, next) => {
    if (!req.room) {
      return next(
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
        { errorCode: shared.error.code.UNKNOWN_ROOM, message: 'Unknown room' },
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
        shared.api.http.code.BAD_REQUEST,
      );
    }
    next();
  },

  requireRoomCreator: async (req, res, next) => {
    if (req.actor.id != req.room.creatorId) {
      return next({
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
        errorCode: shared.error.code.PERMISSION_DENIED,
        message: 'Insufficient permission',
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
        httpCode: shared.api.http.code.UNAUTHORIZED,
      });
    }
    next();
  },

  requireRoomMember: async (req, res, next) => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
    const isMember = await shared.db.room.permissions.isMember(
      req.user,
      req.room,
    );
    if (!isMember) {
      return next({
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
        errorCode: shared.error.code.PERMISSION_DENIED,
        message: 'Insufficient permission',
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
        httpCode: shared.api.http.code.UNAUTHORIZED,
      });
    }
    next();
  },

  requireRoomMemberOrCreator: async (req, res, next) => {
    const isMemberOrCreator =
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
      await shared.db.room.permissions.isMemberOrCreator(req.actor, req.room);
    if (!isMemberOrCreator) {
      return next({
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
        errorCode: shared.error.code.PERMISSION_DENIED,
        message: 'Insufficient permission',
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
        httpCode: shared.api.http.code.UNAUTHORIZED,
      });
    }
    next();
  },

  requireAdmin: async (req, res, next) => {
    if (!req.actor || !req.actor.admin) {
      return next({
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
        errorCode: shared.error.code.PERMISSION_DENIED,
        message: 'Insufficient permission',
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
        httpCode: shared.api.http.code.UNAUTHORIZED,
      });
    }
    next();
  },
};

module.exports = middleware;
