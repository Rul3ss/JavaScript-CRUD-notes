import { Injectable } from "@nestjs/common";
import { LoginDTO } from "./dto/login.dto";

@Injectable()
export class AuthService{
    async login(loginDto: LoginDTO){
        return loginDto;
    }
}