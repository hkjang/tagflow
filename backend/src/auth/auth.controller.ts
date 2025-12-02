import { Controller, Post, Body, HttpException, HttpStatus, Get, UseGuards, Put, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest, UserRole } from '@shared/user';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginRequest) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Login failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    try {
      return await this.authService.refreshToken(refreshToken);
    } catch (error) {
      throw new HttpException(
        'Invalid refresh token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return await this.authService.getUserById(user.sub);
  }
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async getAllUsers() {
    return await this.authService.getAllUsers();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async createUser(
    @Body() body: { username: string; password: string; role: UserRole },
  ) {
    try {
      return await this.authService.createUser(
        body.username,
        body.password,
        body.role,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async updateUser(
    @Param('id') id: string,
    @Body() body: Partial<{ username: string; password: string; role: UserRole }>,
  ) {
    try {
      return await this.authService.updateUser(parseInt(id), body);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteUser(@Param('id') id: string) {
    try {
      await this.authService.deleteUser(parseInt(id));
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to delete user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
