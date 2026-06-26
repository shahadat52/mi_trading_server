
import config from '../config';
import { Resend } from 'resend';
import AppError from '../errors/appErrors';
import httpStatus from 'http-status'

const resend = new Resend(config.resend_api_key);

export const sendEmail = async (
  to: string,
  otp: string,
  html: string
) => {
  try {
    const response = await resend.emails.send({
      from: 'M.I Trading <noreply@mitrading.shop>',
      to,
      subject: 'Submit your OTP within 4 minutes',
      html: `
        <div>
          <p>Your OTP is: <strong>${otp}</strong></p>

          <p>
            Submit your OTP within 4 minutes.
            Click here
            <a href="${html}">Verify OTP</a>
          </p>
        </div>
      `,
    });

    return response;
  } catch (error) {
    throw error;
  }
};



