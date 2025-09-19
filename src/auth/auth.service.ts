import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/auth/schemas/user.schema';
import mongoose, { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { ResetToken, ResetTokenDocument } from './schemas/reset-token.schema';
import { MailService } from 'src/services/mail.service';
import * as otpGenerator from 'otp-generator';
import { OAuth2Client } from 'google-auth-library';
import { ResetPasswordOtpDto } from './dtos/reset-password-otp';
import { ConfigService } from '@nestjs/config';
import { Permission } from 'src/decorators/role.schema';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name) private RefreshTokenModel: Model<RefreshToken>,
    @InjectModel(ResetToken.name) private ResetTokenModel: Model<ResetTokenDocument>,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {
    console.log('JWT_SECRET from env:', !!process.env.JWT_SECRET);
    console.log('JWT secret from config:', !!this.configService.get('jwt.secret'));
  }

  // Helper method to check if user is admin
  async checkAdminPermission(userId: string): Promise<boolean> {
    const user = await this.UserModel.findById(userId);
    return user && user.role === 'Admin';
  }

  async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
  
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google ID token');
      }
  
      const { sub, email, name, picture } = payload;
  
      const user = await this.findOrCreateUser({ sub, email, name, picture });
      if (!user) {
        throw new InternalServerErrorException('User could not be created or retrieved');
      }
  
      const tokens = await this.generateUserTokens(user._id);
  
      return {
        userId: user._id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      console.error('Error in verifyGoogleToken:', error);
      throw new InternalServerErrorException('Google token verification failed');
    }
  }

  private async findOrCreateUser({ sub, email, name, picture }: { sub: string, email: string, name: string, picture: string }) {
    try {
      let user = await this.UserModel.findOne({ email });
  
      if (!user) {
        // Generate a random password for Google users
        const randomPassword = uuidv4();
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // Create new user with required fields - using default values
        user = new this.UserModel({
          googleId: sub,
          email,
          nom: name,
          profilePicture: picture,
          motdepasse: hashedPassword,
          role: 'Employee', // Default role
          poste: 'Operator', // Default poste
          departement: 'Administration', // Default département
          otpVerified: true
        });
  
        await user.save();
      }
  
      return user;
    } catch (error) {
      console.error('Error in findOrCreateUser:', error);
      throw new InternalServerErrorException('Failed to find or create user');
    }
  }
    
  async forgotPassword(email: string) {
    try {
      const user = await this.UserModel.findOne({ email });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Delete any previous OTP tokens
      await this.ResetTokenModel.deleteMany({ userId: user._id });

      const otp = otpGenerator.generate(4, { 
        digits: true, 
        upperCaseAlphabets: false, 
        lowerCaseAlphabets: false, 
        specialChars: false 
      });
      
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1); // OTP expires in 1 hour

      // Save OTP to database first
      const resetToken = await this.ResetTokenModel.create({
        userId: user._id,
        otp,
        expiryDate,
        token: uuidv4(),
      });

      // Try to send email, but don't fail if it doesn't work
      try {
        await this.mailService.sendPasswordResetEmail(user.email, otp);
        console.log(`✅ Password reset email sent to ${user.email}`);
        
        return { 
          message: 'Password reset OTP sent to your email', 
          userId: user._id,
          success: true
        };
      } catch (emailError) {
        console.error('❌ Failed to send email, but OTP created:', emailError.message);
        
        // Return the OTP in development mode for testing
        if (process.env.NODE_ENV === 'development') {
          return { 
            message: 'Email service unavailable. OTP created for development testing.', 
            userId: user._id,
            otp: otp, // Only in development
            success: true,
            emailSent: false
          };
        }
        
        // In production, still return success but mention email issue
        return { 
          message: 'OTP generated. Please check your email or contact support if you don\'t receive it.', 
          userId: user._id,
          success: true,
          emailSent: false
        };
      }
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to process password reset request');
    }
  }

  async verifyOtp(userId: string, otp: string) {
    try {
      let user;
      if (Types.ObjectId.isValid(userId)) {
          user = await this.UserModel.findById(new Types.ObjectId(userId));
      } else {
          user = await this.UserModel.findOne({ email: userId });
      }

      if (!user) {
          throw new NotFoundException('User not found');
      }

      const resetToken = await this.ResetTokenModel.findOne({
          userId: user._id,
          otp,
          expiryDate: { $gt: new Date() },
      });

      if (!resetToken) {
          throw new BadRequestException('Invalid or expired OTP');
      }

      // Don't delete the token yet, keep it for password reset
      // await this.ResetTokenModel.deleteOne({ _id: resetToken._id });

      return { 
        message: 'OTP verified successfully. You can now reset your password.',
        success: true
      };
    } catch (error) {
      console.error('Error in verifyOtp:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to verify OTP');
    }
  }

  async changePassword(userId: string, ancienMotdepasse: string, nouveauMotdepasse: string) {
    try {
      const user = await this.UserModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const passwordMatch = await bcrypt.compare(ancienMotdepasse, user.motdepasse);
      if (!passwordMatch) {
        throw new BadRequestException('Ancien mot de passe incorrect');
      }

      if (nouveauMotdepasse === ancienMotdepasse) {
        throw new BadRequestException('Le nouveau mot de passe ne peut pas être identique à l\'ancien');
      }

      const hashedPassword = await bcrypt.hash(nouveauMotdepasse, 10);
      user.motdepasse = hashedPassword;
      await user.save();

      return { message: 'Mot de passe modifié avec succès' };
    } catch (error) {
      console.error('Error in changePassword:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to change password');
    }
  }

  async signup(signupData: SignupDto) {
    const { email, motdepasse, confirmMotdepasse, nom, role, poste, departement } = signupData;
  
    if (!email || !motdepasse || !confirmMotdepasse || !nom || !role || !poste || !departement) {
      throw new BadRequestException('Tous les champs sont obligatoires');
    }
  
    const emailInUse = await this.UserModel.findOne({ email }).lean();
    if (emailInUse) {
      throw new BadRequestException('Email déjà utilisé');
    }
  
    if (motdepasse !== confirmMotdepasse) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }
  
    const hashedPassword = await bcrypt.hash(motdepasse, 10);
  
    try {
      const newUser = await this.UserModel.create({
        nom,
        email,
        motdepasse: hashedPassword,
        role,
        poste,
        departement,
      });
  
      return {
        message: 'Utilisateur enregistré avec succès',
        userId: newUser._id.toString(),
      };
    } catch (error) {
      console.error('Error creating user:', error);
      if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Échec de l\'enregistrement de l\'utilisateur');
    }
  }

  async login(credentials: LoginDto) {
    try {
      const { email, motdepasse } = credentials;
      console.log('Login attempt for:', email);
      
      const user = await this.UserModel.findOne({ email });
      console.log('User found:', user ? 'Yes' : 'No');

      if (!user) throw new UnauthorizedException('Identifiants incorrects');

      const passwordMatch = await bcrypt.compare(motdepasse, user.motdepasse);
      console.log('Password match:', passwordMatch);

      if (!passwordMatch) throw new UnauthorizedException('Identifiants incorrects');

      if (!user.isActive) {
        throw new UnauthorizedException('Compte désactivé');
      }

      const tokens = await this.generateUserTokens(user._id);
      return {
        ...tokens,
        userId: user._id,
        user: {
          nom: user.nom,
          email: user.email,
          role: user.role,
          poste: user.poste,
          departement: user.departement,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async generateUserTokens(userId) {
    try {
      let jwtSecret = this.configService.get('jwt.secret') || process.env.JWT_SECRET;
      
      if (!jwtSecret) {
        console.error('JWT_SECRET is not defined in environment variables or config');
        throw new InternalServerErrorException('JWT configuration error');
      }

      console.log('JWT_SECRET found:', !!jwtSecret);
      
      const accessToken = this.jwtService.sign({ userId }, { 
        expiresIn: '10h',
        secret: jwtSecret
      });
      
      const refreshToken = uuidv4();

      await this.storeRefreshToken(refreshToken, userId);
      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('Error generating tokens:', error);
      throw new InternalServerErrorException('Failed to generate tokens');
    }
  }

  async storeRefreshToken(token: string, userId: string) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      { upsert: true }
    );
  }

  // Get user profile
  async getUserProfile(userId: string) {
    const user = await this.UserModel.findById(userId).select('-motdepasse');
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return user;
  }

  // Update user profile
  async updateUserProfile(userId: string, updateData: Partial<User>) {
    const allowedFields = ['nom', 'poste', 'departement'];
    const filteredData = {};
    
    allowedFields.forEach(field => {
      if (updateData[field]) {
        filteredData[field] = updateData[field];
      }
    });

    const user = await this.UserModel.findByIdAndUpdate(
      userId, 
      filteredData, 
      { new: true, runValidators: true }
    ).select('-motdepasse');

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return { message: 'Profil mis à jour avec succès', user };
  }
 
  async resetPassword(userIdOrEmail: string, resetPasswordDto: ResetPasswordOtpDto) {
    try {
      const { password } = resetPasswordDto;
    
      let user;
      if (Types.ObjectId.isValid(userIdOrEmail)) {
        user = await this.UserModel.findById(new Types.ObjectId(userIdOrEmail));
      } else {
        user = await this.UserModel.findOne({ email: userIdOrEmail });
      }
    
      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Verify that a valid OTP exists (optional additional security)
      const validToken = await this.ResetTokenModel.findOne({
        userId: user._id,
        expiryDate: { $gt: new Date() }
      });

      if (!validToken) {
        throw new BadRequestException('No valid reset token found. Please request a new password reset.');
      }
    
      const hashedPassword = await bcrypt.hash(password, 10);
    
      user.motdepasse = hashedPassword;
      await user.save();
    
      // Clean up all reset tokens for this user
      await this.ResetTokenModel.deleteMany({ userId: user._id });
    
      return { message: 'Mot de passe réinitialisé avec succès' };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  // Get all users (for admin) - ENHANCED VERSION
  async getAllUsers(page: number = 1, limit: number = 10, filters?: any, requestingUserId?: string) {
    try {
      // Check if requesting user is admin
      if (requestingUserId) {
        const isAdmin = await this.checkAdminPermission(requestingUserId);
        if (!isAdmin) {
          throw new ForbiddenException('Seuls les administrateurs peuvent accéder à cette fonctionnalité');
        }
      }

      const skip = (page - 1) * limit;
      const query = {};

      // Add filters
      if (filters?.role) query['role'] = filters.role;
      if (filters?.poste) query['poste'] = filters.poste;
      if (filters?.departement) query['departement'] = filters.departement;
      if (filters?.isActive !== undefined) query['isActive'] = filters.isActive;
      if (filters?.email) {
        query['email'] = { $regex: filters.email, $options: 'i' };
      }
      if (filters?.nom) {
        query['nom'] = { $regex: filters.nom, $options: 'i' };
      }

      // Get users with all their data (admin can see everything except passwords)
      const users = await this.UserModel.find(query)
        .select('-motdepasse') // Exclude only password
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await this.UserModel.countDocuments(query);

      return {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        filters: filters || {}
      };
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  // Toggle user status (activate/deactivate)
  async toggleUserStatus(userId: string, requestingUserId?: string) {
    try {
      // Check if requesting user is admin
      if (requestingUserId) {
        const isAdmin = await this.checkAdminPermission(requestingUserId);
        if (!isAdmin) {
          throw new ForbiddenException('Seuls les administrateurs peuvent modifier le statut des utilisateurs');
        }
      }

      const user = await this.UserModel.findById(userId);
      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Prevent admin from deactivating themselves
      if (userId === requestingUserId) {
        throw new BadRequestException('Vous ne pouvez pas désactiver votre propre compte');
      }

      user.isActive = !user.isActive;
      await user.save();

      return { 
        message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'} avec succès`,
        isActive: user.isActive,
        user: {
          id: user._id,
          nom: user.nom,
          email: user.email,
          isActive: user.isActive
        }
      };
    } catch (error) {
      console.error('Error in toggleUserStatus:', error);
      if (error instanceof NotFoundException || 
          error instanceof ForbiddenException || 
          error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to toggle user status');
    }
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const user = await this.UserModel.findById(userId).populate('roleId') as any;
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.roleId || typeof user.roleId === 'string') {
        return [];
      }

      if (user.roleId.permissions) {
        return user.roleId.permissions;
      }

      return [];
    } catch (error) {
      console.error('Error getting user permissions:', error);
      throw new InternalServerErrorException('Failed to retrieve user permissions');
    }
  }

  // Test email functionality
  async testEmail(): Promise<boolean> {
    return await this.mailService.testEmailConnection();
  }

  // ENHANCED UPDATE USER - Admin can update all fields
  async updateUser(userId: string, updateData: Partial<User>, requestingUserId?: string) {
    try {
      // Check if requesting user is admin
      let isAdmin = false;
      let isSelfUpdate = false;
      
      if (requestingUserId) {
        isAdmin = await this.checkAdminPermission(requestingUserId);
        isSelfUpdate = userId === requestingUserId;
      }

      // Define which fields can be updated
      const userFields = ['nom', 'poste', 'departement']; // Fields users can update themselves
      const adminOnlyFields = ['role', 'isActive', 'email']; // Fields only admins can update
      const allAllowedFields = [...userFields, ...adminOnlyFields];
      
      const filteredData = {};
      
      // Filter allowed fields based on permissions
      allAllowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          // Check permissions for admin-only fields
          if (adminOnlyFields.includes(field)) {
            if (!isAdmin) {
              throw new ForbiddenException(`Seuls les administrateurs peuvent modifier le champ: ${field}`);
            }
          }
          // For regular fields, both admin and self-update are allowed
          if (userFields.includes(field) || isAdmin) {
            filteredData[field] = updateData[field];
          }
        }
      });

      // Handle password update separately if provided
      if (updateData.motdepasse && isAdmin && !isSelfUpdate) {
        const hashedPassword = await bcrypt.hash(updateData.motdepasse, 10);
        filteredData['motdepasse'] = hashedPassword;
      }

      // If no valid fields to update
      if (Object.keys(filteredData).length === 0) {
        throw new BadRequestException('Aucun champ valide fourni pour la mise à jour');
      }

      // Check if user exists
      const existingUser = await this.UserModel.findById(userId);
      if (!existingUser) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Prevent admin from changing their own role or deactivating themselves
      if (isSelfUpdate && isAdmin) {
        if (filteredData['role'] && filteredData['role'] !== 'Admin') {
          throw new BadRequestException('Vous ne pouvez pas modifier votre propre rôle d\'administrateur');
        }
        if (filteredData['isActive'] === false) {
          throw new BadRequestException('Vous ne pouvez pas désactiver votre propre compte');
        }
      }

      // Check for email uniqueness if email is being updated
      if (filteredData['email'] && filteredData['email'] !== existingUser.email) {
        const emailExists = await this.UserModel.findOne({ 
          email: filteredData['email'],
          _id: { $ne: userId }
        });
        if (emailExists) {
          throw new BadRequestException('Cet email est déjà utilisé par un autre utilisateur');
        }
      }

      // Update user
      const updatedUser = await this.UserModel.findByIdAndUpdate(
        userId, 
        filteredData, 
        { new: true, runValidators: true }
      ).select('-motdepasse');

      if (!updatedUser) {
        throw new InternalServerErrorException('Échec de la mise à jour de l\'utilisateur');
      }

      return { 
        message: 'Utilisateur mis à jour avec succès', 
        user: updatedUser,
        updatedFields: Object.keys(filteredData)
      };
    } catch (error) {
      console.error('Error in updateUser:', error);
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException || 
          error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  // DELETE USER - Admin only
  async deleteUser(userId: string, requestingUserId?: string) {
    try {
      // Check if requesting user is admin
      if (requestingUserId) {
        const isAdmin = await this.checkAdminPermission(requestingUserId);
        if (!isAdmin) {
          throw new ForbiddenException('Seuls les administrateurs peuvent supprimer des utilisateurs');
        }
      }

      // Check if user exists
      const userToDelete = await this.UserModel.findById(userId);
      if (!userToDelete) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Prevent admin from deleting themselves
      if (userId === requestingUserId) {
        throw new BadRequestException('Vous ne pouvez pas supprimer votre propre compte');
      }

      // Delete related data
      await Promise.all([
        // Delete refresh tokens
        this.RefreshTokenModel.deleteMany({ userId }),
        // Delete reset tokens
        this.ResetTokenModel.deleteMany({ userId }),
        // Delete the user
        this.UserModel.findByIdAndDelete(userId)
      ]);

      return { 
        message: 'Utilisateur supprimé avec succès',
        deletedUser: {
          id: userToDelete._id,
          nom: userToDelete.nom,
          email: userToDelete.email
        }
      };
    } catch (error) {
      console.error('Error in deleteUser:', error);
      if (error instanceof NotFoundException || 
          error instanceof ForbiddenException || 
          error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  // GET SINGLE USER BY ID - Admin only
  async getUserById(userId: string, requestingUserId?: string) {
    try {
      // Check if requesting user is admin or requesting their own data
      if (requestingUserId) {
        const isAdmin = await this.checkAdminPermission(requestingUserId);
        const isSelfRequest = userId === requestingUserId;
        
        if (!isAdmin && !isSelfRequest) {
          throw new ForbiddenException('Vous n\'avez pas les permissions pour accéder à ces données');
        }
      }

      const user = await this.UserModel.findById(userId).select('-motdepasse');
      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      return {
        user,
        message: 'Utilisateur récupéré avec succès'
      };
    } catch (error) {
      console.error('Error in getUserById:', error);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get user');
    }
  }
}