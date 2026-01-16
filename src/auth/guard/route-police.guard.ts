import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUEST_TOKEN_PAYLOAD_KEY, ROUTE_POLICE_KEY } from '../auth.constants';
import { RoutePolices } from '../enum/route-polices.enum';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class RoutePoliceGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const RoutePoliceRequired = this.reflector.get<RoutePolices | undefined>(
      ROUTE_POLICE_KEY,
      context.getHandler(),
    );

    if (!RoutePoliceRequired) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tokenPayload = request[REQUEST_TOKEN_PAYLOAD_KEY];

    if (!tokenPayload) {
      throw new UnauthorizedException(
        `Route need Permission ${RoutePoliceRequired}. User not logged in`,
      );
    }

    const { user }: { user: User } = tokenPayload;

    //if(!user.routePolicies.includes(RoutePoliceRequired)){
    //    throw new UnauthorizedException (`User dont have the ${RoutePoliceRequired} Permission`)
    //}

    return true;
  }
}
