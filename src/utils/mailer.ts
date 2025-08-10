import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ifeoluwaatere1@gmail.com',
    pass: 'fvsoaoffsybchfce',
  },
});
