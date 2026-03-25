// const SavingChat = async (conn, userMessage, aiMessage, token, user_id, ip_address = '') => {
//     try {
//         if (!userMessage || !token || !aiMessage) throw new Error("Missing user message or token")
//         if(user_id == 0) {
//           await savingUserChat(conn, userMessage, token, user_id, ip_address)
//           await savingAIResponse(conn, aiMessage, token)
//         }
//         else {
//           await savingUserChat(conn, userMessage, token, user_id)
//           await savingAIResponse(conn, aiMessage, token)
//         }

        
//         return true
//     } catch (err) {
//         console.error("SavingChat Error:", err.message)
//         return false
//     }
// }

// const savingUserChat = async (conn, param, token, user_id, ip_address) => {
//     try {
//       const contentStr = typeof param.content === 'string' ? param.content : JSON.stringify(param)
//       const chatTitle = contentStr.substring(0, 50).trim()
//       let sessionRes 
//       console.log("user_id", user_id)
//       if(user_id !== 0){
//         sessionRes = await conn.query(`
// 					INSERT INTO chat_sessions (session_token, title, user_id) 
// 					VALUES ($1, $2, $3) 
// 					ON CONFLICT (session_token) 
// 					DO UPDATE SET session_token = EXCLUDED.session_token
// 					RETURNING id`, 
// 					[token, chatTitle, user_id]
//         )
//       }
//       else {
//         sessionRes = await conn.query(`
// 					INSERT INTO chat_sessions (session_token, title, user_ip_address) 
// 					VALUES ($1, $2, $3) 
// 					ON CONFLICT (session_token) 
// 					DO UPDATE SET session_token = EXCLUDED.session_token
// 					RETURNING id`, 
// 					[token, chatTitle, ip_address]
//         )
//       }

//       if(sessionRes.rows.length === 0) throw new Error("Failed to save chat")
//       const sessionId = sessionRes.rows[0].id
//       await conn.query(
//         `INSERT INTO chat_messages (session_id, content) VALUES ($1, $2)`,
//         [sessionId, JSON.stringify({ role: "user", content: contentStr })]
//       )
//     } 
//     catch (err) {
//       throw new Error("savingUserChat: " + err.message)
//     }
// }

// const savingAIResponse = async (conn, param, token) => {
//     try {
//         const contentStr = typeof param.content === 'string' ? param.content : JSON.stringify(param.content)
//         const sessionRes = await conn.query(`SELECT id FROM chat_sessions WHERE session_token = $1`, [token])
//         await conn.query(
//             `INSERT INTO chat_messages (session_id, content) VALUES ($1, $2)`,
//             [sessionRes.rows[0].id, JSON.stringify({ role: "assistant", content: contentStr })]
//         )

//         return true
//     } catch (err) {
//         throw new Error("savingAIResponse: " + err.message)
//     }
// }

// const getConversationBySessionId = async (conn, sessionId) => {
//     try {
//         const res = await conn.query(`
//         SELECT cm.id,cs.session_token, cm.content
//         FROM chat_messages cm
//         INNER JOIN chat_sessions cs ON cs.id = cm.session_id 
//         WHERE cs.session_token = $1`, [sessionId])
//         return res.rows.map(row => JSON.parse(row.content))
//     } 
//     catch (err) {
// 			throw new Error("getConversationBySessionId: " + err.message)
//     } 

// }

// const getChatListHistory = async (conn, userId, ip_address = '') => {
//     try {
// 			let res = []
//         if(userId !== 0){
// 					res = await conn.query(`
// 					SELECT id, session_token, title 
// 					FROM chat_sessions 
// 					WHERE user_id = $1 
// 					ORDER BY created_at DESC`, [userId])
//         }
// 				else{
// 					res = await conn.query(`
// 					SELECT id, session_token, title 
// 					FROM chat_sessions 
// 					WHERE user_ip_address = $1
// 					ORDER BY created_at DESC`, [ip_address])
// 				}
        
//         return res.rows
//     } 
//     catch (err) {
//         throw new Error("getChatList: " + err.message)
//         return []
//     }
// }
// module.exports = { SavingChat, getConversationBySessionId, getChatListHistory}

const SavingChat = async (supabase, userMessage, aiMessage, token, user_id, ip_address = '') => {
    try {
        if (!userMessage || !token || !aiMessage) throw new Error("Missing user message or token")
        
        // Both calls now use the supabase client instead of conn
        await savingUserChat(supabase, userMessage, token, user_id, ip_address)
        await savingAIResponse(supabase, aiMessage, token)
        
        return true
    } catch (err) {
        console.error("SavingChat Error:", err.message)
        return false
    }
}

const savingUserChat = async (supabase, param, token, user_id, ip_address) => {
    try {
        const contentStr = typeof param.content === 'string' ? param.content : JSON.stringify(param)
        const chatTitle = contentStr.substring(0, 50).trim()
        
        let upsertData = {
            session_token: token,
            title: chatTitle
        }

        if (user_id !== 0) {
            upsertData.user_id = user_id
        } else {
            upsertData.user_ip_address = ip_address
        }

        // Supabase upsert handles the ON CONFLICT logic automatically
        const { data: session, error: sessionErr } = await supabase
            .from('chat_sessions')
            .upsert(upsertData, { onConflict: 'session_token' })
            .select('id')
            .single()

        if (sessionErr || !session) throw new Error(sessionErr?.message || "Failed to save chat session")

        const { error: msgErr } = await supabase
            .from('chat_messages')
            .insert({
                session_id: session.id,
                content: JSON.stringify({ role: "user", content: contentStr })
            })

        if (msgErr) throw msgErr
    } 
    catch (err) {
        throw new Error("savingUserChat: " + err.message)
    }
}

const savingAIResponse = async (supabase, param, token) => {
    try {
        const contentStr = typeof param.content === 'string' ? param.content : JSON.stringify(param.content)
        
        // Find the session ID first
        const { data: session, error: sessionErr } = await supabase
            .from('chat_sessions')
            .select('id')
            .eq('session_token', token)
            .single()

        if (sessionErr || !session) throw new Error("Session not found")

        const { error: msgErr } = await supabase
            .from('chat_messages')
            .insert({
                session_id: session.id,
                content: JSON.stringify({ role: "assistant", content: contentStr })
            })

        if (msgErr) throw msgErr

        return true
    } catch (err) {
        throw new Error("savingAIResponse: " + err.message)
    }
}

const getConversationBySessionId = async (supabase, sessionToken) => {
    try {
        // Relational query: Get messages where the parent session has this token
        const { data, error } = await supabase
            .from('chat_messages')
            .select(`
                id,
                content,
                chat_sessions!inner(session_token)
            `)
            .eq('chat_sessions.session_token', sessionToken)

        if (error) throw error
        
        // Parse the JSON content strings back into objects
        return data.map(row => JSON.parse(row.content))
    } 
    catch (err) {
        throw new Error("getConversationBySessionId: " + err.message)
    } 
}

const getChatListHistory = async (supabase, userId, ip_address = '') => {
    try {
        let query = supabase
            .from('chat_sessions')
            .select('id, session_token, title')
            .order('created_at', { ascending: false })

        if (userId !== 0) {
            query = query.eq('user_id', userId)
        } else {
            query = query.eq('user_ip_address', ip_address)
        }

        const { data, error } = await query

        if (error) throw error
        return data
    } 
    catch (err) {
        throw new Error("getChatList: " + err.message)
    }
}

module.exports = { SavingChat, getConversationBySessionId, getChatListHistory }