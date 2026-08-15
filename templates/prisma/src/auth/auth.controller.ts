import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
// nestforge:feature:redis
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
// nestforge:feature:redis:end
import { Public } from '../common/decorators/public.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { OAuthProfile } from './strategies/google.strategy';

const TOKENS_EXAMPLE = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Cria uma nova conta' })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso', schema: { example: TOKENS_EXAMPLE } })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado', schema: { example: { statusCode: 409, message: 'E-mail já cadastrado' } } })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica e retorna access/refresh token' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso', schema: { example: TOKENS_EXAMPLE } })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas', schema: { example: { statusCode: 401, message: 'Credenciais inválidas' } } })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renova o access token usando o refresh token' })
  @ApiResponse({ status: 200, description: 'Novo par de tokens emitido', schema: { example: TOKENS_EXAMPLE } })
  @ApiResponse({ status: 401, description: 'Refresh token inválido, expirado ou já usado', schema: { example: { statusCode: 401, message: 'Refresh token inválido ou expirado' } } })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoga o refresh token informado' })
  @ApiResponse({ status: 200, description: 'Logout realizado', schema: { example: { message: 'Logout realizado com sucesso' } } })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  // nestforge:feature:redis
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envia um e-mail com instruções para redefinir a senha' })
  @ApiResponse({
    status: 200,
    description: 'Resposta genérica — sempre a mesma, exista ou não o e-mail (evita enumeração de contas)',
    schema: { example: { message: 'Se o e-mail existir, enviaremos instruções de redefinição de senha' } },
  })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redefine a senha usando o token recebido por e-mail' })
  @ApiResponse({ status: 200, description: 'Senha redefinida', schema: { example: { message: 'Senha redefinida com sucesso' } } })
  @ApiResponse({ status: 401, description: 'Token inválido, expirado ou já usado', schema: { example: { statusCode: 401, message: 'Token de redefinição inválido ou expirado' } } })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Confirma o e-mail usando o token recebido' })
  @ApiResponse({ status: 200, description: 'E-mail verificado', schema: { example: { message: 'E-mail verificado com sucesso' } } })
  @ApiResponse({ status: 401, description: 'Token inválido, expirado ou já usado', schema: { example: { statusCode: 401, message: 'Token de verificação inválido ou expirado' } } })
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
  // nestforge:feature:redis:end

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Inicia o login via Google (redireciona)' })
  googleLogin() {
    // o guard redireciona para o consentimento do Google; nada a fazer aqui
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiExcludeEndpoint()
  googleCallback(@Req() req: Request) {
    return this.authService.validateOAuthLogin(req.user as OAuthProfile);
  }

  @Public()
  @Get('github')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({ summary: 'Inicia o login via GitHub (redireciona)' })
  githubLogin() {
    // o guard redireciona para o consentimento do GitHub; nada a fazer aqui
  }

  @Public()
  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  @ApiExcludeEndpoint()
  githubCallback(@Req() req: Request) {
    return this.authService.validateOAuthLogin(req.user as OAuthProfile);
  }
}