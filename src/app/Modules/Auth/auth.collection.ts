import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { authServices } from './auth.service';
import httpStatus from 'http-status';

const login = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await authServices.userLogin(payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Token send successfully',
    data: result,
  });
  return result;
});

const otpVerify = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await authServices.sendOtpVerify(payload);
  const { refreshToken } = result;
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.node_env === 'production',
  });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User is logged successfully',
    data: result,
  });
});

export const authCollections = {
  login,
  otpVerify,
};
