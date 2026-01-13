import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { LoginDTO } from "./dto/login.dto";
import { Repository } from "typeorm";
import { User } from "src/user/entities/user.entity";
import { HashingService } from "./hashing/hashing.service";
import { InjectRepository } from "@nestjs/typeorm";
import jwtConfig from "./config/jwt.config";
import type { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService{
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository <User>,
        private readonly hashService: HashingService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly jwtService: JwtService,
    ){
    }



    async login(loginDto: LoginDTO){

        let passWordIsValid = false;
        let throwError = true;
        const user = await this.userRepository.findOneBy({
            email: loginDto.email,
        })

        if(user){
            passWordIsValid = await this.hashService.compare(
                loginDto.password,
                user.passwordHash
            )


        }

        if(passWordIsValid){
            throwError = false;
        }

        if(throwError){
            throw new UnauthorizedException('User invalid')
        }

        const acessToken = await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
        },{
            audience: this.jwtConfiguration.audience,
            issuer: this.jwtConfiguration.issue,
            secret: this.jwtConfiguration.secret,
            expiresIn: this.jwtConfiguration.ttl,
        })




        return {
            acessToken,
        };
    }
}