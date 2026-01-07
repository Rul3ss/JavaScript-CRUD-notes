import { CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
import {  } from 'rxjs';


@Injectable()
export class AuthTokenInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext,next: CallHandler<any>,) {

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if(!token || token != '123456'){
      throw new UnauthorizedException('User not login')
    }

    console.log('token:', token);



    return next.handle();
  }
}
