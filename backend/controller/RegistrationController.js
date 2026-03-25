// const { executeQuery } = require('../helper/connection_helper')
// const { sendingEmail } = require('../helper/email_helper')
// const {hashingPassword} = require('../helper/bcrypt_helper')

// const RegistrationController = {
//     generateOTPCode: async (req, res) => {
// 			try {
// 				const user_email_address = req.body.email_address
// 				const otp_code = String(Math.floor(100000 + Math.random() * 900000))

// 				await executeQuery(res, async (client) =>{
// 					await client.query(`INSERT INTO otp(user_email_address, code) 
// 					VALUES($1, $2)`, [user_email_address, otp_code])
// 				})
// 				const emailSent = await sendingEmail(user_email_address, otp_code)

// 				if(!emailSent) throw new Error(`Can't send OTP code right now.`)
				
// 				return res.json({error_message: "", success_message: 'OTP code has sent successfully'})
// 			} 
// 			catch (err) {
// 				return res.json({error_message: err.message, success_message: ''})
// 			}
//     },
// 		verifyingOTPCode: async (req, res) => {
// 			try {
// 				const otp_code = req.query.code
// 				const expirationMinutes = 10

// 				await executeQuery(res, async(client) =>{
// 					const record = await client.query('SELECT id, created_at FROM otp WHERE code = $1 AND is_validated = FALSE', [otp_code])

// 					if(record.rows.length === 0) throw new Error('Invalid verification code.')
					
// 					const now = new Date()
// 					const createdTime = new Date(record.rows[0].created_at)
// 					const diffInMinutes = (now - createdTime) / (1000 * 60)

// 					if (diffInMinutes > expirationMinutes) throw new Error("Code has expired. Please request a new one.")
					
// 					const result = await client.query('UPDATE otp SET is_validated = true WHERE id = $1', [record.rows[0].id])
// 					if(result.rowCount == 0) throw new Error("Can't validate your OTP code right now")
					
// 					return res.json({error_message: '', is_otp_code_validated: true})
// 				})
// 			} 
// 			catch (err) {
// 				return res.json({error_message: err.message, is_otp_code_validated: false})
// 			}
// 		},
// 		registerUser: async (req, res) => {
// 			try {
// 				const {email, username, password} = req.body
// 				if(!email || !username || !password) throw new Error("All field are required.")
				
// 				await executeQuery(res, async(client)=>{
// 					const hashedPassword = await hashingPassword(password)
// 					if(!hashedPassword) throw new Error("Hashing password error")
					
// 					const result = await client.query(`INSERT INTO users(email, username, password)
// 					VALUES($1,$2,$3)`, [email, username, hashedPassword])

// 					if(result.rowCount == 0) throw new Error("Failed to registered.")
// 					return res.json({error_message: '', success_message: 'User has succesfully registered.'})
// 				})
// 			} 
// 			catch (err) {
// 				return res.json({error_message: err.message, success_message: ''})
// 			}
// 		}
// }

// module.exports = RegistrationController

const { executeQuery } = require('../helper/connection_helper')
const { sendingEmail } = require('../helper/email_helper')
const { hashingPassword } = require('../helper/bcrypt_helper')

const RegistrationController = {
    generateOTPCode: async (req, res) => {
        try {
            const user_email_address = req.body.email_address
            const otp_code = String(Math.floor(100000 + Math.random() * 900000))

            await executeQuery(res, async (supabase) => {
                const { error } = await supabase
                    .from('otp')
                    .insert({ 
                        user_email_address: user_email_address, 
                        code: otp_code 
                    })

                if (error) throw error
            })

            const emailSent = await sendingEmail(user_email_address, otp_code)
            if (!emailSent) throw new Error(`Can't send OTP code right now.`)
            
            return res.json({ error_message: "", success_message: 'OTP code has sent successfully' })
        } 
        catch (err) {
            return res.json({ error_message: err.message, success_message: '' })
        }
    },

    verifyingOTPCode: async (req, res) => {
        try {
            const otp_code = req.query.code
            const expirationMinutes = 10

            await executeQuery(res, async (supabase) => {
                // 1. Fetch the OTP record
                const { data: record, error } = await supabase
                    .from('otp')
                    .select('id, created_at')
                    .eq('code', otp_code)
                    .eq('is_validated', false)
                    .single()

                if (error || !record) throw new Error('Invalid verification code.')
                
                // 2. Check Expiration
                const now = new Date()
                const createdTime = new Date(record.created_at)
                const diffInMinutes = (now - createdTime) / (1000 * 60)

                if (diffInMinutes > expirationMinutes) {
                    throw new Error("Code has expired. Please request a new one.")
                }
                
                // 3. Update status to validated
                const { error: updateError } = await supabase
                    .from('otp')
                    .update({ is_validated: true })
                    .eq('id', record.id)

                if (updateError) throw new Error("Can't validate your OTP code right now")
                
                return res.json({ error_message: '', is_otp_code_validated: true })
            })
        } 
        catch (err) {
            return res.json({ error_message: err.message, is_otp_code_validated: false })
        }
    },

    registerUser: async (req, res) => {
        try {
            const { email, username, password } = req.body
            if (!email || !username || !password) throw new Error("All fields are required.")
            
            await executeQuery(res, async (supabase) => {
                const hashedPassword = await hashingPassword(password)
                if (!hashedPassword) throw new Error("Hashing password error")
                
                const { error } = await supabase
                    .from('users')
                    .insert({ 
                        email: email, 
                        username: username, 
                        password: hashedPassword 
                    })

                if (error) {
                    // Check for unique constraint violation (email already exists)
                    if (error.code === '23505') throw new Error("Email or Username already exists.")
                    throw error
                }

                return res.json({ error_message: '', success_message: 'User has successfully registered.' })
            })
        } 
        catch (err) {
            return res.json({ error_message: err.message, success_message: '' })
        }
    }
}

module.exports = RegistrationController