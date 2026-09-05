import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
// nestforge:feature:swagger
import { ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
// nestforge:feature:swagger:end
import { Request } from 'express';
import { AuthService } from './auth.service';
// nestforge:feature:auth:password
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
// nestforge:feature:auth:password:end
// nestforge:feature:auth:token
import { RefreshTokenDto } from './dto/refresh-token.dto';
// nestforge:feature:auth:token:end
// nestforge:feature:redis,auth:password
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
// nestforge:feature:auth:session
import { SessionService } from './session.service';
// nestforge:feature:auth:session:end

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
    // nestforge:feature:auth:session
    private readonly sessionService: SessionService,
    // nestforge:feature:auth:session:end
  ) { }

  // nestforge:feature:auth:session
  @Public()
  @Get('csrf-token')
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Issues a CSRF token bound to the session' })
  @ApiResponse({
    status: 200,
    description: 'CSRF token issued',
    schema: {
      example: {
        csrfToken: 'a1b2c3d4e5f6...',
      },
    },
  })
  // nestforge:feature:swagger:end
  getCsrfToken(@Req() request: Request) {
    return this.sessionService.issueCsrfToken(request);
  }
  // nestforge:feature:auth:session:end

  // nestforge:feature:auth:token,auth:password
  @Public()
  @Post('register')
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Creates a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully', schema: { example: TOKENS_EXAMPLE } })
  @ApiResponse({ status: 409, description: 'Email already registered', schema: { example: { statusCode: 409, message: 'Email already registered' } } })
  // nestforge:feature:swagger:end
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return this.tokenService.issueTokens(user.id, user.email, user.role);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Authenticates and returns access and refresh tokens' })
  @ApiResponse({ status: 200, description: 'Login completed successfully', schema: { example: TOKENS_EXAMPLE } })
  @ApiResponse({ status: 401, description: 'Invalid credentials', schema: { example: { statusCode: 401, message: 'Invalid credentials' } } })
  // nestforge:feature:swagger:end
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.login(dto);
    return this.tokenService.issueTokens(user.id, user.email, user.role);
  }
  // nestforge:feature:auth:token,auth:password:end

  // nestforge:feature:auth:session
  @Public()
  @Post('register')
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Creates an account and starts a session' })
  @ApiResponse({ status: 201, description: 'Account created and session started' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  // nestforge:feature:swagger:end
  async registerWithSession(
    @Body() dto: RegisterDto,
    @Req() request: Request,
  ) {
    const user = await this.authService.register(dto);
    return this.sessionService.establish(request, user);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Authenticates and starts a cookie-based session' })
  @ApiResponse({ status: 200, description: 'Session started successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  // nestforge:feature:swagger:end
  async loginWithSession(
    @Body() dto: LoginDto,
    @Req() request: Request,
  ) {
    const user = await this.authService.login(dto);
    return this.sessionService.establish(request, user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Ends the current session' })
  @ApiResponse({ status: 200, description: 'Session ended successfully' })
  // nestforge:feature:swagger:end
  logoutSession(@Req() request: Request) {
    return this.sessionService.destroy(request);
  }
  // nestforge:feature:auth:session:end

  // nestforge:feature:auth:token
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Renews the access token using the refresh token' })
  @ApiResponse({ status: 200, description: 'New token pair issued', schema: { example: TOKENS_EXAMPLE } })
  @ApiResponse({ status: 401, description: 'Invalid, expired, or already used refresh token', schema: { example: { statusCode: 401, message: 'Invalid or expired refresh token' } } })
  // nestforge:feature:swagger:end
  refresh(@Body() dto: RefreshTokenDto) {
    return this.tokenService.refresh(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Revokes the provided refresh token' })
  @ApiResponse({ status: 200, description: 'Logout completed', schema: { example: { message: 'Logout completed successfully' } } })
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
  @ApiOperation({ summary: 'Sends an email with password reset instructions' })
  @ApiResponse({
    status: 200,
    description: 'Generic response — always the same whether the email exists or not (prevents account enumeration)',
    schema: { example: { message: 'If the email exists, password reset instructions will be sent' } },
  })
  // nestforge:feature:swagger:end
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Resets the password using the token received by email' })
  @ApiResponse({ status: 200, description: 'Password reset', schema: { example: { message: 'Password reset successfully' } } })
  @ApiResponse({ status: 401, description: 'Invalid, expired, or already used token', schema: { example: { statusCode: 401, message: 'Invalid or expired password reset token' } } })
  // nestforge:feature:swagger:end
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Public()
  @Get('verify-email')
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Verifies the email using the received token' })
  @ApiResponse({ status: 200, description: 'Email verified', schema: { example: { message: 'Email verified successfully' } } })
  @ApiResponse({ status: 401, description: 'Invalid, expired, or already used token', schema: { example: { statusCode: 401, message: 'Invalid or expired verification token' } } })
  // nestforge:feature:swagger:end
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
  // nestforge:feature:redis,auth:password:end

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Starts Google login (redirects)' })
  // nestforge:feature:swagger:end
  googleLogin() {
    // The guard redirects to Google's consent screen; nothing to do here.
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

  // nestforge:feature:auth:session
  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  // nestforge:feature:swagger
  @ApiExcludeEndpoint()
  // nestforge:feature:swagger:end
  async googleSessionCallback(@Req() request: Request) {
    const user = await this.authService.validateOAuthLogin(
      request.user as OAuthProfile,
    );

    return this.sessionService.establish(request, user);
  }
  // nestforge:feature:auth:session:end

  @Public()
  @Get('github')
  @UseGuards(GithubAuthGuard)
  // nestforge:feature:swagger
  @ApiOperation({ summary: 'Starts GitHub login (redirects)' })
  // nestforge:feature:swagger:end
  githubLogin() {
    // The guard redirects to GitHub's consent screen; nothing to do here.
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

  // nestforge:feature:auth:session
  @Public()
  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  // nestforge:feature:swagger
  @ApiExcludeEndpoint()
  // nestforge:feature:swagger:end
  async githubSessionCallback(@Req() request: Request) {
    const user = await this.authService.validateOAuthLogin(
      request.user as OAuthProfile,
    );

    return this.sessionService.establish(request, user);
  }
  // nestforge:feature:auth:session:end
}
