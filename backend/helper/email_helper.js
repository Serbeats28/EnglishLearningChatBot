require('dotenv').config()
const { Resend } = require('resend')

const resend =  new Resend(process.env.RESEND_API_KEY)
const sendingEmail = async (email_address, otp_code) =>{
    try {
			const mailOptions = {
				from: `English Learning Assistant <onboarding@resend.dev>`,
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

			const result = await resend.emails.send(mailOptions)
			return !!result
    } 
    catch (err) {
			console.log("sendingEmail: ", err.message)
			return false 
    }
}

module.exports = {
    sendingEmail
}