// const { executeQuery } = require('../helper/connection_helper')
// const {loginUser} = require('../helper/bcrypt_helper')
// const LoginController = {
//   userLogin: async (req, res) => {
// 		try {
// 			const {username, password} = req.body
// 			await executeQuery(res, async(client) =>{
// 				const record = await client.query('SELECT unique_uid, username, password FROM users WHERE username = $1', [username])
// 				if(record.rows.length === 0) throw new Error("The email you provide does not exist.")
// 				const passwordMatched = await loginUser(password, record.rows[0].password)
// 				if(!passwordMatched) throw new Error("Incorrect password")
// 				const userCreds = record.rows[0] 
// 				delete userCreds.password
// 				return res.json({error_message: '', isLoggedIn: true, userCreds: userCreds})
// 			})
// 		} 
// 		catch (err) {
// 			return res.json({error_message: err.message, isLoggedIn: false})
// 		}
// 	}
// }

// module.exports = LoginController

const { executeQuery } = require('../helper/connection_helper')
const { loginUser } = require('../helper/bcrypt_helper')

const LoginController = {
    userLogin: async (req, res) => {
        try {
            const { username, password } = req.body
            await executeQuery(res, async (supabase) => {
                // 1. Fetch user by username
                const { data: user, error } = await supabase
                    .from('users')
                    .select('unique_uid, username, password')
                    .eq('username', username)
                    .single()

                // 2. Handle missing user or database error
                if (error || !user) {
                    throw new Error("The username you provided does not exist")
                }

                // 3. Verify password using your bcrypt helper
                const passwordMatched = await loginUser(password, user.password)
                if (!passwordMatched) {
                    throw new Error("Incorrect password")
                }

                // 4. Clean up the object before sending to frontend
                const userCreds = { ...user }
                delete userCreds.password

                return res.json({ 
                    error_message: '', 
                    isLoggedIn: true, 
                    userCreds: userCreds 
                })
            })
        } 
        catch (err) {
            return res.json({ 
                error_message: err.message, 
                isLoggedIn: false 
            })
        }
    }
}

module.exports = LoginController