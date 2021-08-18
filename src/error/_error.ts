// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'prisma'.
const prisma = require('../db/prisma');

const ERROR_CODES = {
  // General
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
  INVALID_API_PARAMS: 'INVALID_API_PARAMS',

  // Magic codes
  INVALID_CODE: 'INVALID_CODE',
  EXPIRED_CODE: 'EXPIRED_CODE',
  RESOLVED_CODE: 'RESOLVED_CODE',
  REVOKED_CODE: 'REVOKED_CODE',
  MAGIC_CODE_INVALID_ACTION: 'MAGIC_CODE_INVALID_ACTION',

  // Dealing with room logic
  JOIN_ALREADY_MEMBER: 'JOIN_ALREADY_MEMBER',
  TOO_MANY_OWNED_ROOMS: 'TOO_MANY_OWNED_ROOMS',
  ALREADY_INVITED: 'ALREADY_INVITED',
  UNKNOWN_ROOM: 'UNKNOWN_ROOM',
  INVALID_ROOM_CLAIM: 'INVALID_ROOM_CLAIM',
  UNAUTHORIZED_ROOM_ACCESS: 'UNAUTHORIZED_ROOM_ACCESS',
  ALREADY_CLAIMED: 'ALREADY_CLAIMED',
  INCORRECT_ROOM_PASSCODE: 'INCORRECT_ROOM_PASSCODE',
  INVALID_USER_IDENTITY: 'INVALID_USER_IDENTITY',

  // Account logic
  ALREADY_REGISTERED: 'ALREADY_REGISTERED',
  UNAUTHORIZED_USER: 'UNAUTHORIZED_USER',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  ADMIN_ONLY_RESTRICTED: 'ADMIN_ONLY_RESTRICTED',
  NO_SUCH_ACTOR: 'NO_SUCH_ACTOR',
  SESSION_REQUIRED: 'SESSION_REQUIRED',

  // generic errors
  NOT_FOUND: 'NOT_FOUND',

  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  OPENGRAPH_NO_DATA: 'NO_OPENGRAPH_DATA',
};

module.exports = {
  code: ERROR_CODES,
  report: (error, tag, actorId, httpCode, noodleCode) => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
    if (log && log.error) {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
      log.error.info(error);
    }
    return prisma.error.create({
      data: {
        actorId,
        stack: error.stack,
        message: error.message,
        tag,
        httpCode,
        noodleCode,
      },
    });
  },
};
