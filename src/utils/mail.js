import Mailgen from "mailgen"
import nodemailer from "nodemailer"

const sendEmail = async function (options) {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Projecta",
      link: "https://projecta.vercel.app",
    },
  })
  const emailTextual = mailGenerator.generatePlaintext(options.MailgenContent)
  const emailHtml = mailGenerator.generate(options.MailgenContent)
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  })

  const mail = {
    from: process.env.MAILTRAP_SMTP_USER,
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  }
  try {
    await transporter.sendMail(mail)
  } catch (error) {
    console.error(
      "Error sending email May be due to credentials in .env file",
      error,
    )
  }
}

const emailVerficationMailgenContent = function (username, verificationURL) {
  const email = {
    body: {
      name: username,
      intro: "Welcome to Projecta! We're very excited to have you on board.",
      action: {
        instructions: "To get started with your account, please click here:",
        button: {
          color: "#22BC66",
          text: "Confirm your email",
          link: verificationURL,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  }
}

const passwordResetMailgenContent = function (username, passwordResetURL) {
  const email = {
    body: {
      name: username,
      intro:
        "You have received this email because a password reset request for your account was received. If you did not make this request, please ignore this email.",
      action: {
        instructions: "To reset your password, please click here:",
        button: {
          color: "#22aabc",
          text: "Reset your password",
          link: passwordResetURL,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  }
}

export {
  emailVerficationMailgenContent,
  passwordResetMailgenContent,
  sendEmail,
}
