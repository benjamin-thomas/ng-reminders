import {NextFunction, Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';

const _401_UNAUTHORIZED = StatusCodes.UNAUTHORIZED;

export const authenticated = (req: Request, res: Response, next: NextFunction) => {
  /*
   If the session cookie has expired, the express-session middleware won't return
   the userId at that point (even though the session may still exists in the database)
   */
  const validSession = req.session.userId;

  if (!validSession) {
    return res
      .status(_401_UNAUTHORIZED)
      .send();
  }

  next();
};
