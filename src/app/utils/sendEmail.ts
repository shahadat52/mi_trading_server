// import nodemailer from 'nodemailer';
// import config from '../config';

// const sendEmail = async (to: string, html: string) => {
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: config.node_env === 'production',
//     auth: {
//       // TODO: replace `user` and `pass` values from <https://forwardemail.net>
//       user: 'shahadathossain.sh255@gmail.com',
//       pass: 'flnj glko xgdc dtal',
//     },
//   });

//   await transporter.sendMail({
//     from: 'shahadathossain.sh255@gmail.com', // sender address
//     to, // list of receivers
//     subject: 'Reset your pin within 10 minutes', // Subject line
//     text: '', // plain text body
//     html, // html body
//   });
// };

// export default sendEmail;
