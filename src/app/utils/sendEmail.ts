import nodemailer from 'nodemailer';
import config from '../config';

const sendEmail = async (to: string, otp: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: `${config.send_email_app_email}`,
      pass: `${config.send_email_app_pass}`,
    },
  });

  await transporter.sendMail({
    from: 'M.I Trading <no-reply@mi-trading.com>', // sender address
    to, // list of receivers
    subject: 'Submit your OTP within 4 minutes', // Subject line
    html: `<div>
            <p>Your OTP is: <strong>${otp}</strong></p>
            <p> Submit your OTP within 4 minutes. Click here <a href="${html}">Verify OTP</a></p>
        </div>`, // html body
  });
};

export default sendEmail;
