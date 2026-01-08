import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export class SimpleMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.headers?.authorization) {
      req['user'] = {
        name: 'lucas',
        lastname: 'Castro',
        role: 'admin',
      };
    }
    res.setHeader('HEADERANDSHOUDER', 'OfMiddleware');

    next();

    res.on('finish', () => {});
  }
}
