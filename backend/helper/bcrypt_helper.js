const bcrypt = require('bcrypt')
const saltRounds = 12 

const hashingPassword = async (plainPassword) =>{
	try {
		const hashedPassword = await bcrypt.hash(plainPassword, saltRounds)
		return hashedPassword
	} 
	catch (err) {
		console.log('hashingPassword: ', err.message)
		return null
	}
}

const loginUser = async (plainPassword, storedHashPassword) =>{
	try {
		const isMatched = await bcrypt.compare(plainPassword, storedHashPassword)
		return isMatched 
	} 
	catch (err) {
		console.log('loginUser: ', err.message)
		return false
	}
}
module.exports = {
	hashingPassword,
	loginUser
}