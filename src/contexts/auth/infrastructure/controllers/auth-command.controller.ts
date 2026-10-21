import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { LoginAuthDto } from '../../application/login-auth-use-case/login-auth.dto';
import { LoginAuthUseCase } from '../../application/login-auth-use-case/login-auth.use-case';
import { STATUS_OK } from 'src/common/constants/http.constant';
import { RefreshTokenAuthDto } from '../../application/refresh-token-auth-use-case/refresh-token-auth.dto';
import { RefreshTokenAuthUseCase } from '../../application/refresh-token-auth-use-case/refresh-token-auth.use-case';
import { RegisterAuthUseCase } from '../../application/register-auth-use-case/register-auth.use-case';
import { RegisterAuthUseDto } from '../../application/register-auth-use-case/register-auth.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { LoginGoogleAuthUseCase } from '../../application/login-google-auth-use-case/login-google-auth.use-case';
import { LoginGoogleAuthDto } from '../../application/login-google-auth-use-case/login-google-auth.dto';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { PassRecoveryStepOneAuthUseCase } from '../../application/pass-recovery-step-one-auth-use-case/pass-recovery-step-one-auth.use-case';
import { PassRecoveryStepTwoAuthUseCase } from '../../application/pass-recovery-step-two-auth-use-case/pass-recovery-step-two-auth.use-case';
import { PassRecoveryStepOneAuthDto } from '../../application/pass-recovery-step-one-auth-use-case/pass-recovery-step-one-auth.dto';
import { PassRecoveryStepTwoAuthDto } from '../../application/pass-recovery-step-two-auth-use-case/pass-recovery-step-two-auth.dto';
import { LogoutAuthDto } from '../../application/logout-auth-use-case/logout-auth.dto';
import { LogoutAuthUseCase } from '../../application/logout-auth-use-case/logout-auth.use-case';
import { IAuthCookieHelper } from 'src/common/libs/cookie-manager/auth-cookie.interface';

@ApiTags('Auth')
@Controller('auth')
@Throttle({ default: { limit: 5, ttl: 1000 } })
export class AuthCommandController {
    private client: OAuth2Client;
    private readonly googleClientId: string;

    constructor(
        private readonly config: ConfigService,
        private readonly authCookieHelper: IAuthCookieHelper,
        private readonly loginAuthUseCase: LoginAuthUseCase,
        private readonly loginGoogleAuthUseCase: LoginGoogleAuthUseCase,
        private readonly refreshTokenAuthUseCase: RefreshTokenAuthUseCase,
        private readonly registerAuthUseCase: RegisterAuthUseCase,
        private readonly passRecoveryStepOneAuthUseCase: PassRecoveryStepOneAuthUseCase,
        private readonly passRecoveryStepTwoAuthUseCase: PassRecoveryStepTwoAuthUseCase,
        private readonly logoutAuthUseCase: LogoutAuthUseCase,
    ) {
        this.googleClientId = this.config.get<string>('envs.googleClientId')!;
        this.client = new OAuth2Client(this.googleClientId);
    }

    /**************************************************** */
    /**************************************************** */
    @ApiOperation({ summary: 'Iniciar sesión de usuario' })
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() body: LoginAuthDto, @Res({ passthrough: true }) res: Response) {
        const data = await this.loginAuthUseCase.execute(body);
        const cookie = this.authCookieHelper.createRefreshTokenCookie(data.refreshToken);
        res.setHeader('Set-Cookie', cookie);
        return { status: STATUS_OK, message: 'Inicio de sesión', data: data };
    }

    /**************************************************** */
    /**************************************************** */
    @ApiOperation({ summary: 'Iniciar sesión con Google' })
    @Post('google')
    @HttpCode(HttpStatus.OK)
    async loginGoogle(@Body() body: LoginGoogleAuthDto, @Res({ passthrough: true }) res: Response) {
        const ticket = await this.client.verifyIdToken({
            idToken: body.token,
            audience: this.googleClientId,
        });

        const payload = ticket.getPayload();
        if (!payload)
            throw new UnauthorizedException('Ocurrio un error al recuperar la información del usuario desde google');

        const email = payload['email'];
        if (!email)
            throw new UnauthorizedException('Ocurrio un error al recuperar la información del usuario desde google');

        const name = payload['name'] || 'SN';

        body.name = name;

        body.email = email;

        body.expiration = payload.exp;

        const data = await this.loginGoogleAuthUseCase.execute(body);
        const cookie = this.authCookieHelper.createRefreshTokenCookie(data.refreshToken);
        res.setHeader('Set-Cookie', cookie);
        return { status: STATUS_OK, message: 'Inicio de sesión', data: data };
    }

    /**************************************************** */
    /**************************************************** */
    @ApiOperation({ summary: 'Refrescar token de acceso' })
    @Post('/refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() body: RefreshTokenAuthDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token = this.authCookieHelper.extractRefreshToken(req.headers.cookie) || body.refreshToken;
        if (!token) {
            throw new UnauthorizedException('No se proporcionó un token de refresco');
        }

        const data = await this.refreshTokenAuthUseCase.execute({ refreshToken: token });
        const cookie = this.authCookieHelper.createRefreshTokenCookie(data.refreshToken);
        res.setHeader('Set-Cookie', cookie);

        return {
            status: STATUS_OK,
            message: 'Inicio de sesión exitoso',
            data: data,
        };
    }

    /**************************************************** */
    /**************************************************** */
    @ApiOperation({ summary: 'Registrar usuario' })
    @Post('register')
    async register(@Body() body: RegisterAuthUseDto, @Res({ passthrough: true }) res: Response) {
        const data = await this.registerAuthUseCase.execute(body);
        const cookie = this.authCookieHelper.createRefreshTokenCookie(data.refreshToken);
        res.setHeader('Set-Cookie', cookie);
        return {
            status: STATUS_OK,
            message: 'Usuario creado correctamente',
            data: data,
        };
    }

    /**************************************************** */
    /**************************************************** */
    @ApiOperation({ summary: 'Recuperar contraseña Paso 1' })
    @Post('recover-pass-one')
    async passwordRecoveryOne(@Body() body: PassRecoveryStepOneAuthDto) {
        await this.passRecoveryStepOneAuthUseCase.execute(body);
        return { status: STATUS_OK, message: 'Correo enviado correctamente' };
    }

    /**************************************************** */
    /**************************************************** */
    @ApiOperation({ summary: 'Recuperar contraseña Paso 2' })
    @Post('recover-pass-two')
    async passwordRecoveryTwo(@Body() body: PassRecoveryStepTwoAuthDto) {
        await this.passRecoveryStepTwoAuthUseCase.execute(body);
        return {
            status: STATUS_OK,
            message: 'Contraseña actualizada correctamente',
        };
    }

    /**************************************************** */
    /**************************************************** */
    @ApiOperation({ summary: 'Cerrar sesión de usuario' })
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Body() body: LogoutAuthDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token = this.authCookieHelper.extractRefreshToken(req.headers.cookie) || body.refreshToken;
        const clearCookie = this.authCookieHelper.createClearRefreshTokenCookie();
        res.setHeader('Set-Cookie', clearCookie);

        if (token) {
            await this.logoutAuthUseCase.execute({ refreshToken: token });
        }

        return {
            status: STATUS_OK,
            message: 'Sesión cerrada correctamente',
        };
    }
}
