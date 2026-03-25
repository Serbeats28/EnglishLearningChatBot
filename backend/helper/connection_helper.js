/**
 * Helper to handle database queries without repetitive connect/release logic
 */
const executeQuery = async (res, callback) => {
    try {
        const supabase = res.locals.pool.supabase
        return await callback(supabase)
    } catch(err) {
        console.log("Database Error:", err.message)
        throw err
    }
}

module.exports = { executeQuery }