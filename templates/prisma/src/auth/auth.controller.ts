import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
// nestforge:feature:swagger
import { ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
// nestforge:feature:swagger:end
import { Request } from 'express';
import { AuthService } from './auth.service';
// nestforge:feature:auth:password
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
// nestforge:feature:auth:token
import { RefreshTokenDto } from './dto/refresh-token.dto';
// nestforge:feature:auth:token:end
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
// nestforge:feature:redis,auth:password:end
import { Public } from '../common/decorators/public.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { OAuthProfile } from './strategies/google.strategy';
// nestforge:feature:auth:token
import { TokenService } from './token.service';
// nestforge:feature:auth:token:end

// nestforge:feature:swagger,auth:token
const TOKENS_EXAMPLE = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};
// nestforge:feature:swagger,auth:token:end

// nestforge:feature:swagger
@ApiTags('auth')
// nestforge:feature:swagger:end
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    // nestforge:feature:auth:token
    private readonly tokenService: TokenService,
    // nestforge:feature:auth:token:end
  ) { }

  // nestforge:feature:auth:token,auth:password
  @Public()
  @Post('register')
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Cria uma nova conta' })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso', schema: { example: TOKENS_EXAMPLE } })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado', schema: { example: { statusCode: 409, message: 'E-mail já cadastrado' } } })
  // nestforge:feature:swagger:end
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return this.tokenService.issueTokens(user.id, user.email, user.role);
  }

  // nestforge:feature:auth:token,auth:password
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Autentica e retorna access/refresh token' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso', schema: { example: TOKENS_EXAMPLE } })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas', schema: { example: { statusCode: 401, message: 'Credenciais inválidas' } } })
  // nestforge:feature:swagger:end
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.login(dto);
    return this.tokenService.issueTokens(user.id, user.email, user.role);
  }
  // nestforge:feature:auth:token,auth:password:end

  // nestforge:feature:auth:token
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Renova o access token usando o refresh token' })
  @ApiResponse({ status: 200, description: 'Novo par de tokens emitido', schema: { example: TOKENS_EXAMPLE } })
  @ApiResponse({ status: 401, description: 'Refresh token inválido, expirado ou já usado', schema: { example: { statusCode: 401, message: 'Refresh token inválido ou expirado' } } })
  // nestforge:feature:swagger:end
  refresh(@Body() dto: RefreshTokenDto) {
    return this.tokenService.refresh(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Revoga o refresh token informado' })
  @ApiResponse({ status: 200, description: 'Logout realizado', schema: { example: { message: 'Logout realizado com sucesso' } } })
  // nestforge:feature:swagger:end
  logout(@Body() dto: RefreshTokenDto) {
    return this.tokenService.logout(dto.refreshToken);
  }
  // nestforge:feature:auth:token:end

  // nestforge:feature:redis,auth:password
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Envia um e-mail com instruções para redefinir a senha' })
  @ApiResponse({
    status: 200,
    description: 'Resposta genérica — sempre a mesma, exista ou não o e-mail (evita enumeração de contas)',
    schema: { example: { message: 'Se o e-mail existir, enviaremos instruções de redefinição de senha' } },
  })
  // nestforge:feature:swagger:end
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Redefine a senha usando o token recebido por e-mail' })
  @ApiResponse({ status: 200, description: 'Senha redefinida', schema: { example: { message: 'Senha redefinida com sucesso' } } })
  @ApiResponse({ status: 401, description: 'Token inválido, expirado ou já usado', schema: { example: { statusCode: 401, message: 'Token de redefinição inválido ou expirado' } } })
  // nestforge:feature:swagger:end
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Public()
  @Get('verify-email')
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Confirma o e-mail usando o token recebido' })
  @ApiResponse({ status: 200, description: 'E-mail verificado', schema: { example: { message: 'E-mail verificado com sucesso' } } })
  @ApiResponse({ status: 401, description: 'Token inválido, expirado ou já usado', schema: { example: { statusCode: 401, message: 'Token de verificação inválido ou expirado' } } })
  // nestforge:feature:swagger:end
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
  // nestforge:feature:redis,auth:password:end

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Inicia o login via Google (redireciona)' })
  // nestforge:feature:swagger:end
  googleLogin() {
    // o guard redireciona para o consentimento do Google; nada a fazer aqui
  }

  // nestforge:feature:auth:token
  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  // nestforge:feature:swagger
  @ApiExcludeEndpoint()
  // nestforge:feature:swagger:end
  async googleCallback(@Req() req: Request) {
    const user = await this.authService.validateOAuthLogin(req.user as OAuthProfile);
    return this.tokenService.issueTokens(user.id, user.email, user.role);
  }
  // nestforge:feature:auth:token:end

  @Public()
  @Get('github')
  @UseGuards(GithubAuthGuard)
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Inicia o login via GitHub (redireciona)' })
  // nestforge:feature:swagger:end
  githubLogin() {
    // o guard redireciona para o consentimento do GitHub; nada a fazer aqui
  }

  // nestforge:feature:auth:token
  @Public()
  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  // nestforge:feature:swagger
  @ApiExcludeEndpoint()
  // nestforge:feature:swagger:end
  async githubCallback(@Req() req: Request) {
    const user = await this.authService.validateOAuthLogin(req.user as OAuthProfile);
    return this.tokenService.issueTokens(user.id, user.email, user.role);
  }
  // nestforge:feature:auth:token:end
}