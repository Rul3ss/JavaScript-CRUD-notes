import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDTO } from "./dto/login.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";

@Controller('auth')
export class AuthController{
    constructor(
        
        private readonly authService: AuthService,
    ){}


    @Post()
    login(@Body() loginDto: LoginDTO){
        return this.authService.login(loginDto);
    }
}