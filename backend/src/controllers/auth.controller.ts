import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel, User, UserRole } from '../models/user.model.js';
import { OtpVerificationModel } from '../models/otp.model.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../middleware/error.middleware.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { sendOtpEmail } from '../utils/email.js';

// Helper to remove sensitive password hash and format safe user response
function sanitizeUser(userDoc: any): Partial<User> {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  const { passwordHash, ...safeUser } = user;
  const firstName = safeUser.firstName || '';
  const lastName = safeUser.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || safeUser.name || 'User';

  return {
    ...safeUser,
    id: safeUser.id || safeUser._id?.toString?.(),
    firstName,
    lastName,
    name: fullName,
    role: safeUser.role as UserRole,
    phone: safeUser.phone || undefined,
    address: safeUser.address || undefined,
    city: safeUser.city || undefined,
    district: safeUser.district || undefined,
    avatar: safeUser.avatar || undefined,
    is_active: safeUser.isActive ?? true,
    created_at: safeUser.createdAt?.toISOString?.() || safeUser.createdAt,
    updated_at: safeUser.updatedAt?.toISOString?.() || safeUser.updatedAt,
  };
}

// Public: Request Registration OTP (Stores pending user data & sends OTP)
export async function sendRegistrationOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { firstName, lastName, name, email, phone, phoneNumber, password, address, city, district } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const fName = (firstName || name?.split(' ')?.[0] || '').trim();
    const lName = (lastName || name?.split(' ')?.slice(1).join(' ') || '').trim();
    const fullName = `${fName} ${lName}`.trim();
    const cleanPhone = (phone || phoneNumber || '')?.trim() || null;

    // Check if user is already registered
    const existing = await UserModel.findOne({ email: normalizedEmail });

    if (existing) {
      throw new AppError('An account with this email address already exists. Please sign in instead.', 409);
    }

    // Hash password for secure temporary storage in pending verification record
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 8);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any older OTPs for this email and registration purpose
    await OtpVerificationModel.deleteMany({
      email: normalizedEmail,
      purpose: 'REGISTRATION',
    });

    // Save new OTP record with pending user registration payload
    await OtpVerificationModel.create({
      email: normalizedEmail,
      otpHash,
      purpose: 'REGISTRATION',
      payload: {
        firstName: fName,
        lastName: lName,
        name: fullName,
        phone: cleanPhone,
        passwordHash,
        address: address?.trim() || null,
        city: city?.trim() || null,
        district: district?.trim() || null,
      },
      expiresAt,
    });

    // Send email with OTP
    await sendOtpEmail({
      to: normalizedEmail,
      name: fullName,
      otp,
      expiresInMinutes: 10,
    });

    res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}.`,
      data: {
        email: normalizedEmail,
        expiresInSeconds: 600,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Public: Resend Registration OTP (Preserves pending registration details)
export async function resendRegistrationOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user is already registered
    const existing = await UserModel.findOne({ email: normalizedEmail });

    if (existing) {
      throw new AppError('An account with this email address already exists. Please sign in instead.', 409);
    }

    // Check existing pending OTP registration record
    const existingOtp = await OtpVerificationModel.findOne({
      email: normalizedEmail,
      purpose: 'REGISTRATION',
    }).sort({ createdAt: -1 });

    if (!existingOtp) {
      throw new AppError('No pending registration found for this email. Please submit your registration details again.', 400);
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 8);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete older OTP records
    await OtpVerificationModel.deleteMany({
      email: normalizedEmail,
      purpose: 'REGISTRATION',
    });

    // Save with preserved payload
    await OtpVerificationModel.create({
      email: normalizedEmail,
      otpHash,
      purpose: 'REGISTRATION',
      payload: existingOtp.payload ?? undefined,
      expiresAt,
    });

    const payloadObj = (existingOtp.payload as any) || {};
    const recipientName = payloadObj.name || `${payloadObj.firstName || ''} ${payloadObj.lastName || ''}`.trim() || 'Valued Customer';

    // Send email with new OTP
    await sendOtpEmail({
      to: normalizedEmail,
      name: recipientName,
      otp,
      expiresInMinutes: 10,
    });

    res.status(200).json({
      success: true,
      message: `A new 6-digit verification code has been sent to ${normalizedEmail}.`,
      data: {
        email: normalizedEmail,
        expiresInSeconds: 600,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Public: Verify Registration OTP (Verifies OTP & saves user to database)
export async function verifyRegistrationOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    const otpRecord = await OtpVerificationModel.findOne({
      email: normalizedEmail,
      purpose: 'REGISTRATION',
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new AppError('No pending registration found for this email. Please request a new code.', 400);
    }

    if (new Date() > otpRecord.expiresAt) {
      await OtpVerificationModel.deleteMany({
        email: normalizedEmail,
        purpose: 'REGISTRATION',
      });
      throw new AppError('The verification code has expired. Please request a new one.', 400);
    }

    const isValid = await bcrypt.compare(cleanOtp, otpRecord.otpHash);
    if (!isValid) {
      throw new AppError('The verification code entered is incorrect. Please try again.', 400);
    }

    // Check if user is already registered in the meantime
    const existingUser = await UserModel.findOne({ email: normalizedEmail });

    if (existingUser) {
      throw new AppError('An account with this email address already exists. Please sign in.', 409);
    }

    const payload = (otpRecord.payload as any) || {};
    if (!payload.passwordHash) {
      throw new AppError('Registration details are missing or expired. Please submit your registration details again.', 400);
    }

    const firstName = (payload.firstName || payload.name?.split(' ')?.[0] || 'Customer').trim();
    const lastName = (payload.lastName || payload.name?.split(' ')?.slice(1).join(' ') || '').trim();

    // Persist new user in database
    const user = await UserModel.create({
      firstName,
      lastName,
      email: normalizedEmail,
      passwordHash: payload.passwordHash,
      role: 'CUSTOMER',
      phone: payload.phone || null,
      address: payload.address || null,
      city: payload.city || null,
      district: payload.district || null,
      isActive: true,
    });

    // Invalidate used OTP verification records
    await OtpVerificationModel.deleteMany({
      email: normalizedEmail,
      purpose: 'REGISTRATION',
    });

    // Generate JWT token for auto-login
    const token = signToken({
      userId: user.id || user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Account successfully verified and registered.',
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (err) {
    next(err);
  }
}

// Public: Request Forgot Password OTP
export async function sendForgotPasswordOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Verify account exists
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      throw new AppError('No account found with this email address.', 404);
    }

    if (!user.isActive) {
      throw new AppError('This account has been deactivated. Please contact support.', 403);
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 8);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any existing password reset OTPs for this email
    await OtpVerificationModel.deleteMany({
      email: normalizedEmail,
      purpose: 'PASSWORD_RESET',
    });

    // Create new password reset OTP record
    await OtpVerificationModel.create({
      email: normalizedEmail,
      otpHash,
      purpose: 'PASSWORD_RESET',
      expiresAt,
    });

    const userFullName = `${user.firstName} ${user.lastName}`.trim() || 'Valued Client';

    // Send password reset email
    await sendOtpEmail({
      to: normalizedEmail,
      name: userFullName,
      otp,
      purpose: 'Password Reset',
      expiresInMinutes: 10,
    });

    res.status(200).json({
      success: true,
      message: `A 6-digit password reset verification code has been sent to ${normalizedEmail}.`,
      data: {
        email: normalizedEmail,
        expiresInSeconds: 600,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Public: Resend Forgot Password OTP
export async function resendForgotPasswordOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  return sendForgotPasswordOtp(req, res, next);
}

// Public: Verify Forgot Password OTP & Reset Password
export async function verifyForgotPasswordOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, otp, newPassword, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();
    const targetNewPassword = newPassword || password;

    const otpRecord = await OtpVerificationModel.findOne({
      email: normalizedEmail,
      purpose: 'PASSWORD_RESET',
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new AppError('No password reset request found for this email. Please request a new code.', 400);
    }

    if (new Date() > otpRecord.expiresAt) {
      await OtpVerificationModel.deleteMany({
        email: normalizedEmail,
        purpose: 'PASSWORD_RESET',
      });
      throw new AppError('The verification code has expired. Please request a new one.', 400);
    }

    const isValid = await bcrypt.compare(cleanOtp, otpRecord.otpHash);
    if (!isValid) {
      throw new AppError('The verification code entered is incorrect. Please try again.', 400);
    }

    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    // If a new password is provided, reset the password immediately
    if (targetNewPassword) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(targetNewPassword, saltRounds);

      user.passwordHash = passwordHash;
      await user.save();

      // Clear used OTP record
      await OtpVerificationModel.deleteMany({
        email: normalizedEmail,
        purpose: 'PASSWORD_RESET',
      });

      res.status(200).json({
        success: true,
        message: 'Your password has been successfully reset. You can now sign in with your new password.',
        data: {
          email: normalizedEmail,
          reset: true,
        },
      });
      return;
    }

    // Otherwise, confirm the OTP is valid for the reset step
    res.status(200).json({
      success: true,
      message: 'Verification code confirmed. You may now choose a new password.',
      data: {
        email: normalizedEmail,
        verified: true,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Public: Login (Customers & Admins)
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (!user.isActive) {
      throw new AppError('This account has been deactivated. Please contact support.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = signToken({
      userId: user.id || user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`.trim(),
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (err) {
    next(err);
  }
}

// Authenticated: Get Current User Profile
export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    const user = await UserModel.findById(req.user.userId);

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    res.status(200).json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

// Authenticated: Update Profile
export async function updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    const { firstName, lastName, name, phone, address, city, district, avatar } = req.body;
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (name !== undefined && firstName === undefined && lastName === undefined) {
      const parts = name.trim().split(' ');
      updateData.firstName = parts[0];
      updateData.lastName = parts.slice(1).join(' ') || '';
    }
    if (phone !== undefined) updateData.phone = phone.trim();
    if (address !== undefined) updateData.address = address.trim();
    if (city !== undefined) updateData.city = city.trim();
    if (district !== undefined) updateData.district = district.trim();
    if (avatar !== undefined) updateData.avatar = avatar.trim();

    const updatedUser = await UserModel.findByIdAndUpdate(req.user.userId, { $set: updateData }, { new: true });

    if (!updatedUser) {
      throw new AppError('User not found.', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: sanitizeUser(updatedUser),
    });
  } catch (err) {
    next(err);
  }
}

// Authenticated: Change Password
export async function changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    const user = await UserModel.findById(req.user.userId);

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Current password is incorrect.', 400);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    user.passwordHash = passwordHash;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (err) {
    next(err);
  }
}
