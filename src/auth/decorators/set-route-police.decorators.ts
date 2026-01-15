import { SetMetadata } from "@nestjs/common"
import { ROUTE_POLICE_KEY } from "../auth.constants"
import { RoutePolices } from "../enum/route-polices.enum";

export const SetRoutePolicte = (policy: RoutePolices) => {
    return SetMetadata(ROUTE_POLICE_KEY, policy);
}