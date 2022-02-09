const nodemailer = require("nodemailer");
const ejs = require("ejs");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = `CapitalFX`;
  }

  newTransport() {
    // if (process.env.NODE_ENV === "production") {
      // Sendgrid
      // return nodemailer.createTransport({
      //   service: "SendGrid",
      //   auth: {
      //     user: process.env.SENDGRID_USERNAME,
      //     pass: process.env.SENDGRID_PASSWORD,
      //   },
      // });
    // }

    return nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        /* user: "715085e568736e",
        pass: "b6de80da926107", */
        user: "af2ace299994c8",
        pass: "a31ec4a964a3b5",
      },
    });
  }

  // Send the actual email
  async send(template,subject, data) {
    // 1) Render HTML based on a pug template
    const html = await ejs.renderFile(`${__dirname}/../views/${template}.ejs`, {
      firstName: this.firstName,
      url: this.url,
      data,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to capitalFX");
  }

  async sendPasswordReset() {
    await this.send("passwordReset", "Password Reset Request");
  }

  async newTransaction(data) {
    await this.send("newTransaction", "New Transaction ALert!", data);
  }

  async approvedWithdrawal(data) {
    await this.send("approvedWithdrawal", "Withdrawal Approved!", data);
  }
};
