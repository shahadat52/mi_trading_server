import AppError from '../../errors/appErrors';
import { UserModel } from '../User/user.model';
import httpStatus from 'http-status';
import config from '../../config';
import { createToken } from './auth.utils';
import { TLoginUser } from './auth.interface';
import sendEmail from '../../utils/sendEmail';
import { generateOTP } from '../../utils/generateOTP';

const userLogin = async (payload: TLoginUser) => {
  const { phone, password } = payload;
  const user = await UserModel.findOne({ phone }).select('+password');

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not available');
  }
  const isPasswordMatch = await UserModel.isPasswordMatch(password, user.password);
  if (!isPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'সঠিক পাসওয়ার্ড দিন');
  }

  const isDeleted = user.isDeleted;
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'ইউজার ডিলিট');
  }

  const status = user.status;
  if (status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'ইউজার ব্লক');
  }

  const otpSendingUiLink = `${config.client_side_url}/send-otp/${user.phone}`;
  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();

  await sendEmail(user.email, otp, otpSendingUiLink);

  return { otpSendingUiLink };
};

const sendOtpVerify = async ({ phone, otp }: { phone: string; otp: string }) => {
  const user = await UserModel.findOne({ phone });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if OTP exists
  if (!user.otp || !user.otpExpires) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP not generated');
  }

  const otpExpires = user.otpExpires as unknown as number;
  // Check if OTP expired
  if (otpExpires < Date.now()) {
    throw new AppError(httpStatus.GONE, 'OTP has expired');
  }

  // Check OTP match
  if (user.otp !== otp) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid OTP');
  }

  // ✅ Mark user as verified
  user.isVerified = true;
  user.otp = '';
  user.otpExpires = undefined;
  await user.save();

  // create access token for login session
  if (user.isVerified) {
    const jwtPayload = {
      _id: user._id,
      id: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
      name: user.name,
    };

    const accessToken = createToken(
      jwtPayload,
      config.secret_key as string,
      config.jwt_expireIn as string
    );

    const refreshToken = createToken(
      jwtPayload,
      config.refresh_key as string,
      config.refresh_token_expireIn as string
    );

    return { accessToken, refreshToken };
  }
  throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized Access');
};
export const authServices = {
  userLogin,
  sendOtpVerify,
};
