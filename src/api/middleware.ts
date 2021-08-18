import { NextFunction, Request, Response } from 'express';

import db from '../db/_index';
import error from '../error/_error';
import auth from '../lib/auth';
import api from './_api';

const base64Decode = (str: string) =>
  Buffer.from(str, 'base64').toString('utf-8');

// extend the Express request to support our custom properties
declare module 'express' {
  interface Request {
    actor: any;
    session: any;
  }
}

const middleware = {
  getActor: async (req: Request, res: Response, next: NextFunction) => {
    // support Authorization header with a bearer token,
    // fallback to a `token` field on a POST body
    let authHeader = req.headers.authorization;
    if (!authHeader && req.headers.Authorization) {
      authHeader = Array.isArray(req.headers.Authorization)
        ? req.headers.Authorization[0]
        : req.headers.Authorization;
    }
    const token =
      authHeader && authHeader.startsWith('Bearer')
        ? base64Decode(authHeader.replace('Bearer ', ''))
        : null;
    if (!token) {
      return next();
    }
    const session = await auth.sessionFromToken(token);
    if (!session) {
      return next();
    }
    const actorId = session.actorId;
    const actor = await db.accounts.actorById(actorId);
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

  requireActor: async (req: Request, res: Response, next: NextFunction) => {
    if (!req.actor) {
      return next({
        errorCode: error.code.SESSION_REQUIRED,
        message: 'Must have a valid session',
        httpCode: api.http.code.UNAUTHORIZED,
      });
    }
    next();
  },

  roomFromRoute: async (req, res, next) => {
    const roomRoute = req.body.room_route || req.body.roomRoute;
    if (!roomRoute) {
      return next(
        {
          errorCode: error.code.INVALID_API_PARAMS,
          message: 'Must provide room_route',
        },
        api.http.code.BAD_REQUEST,
      );
    }
    req.room = await db.room.core.roomByRoute(roomRoute);
    next();
  },

  requireRoom: async (req, res, next) => {
    if (!req.room) {
      return next(
        { errorCode: error.code.UNKNOWN_ROOM, message: 'Unknown room' },
        api.http.code.BAD_REQUEST,
      );
    }
    next();
  },

  requireRoomCreator: async (req, res, next) => {
    if (req.actor.id != req.room.creatorId) {
      return next({
        errorCode: error.code.PERMISSION_DENIED,
        message: 'Insufficient permission',
        httpCode: api.http.code.UNAUTHORIZED,
      });
    }
    next();
  },

  requireRoomMember: async (req, res, next) => {
    const isMember = await db.room.permissions.isMember(req.user, req.room);
    if (!isMember) {
      return next({
        errorCode: error.code.PERMISSION_DENIED,
        message: 'Insufficient permission',
        httpCode: api.http.code.UNAUTHORIZED,
      });
    }
    next();
  },

  requireRoomMemberOrCreator: async (req, res, next) => {
    const isMemberOrCreator = await db.room.permissions.isMemberOrCreator(
      req.actor,
      req.room,
    );
    if (!isMemberOrCreator) {
      return next({
        errorCode: error.code.PERMISSION_DENIED,
        message: 'Insufficient permission',
        httpCode: api.http.code.UNAUTHORIZED,
      });
    }
    next();
  },

  requireAdmin: async (req, res, next) => {
    if (!req.actor || !req.actor.admin) {
      return next({
        errorCode: error.code.PERMISSION_DENIED,
        message: 'Insufficient permission',
        httpCode: api.http.code.UNAUTHORIZED,
      });
    }
    next();
  },
};

export default middleware;
