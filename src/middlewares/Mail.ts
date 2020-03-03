import * as nodemailer from 'nodemailer';

export default class Mail {
  private _transporter: nodemailer.Transporter;
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'twinode@gmail.com',
        pass: 'TwiNode95310'
      }
    });
  }
  sendMail(to: string, subject: string, content: string) {
    let options = {
      from: 'twinode@gmail.com',
      to: to,
      subject: subject,
      text: content
    }

    // verify connection configuration
    this._transporter.verify(function(error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log('Server is ready to take our messages');
      }
    });

    this._transporter.sendMail(
      options, (error, info) => {
        if (error) {
          return console.log(`${error}`);
        }
        console.log(`Message Sent ${info.response}`);
      });
  }
}
