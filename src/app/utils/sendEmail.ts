import nodemailer from 'nodemailer';
import config from '../config';

const sendEmail = async (to: string, otp: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: config.node_env === 'production',
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: 'shahadathossain.sh255@gmail.com',
      pass: 'qpyj pmsr tgds gdmm',
    },
  });

  await transporter.sendMail({
    from: 'M.I Trading <no-reply@mi-trading.com>', // sender address
    to, // list of receivers
    subject: 'Reset your pin within 10 minutes', // Subject line
    html: `<div>
            <p>Your OTP is: <strong>${otp}</strong></p>
            <p> Submit your OTP within 5 minutes. Click here <a href="${html}">Verify OTP</a></p>
        </div>`, // html body
  });
};

export default sendEmail;
