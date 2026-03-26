// const { executeQuery } = require('../helper/connection_helper')
// const ConfigurationController = {
// 	getConfiguration: async (req, res) => {
// 		try {
// 			const uuid = req.query.uuid
// 			const ip_address = req.headers['x-forwarded-for']
// 			await executeQuery(res, async(client) =>{
// 				let result 
// 				if(uuid){
// 					result = await client.query(`SELECT th.id, th.code, th.description 
// 					FROM users u
// 					LEFT JOIN user_setup usp ON u.id = usp.user_id
// 					LEFT JOIN chat_bot_themes th ON th.id = usp.chat_bot_theme_id
// 					WHERE u.unique_uid = NULLIF($1, '')::UUID`, [uuid])
// 				}
// 				else{
// 					result = await client.query(`SELECT th.id, th.code, th.description 
// 					FROM user_setup usp
// 					LEFT JOIN chat_bot_themes th ON th.id = usp.chat_bot_theme_id
// 					WHERE usp.user_ip_address = $1`, [ip_address])
// 				}
				
// 				if(result.rows.length == 0) throw new Error("Failed to get configuration")
			
// 				return res.json({error_message: '', settings: result.rows[0]})
// 			})
// 		} 
// 		catch (err) {
// 			return res.json({error_message: err.message})
// 		}
// 	},
// 	setConfiguration: async (req, res) => {
// 		try {
// 			const {uuid, code} = req.body 
// 			await executeQuery(res, async(client) =>{
// 				const theme_record = await client.query('SELECT id FROM chat_bot_themes WHERE code = $1', [code])

// 				if(uuid){
// 					const user_record = await client.query(`SELECT id FROM users WHERE unique_uid = $1`, [uuid])
// 					const setup_record = await client.query(`SELECT id FROM user_setup WHERE user_id = $1`, [user_record.rows[0].id])
// 					let result 
// 					if(setup_record.rows.length == 0){
// 						result = await client.query(`INSERT INTO user_setup(user_id, chat_bot_theme_id)
// 						VALUES($1, $2)`, [user_record.rows[0].id, theme_record.rows[0].id])
// 					}
// 					else{
// 						result = await client.query('UPDATE user_setup SET chat_bot_theme_id = $1 WHERE id = $2', [theme_record.rows[0].id, setup_record.rows[0].id])
// 					}

// 					if(result.rowCount == 0) throw new Error('Failed to set theme')
// 					return res.json({error_message: ''})
// 				}
// 				else{
// 					const ip_address = req.headers['x-forwarded-for']
// 					console.log(req.socket.remoteAddress)
// 					const setup_record_with_ip = await client.query(`SELECT id FROM user_setup WHERE user_ip_address = $1`, [ip_address])
// 					if(setup_record_with_ip.rows.length == 0){
// 						result = await client.query(`INSERT INTO user_setup(user_ip_address, chat_bot_theme_id)
// 						VALUES($1, $2)`, [ip_address, theme_record.rows[0].id])
// 					}
// 					else{
// 						result = await client.query('UPDATE user_setup SET chat_bot_theme_id = $1 WHERE id = $2', [theme_record.rows[0].id, setup_record_with_ip.rows[0].id])
// 					}
// 					return res.json({error_message: ''})
// 				}
// 			})
// 		} 
// 		catch (err) {
// 			return res.json({error_message: err.message})
// 		}
// 	}
// }

// module.exports = ConfigurationController

const { executeQuery } = require('../helper/connection_helper')

const ConfigurationController = {
    getConfiguration: async (req, res) => {
        try {
            const uuid = req.query.uuid
            const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress
            
            await executeQuery(res, async (supabase) => {
                let query = supabase
                    .from('user_setup')
                    .select(`
                        chat_bot_theme_id,
                        chat_bot_themes (
                            id,
                            code,
                            description
                        )
                    `)

                if (uuid) {
                    // Join logic: filter user_setup by the unique_uid in the related users table
                    const {data: user, recordError} = await supabase.from('users').select('id').eq('unique_uid', uuid).single()
                    if(recordError) throw new Error('Failed to get user configuration.')
                    
                    const { data: record, error } = await query
                        .eq('user_id', user.id)
                        .single()
                    if (error) throw new Error("Failed to get configuration")
                    return res.json({ error_message: '', settings: 'record.user_setup[0].chat_bot_themes' })
                } else {
                    const { data, error } = await query
                        .eq('user_ip_address', ip_address)
                        .single()
                    if (error) throw new Error("Failed to get configuration")

                    return res.json({ error_message: '', settings: data.chat_bot_themes })
                }
            })
        } catch (err) {
            return res.json({ error_message: err.message })
        }
    },

    setConfiguration: async (req, res) => {
        try {
            const { uuid, code } = req.body
            const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress
            await executeQuery(res, async (supabase) => {
                let result 
                const { data: theme, error: themeErr } = await supabase
                    .from('chat_bot_themes')
                    .select('id')
                    .eq('code', code)
                    .single()

                if (themeErr || !theme) throw new Error('Theme not found')
                
                if(uuid){
                    const {data: user, error: userErr } = await supabase.from('users').select('id').eq('unique_uid', uuid)
                    if(userErr) throw new Error('Error getting user.')
                    
                    const {data: setupRecord, error: setupRecordErr} = await supabase.from('user_setup').select('id').eq('user_id', user[0].id)
                    
                    if(setupRecordErr) throw new Error('Getting Set up Error.')

                    if(setupRecord.length == 0){ 
                        result = await supabase.from('user_setup').insert([{user_id: user[0].id, chat_bot_theme_id: theme.id}]).select()
                    }
                    else{
                        result = await supabase.from('user_setup').update({chat_bot_theme_id: theme.id}).eq('id', setupRecord[0].id).select()
                    }
                }
                else{
                    const {data: setupRecord, error: setupRecordErr} = await supabase.from('user_setup').select('id').eq('user_ip_address', ip_address)
                    if(setupRecordErr) throw new Error('Getting Set up Error.')
                    if(setupRecord.length == 0){ 
                        result = await supabase.from('user_setup').insert([{user_ip_address: ip_address, chat_bot_theme_id: theme[0].id}]).select()
                    }
                    else{
                        result = await supabase.from('user_setup').update({chat_bot_theme_id: theme.id}).eq('user_ip_address', ip_address).select()
                    }
                    
                }
                if(!result) throw new Error('Error setup configuration.')
                return res.json({error_message: ''})
            })
        } 
        catch (err) {
            return res.json({ error_message: err.message })
        }
    }
}

module.exports = ConfigurationController