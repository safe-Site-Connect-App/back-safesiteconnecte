import { Body, Controller, Get, Param, Post, Put, Req, UseGuards, Query, Patch, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { VerifyOtpDto } from 'src/auth/dtos/VerifyOtpDto';
import { ResetPasswordOtpDto } from './dtos/reset-password-otp';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { UpdateUserDto } from './dtos/update-user.dto';

@ApiTags('Auth') // Group all authentication endpoints in Swagger
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async signUp(@Body() signupData: SignupDto) {
    return this.authService.signup(signupData);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login to the application' })
  @ApiResponse({ status: 200, description: 'Login successful, token returned.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }

  @Post('google-signin')
  @ApiOperation({ summary: 'Sign in using Google' })
  @ApiResponse({ status: 200, description: 'Google sign-in successful.' })
  @ApiResponse({ status: 400, description: 'Google sign-in failed.' })
  async googleSignIn(@Body() body: { idToken: string }) {
    const { idToken } = body;
    try {
      const sessionData = await this.authService.verifyGoogleToken(idToken);
      return {
        message: 'Google sign-in successful',
        ...sessionData,
      };
    } catch (error) {
      return {
        message: 'Google sign-in failed',
        error: error.message,
      };
    }
  }

  @UseGuards(AuthenticationGuard)
  @Put('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change the password' })
  @ApiResponse({ status: 200, description: 'Password successfully changed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized or session expired.' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
  ) {
    const userId = req.userId; // Extracted from the JWT token
    return this.authService.changePassword(
      userId,
      changePasswordDto.ancienMotdepasse,
      changePasswordDto.nouveauMotdepasse,
    );
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send an email to reset the password' })
  @ApiResponse({ status: 200, description: 'Email sent successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      const response = await this.authService.forgotPassword(forgotPasswordDto.email);
      return response; // Includes userId in the response
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  @Post('verify-otp/:userId')
  @ApiOperation({ summary: 'Verify OTP for password reset' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or incomplete data.' })
  async verifyOtp(@Param('userId') userId: string, @Body() verifyOtpDto: VerifyOtpDto) {
    const { otp } = verifyOtpDto;
    return this.authService.verifyOtp(userId, otp); // Verifies OTP, returns success or failure
  }

  @Post('reset-password/:userId')
  @ApiOperation({ summary: 'Reset the password using OTP' })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async resetPassword(
    @Param('userId') userId: string,
    @Body() resetPasswordDto: ResetPasswordOtpDto,
  ) {
    return this.authService.resetPassword(userId, resetPasswordDto); // Resets the password
  }

  // Endpoint de test pour vérifier la configuration email
  @Get('test-email')
  @ApiOperation({ summary: 'Test email configuration' })
  @ApiResponse({ status: 200, description: 'Email configuration test result.' })
  async testEmail() {
    try {
      const isWorking = await this.authService.testEmail();
      return {
        success: isWorking,
        message: isWorking ? 'Email configuration is working' : 'Email configuration has issues'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Email configuration test failed',
        error: error.message
      };
    }
  }

  // Get current user profile
  @UseGuards(AuthenticationGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(@Req() req) {
    const userId = req.userId;
    return this.authService.getUserProfile(userId);
  }

  // Update current user's profile (self-update)
 @UseGuards(AuthenticationGuard)
@Put('profile')
@ApiBearerAuth()
@ApiOperation({ summary: 'Update current user profile' })
@ApiResponse({ status: 200, description: 'Profile updated successfully.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({ status: 400, description: 'Invalid input data.' })
async updateProfile(
  @Body() updateData: UpdateUserDto,
  @Req() req,
) {
  const userId = req.userId;
  return this.authService.updateUserProfile(userId, updateData); // Use new method
}
  // ========== ADMIN ENDPOINTS ==========

  // Get all users with pagination and filters (admin only)
  @UseGuards(AuthenticationGuard)
  @Get('admin/users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with pagination and filters (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required.' })
  async getAllUsers(
    @Req() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('role') role?: string,
    @Query('poste') poste?: string,
    @Query('departement') departement?: string,
    @Query('isActive') isActive?: boolean,
    @Query('email') email?: string,
    @Query('nom') nom?: string,
  ) {
    const requestingUserId = req.userId;
    const filters = { role, poste, departement, isActive, email, nom };
    return this.authService.getAllUsers(page, limit, filters, requestingUserId);
  }

  // Get single user by ID (admin only or self)
  @UseGuards(AuthenticationGuard)
  @Get('admin/users/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID (Admin only or self)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUserById(
    @Param('userId') userId: string,
    @Req() req,
  ) {
    const requestingUserId = req.userId;
    return this.authService.getUserById(userId, requestingUserId);
  }

  // Update any user (admin only)
  @UseGuards(AuthenticationGuard)
  @Patch('admin/users/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update any user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateData: UpdateUserDto,
    @Req() req,
  ) {
    const requestingUserId = req.userId; // From JWT token
    return this.authService.updateUser(userId, updateData, requestingUserId);
  }

  // Delete user (admin only)
  @UseGuards(AuthenticationGuard)
  @Delete('admin/users/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Cannot delete own account.' })
  async deleteUser(
    @Param('userId') userId: string,
    @Req() req,
  ) {
    const requestingUserId = req.userId;
    return this.authService.deleteUser(userId, requestingUserId);
  }

  // Toggle user status (admin only)
  @UseGuards(AuthenticationGuard)
  @Patch('admin/users/:userId/toggle-status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle user active status (Admin only)' })
  @ApiResponse({ status: 200, description: 'User status toggled successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Cannot deactivate own account.' })
  async toggleUserStatus(
    @Param('userId') userId: string,
    @Req() req,
  ) {
    const requestingUserId = req.userId;
    return this.authService.toggleUserStatus(userId, requestingUserId);
  }

  // ========== LEGACY ENDPOINTS (for backward compatibility) ==========

  @UseGuards(AuthenticationGuard)
  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Legacy - redirects to admin endpoint)' })
  async getAllUsersLegacy(@Req() req, @Query() query) {
    // Redirect to admin endpoint for backward compatibility
    return this.getAllUsers(req, query.page, query.limit, query.role, query.poste, query.departement, query.isActive, query.email, query.nom);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('users/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user (Legacy - redirects to admin endpoint)' })
  async updateUserLegacy(@Param('userId') userId: string, @Body() updateData: UpdateUserDto, @Req() req) {
    // Redirect to admin endpoint for backward compatibility
    return this.updateUser(userId, updateData, req);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('users/:userId/toggle-status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle user status (Legacy - redirects to admin endpoint)' })
  async toggleUserStatusLegacy(@Param('userId') userId: string, @Req() req) {
    // Redirect to admin endpoint for backward compatibility
    return this.toggleUserStatus(userId, req);
  }
}