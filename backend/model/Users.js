// const getUserCreds = async (conn, uuid) =>{
// 	let result 
//   try {
// 		result = await conn.query(`SELECT id, unique_uid, username FROM users WHERE unique_uid = NULLIF($1, '')::UUID`, [uuid])
// 	} 
// 	catch (err) {
// 		console.log("getUserDetials: ", err.message)
// 	}
	
// 	return result.rows.length > 0 ? result.rows[0] : []
// }

// module.exports = {
// 	getUserCreds
// }

const getUserCreds = async (supabase, uuid) => {
    try {
        // If uuid is empty or undefined, return an empty array immediately 
        // to avoid unnecessary database calls
        if (!uuid || uuid === '') return []

        const { data, error } = await supabase
            .from('users')
            .select('id, unique_uid, username')
            .eq('unique_uid', uuid)
            .single()

        if (error) {
            // Log the error but don't crash the app
            console.log("getUserDetails: ", error.message)
            return []
        }

        return data || []
    } 
    catch (err) {
        console.log("getUserDetails Exception: ", err.message)
        return []
    }
}

module.exports = {
    getUserCreds
}