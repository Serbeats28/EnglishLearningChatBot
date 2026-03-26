require('dotenv').config()
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS
    },
})

const sendingEmail = async (email_address, otp_code) =>{
    try {
			const mailOptions = {
				from: `"English Learning Assistant" <EnglishLearningAssistant@gmail.com>`,
				to: email_address,
				subject: "Your Verification Code",
				html: `
					<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
						<h2>Verification Code</h2>
						<p>Your one-time password (OTP) is:</p>
						<h1 style="color: #4A90E2; letter-spacing: 5px;">${otp_code}</h1>
						<p>This code will expire in 10 minutes.</p>
					</div>
				`,
			}

			const result = await transporter.sendMail(mailOptions)
			if(result) return true
    } 
    catch (err) {
			console.log("sendingEmail: ", err.message)
    }
}

module.exports = {
    sendingEmail
}