import * as nodemailer from 'nodemailer';

export default class Mail {
  private _transporter: nodemailer.Transporter;
  constructor() {
    this._transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'evenspompe9593@gmail.com',
        pass:'92110Pompe'
    }
});
  }
  sendMail(to: string, subject: string, content: string) {
    let options = {
      from: 'evenspompe9593@gmail.com',
      to: to,
      subject: subject,
      text: content
    }

    this._transporter.sendMail(
      options, (error, info) => {
        if (error) {
          return console.log(`${error}`);
        }
        console.log(`Message Sent ${info.response}`);
      });
  }
}
