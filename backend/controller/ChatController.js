// const { isGreetingMessage, chatBot } = require('../helper/chat_bot_helper')
// const { SavingChat, getConversationBySessionId, getChatListHistory } = require('../helper/conversation_helper')
// const { executeQuery } = require('../helper/connection_helper')
// const { getUserCreds } = require('../model/Users')

// const ChatController = {
// chat: async (req, res) => {
// 		const { context: params, token, uuid } = req.body
// 		const ip_address = req.headers['x-forwarded-for'] 
// 		try {
// 			const lastUserMessage = params[params.length - 1]
// 			if (isGreetingMessage(lastUserMessage.content)) {
// 				const reply = { role: "assistant", content: "Hello! How can I help you learn today?" }
// 				await executeQuery(res, async (client) => {
// 					const record = await getUserCreds(client, uuid)
// 					console.log(record)
// 					if(record.length == 0) await SavingChat(client, lastUserMessage, reply, token, 0, ip_address)
// 					else await SavingChat(client, lastUserMessage, reply, token, record.id)
// 				})
// 				return res.json({ error_message: "", reply })
// 			}

// 			// 2. Get AI Response
// 			const response = await chatBot(params)
// 			let reply = response.data
// 			let error_message = ""
// 			if (response.error) {
// 				error_message = response.error
// 				reply = { role: "assistant", content: "Sorry! I can only help with English grammar, translation, or sentence creation." }
// 			}
			
// 			await executeQuery(res, async (client) => {
// 				const record = await getUserCreds(client, uuid)
// 				if(record.length == 0) await SavingChat(client, lastUserMessage, reply, token, 0, ip_address)
// 				else await SavingChat(client, lastUserMessage, reply, token, record.id)
// 			})
// 			return res.json({ error_message, reply })

// 		} 
// 		catch (err) {
// 			return res.status(500).json({ error_message: err.message, reply: null })
// 		}
// },

// getConversation: async (req, res) => {
// 		const token = req.query.session_id;
// 		if (!token) return res.json({ error_message: "Token is required", conversation: [] })

// 		try {
// 				const conversation = await executeQuery(res, (client) => 
// 						getConversationBySessionId(client, token)
// 				)
// 				return res.json({ error_message: "", conversation: conversation || [] })
// 		} catch (err) {
// 				return res.json({ error_message: err.message, conversation: [] })
// 		}
// },
// getChatList: async (req, res) => {
// 		try {
// 			const uuid = req.query.uuid
// 			const ip_address = req.headers['x-forwarded-for']

// 			const chat_list = await executeQuery(res, async (client) =>  {
// 				const record = await getUserCreds(client, uuid)
// 				if(record.length == 0) return await getChatListHistory(client, 0, ip_address)
// 				else return await getChatListHistory(client, record.id)
// 			})

// 			return res.json({ error_message: "", chat_history: chat_list || [] })
// 		} 
// 		catch (err) {
// 				return res.json({ error_message: err.message, chat_history: [] })
// 		}
// },
// renameChat: async (req, res) => {
// 		const { chat_id, new_title } = req.body

// 		try {
// 			// 1. Validation
// 			if (!chat_id || !new_title?.trim()) {
// 					throw new Error("Valid title is required.")
// 			}

// 			if (new_title.length > 100) {
// 					throw new Error('Title is too long (max 100 characters).')
// 			}

// 			// 2. Execute Update
// 			await executeQuery(res, async (client) => {
// 					await client.query(
// 						`UPDATE chat_sessions SET title = $1 WHERE id = $2`, 
// 						[new_title.trim(), chat_id]
// 					)
// 			})

// 			return res.json({ error_message: "", success: true })

// 		} catch (err) {
// 				return res.json({ error_message: err.message, success: false })
// 		}
// },
// deleteChat: async (req, res) => {
// 	try {
// 		const chat_id = req.body.chat_id
		
// 		if(!chat_id) throw new Error("Deleting id is not provided.")
		
// 		await executeQuery(res, async(client) =>{
// 			await client.query(`DELETE FROM chat_messages WHERE session_id = $1`, [chat_id])
		
// 			// Delete the session record
// 			const result = await client.query(`DELETE FROM chat_sessions WHERE id = $1`, [chat_id])

// 			if (result.affectedRows === 0) throw new Error("Chat session not found.")
			
// 			return res.json({ error_message: "", success_message: 'Chat deleted successfully.' })
// 		})
// 	} 
// 	catch (err) {
// 		return res.json({ error_message: err.message, success_message: '' })
// 	}
// }
// }

// module.exports = ChatController

const { isGreetingMessage, chatBot } = require('../helper/chat_bot_helper')
const { SavingChat, getConversationBySessionId, getChatListHistory } = require('../helper/conversation_helper')
const { executeQuery } = require('../helper/connection_helper')
const { getUserCreds } = require('../model/Users')

const ChatController = {
    chat: async (req, res) => {
        const { context: params, token, uuid } = req.body
        const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress
        try {
            const lastUserMessage = params[params.length - 1]
            
            // 1. Handle Greeting
            if (isGreetingMessage(lastUserMessage.content)) {
                const reply = { role: "assistant", content: "Hello! How can I help you learn today?" }
                await executeQuery(res, async (supabase) => {
                    const record = await getUserCreds(supabase, uuid)
                    if (!record || record.length === 0) {
                        await SavingChat(supabase, lastUserMessage, reply, token, 0, ip_address)
                    } else {
                        await SavingChat(supabase, lastUserMessage, reply, token, record.id)
                    }
                })
                return res.json({ error_message: "", reply })
            }

            // 2. Get AI Response
            const response = await chatBot(params)
            let reply = response.data
            let error_message = ""
            if (response.error) {
                error_message = response.error
                reply = { role: "assistant", content: "Sorry! I can only help with English grammar, translation, or sentence creation." }
            }
            
            // 3. Save Conversation
            await executeQuery(res, async (supabase) => {
                const record = await getUserCreds(supabase, uuid)
                if (!record || record.length === 0) {
                    await SavingChat(supabase, lastUserMessage, reply, token, 0, ip_address)
                } else {
                    await SavingChat(supabase, lastUserMessage, reply, token, record.id)
                }
            })
            return res.json({ error_message, reply })

        } 
        catch (err) {
            return res.status(500).json({ error_message: err.message, reply: null })
        }
    },

    getConversation: async (req, res) => {
        const token = req.query.session_id
        if (!token) return res.json({ error_message: "Token is required", conversation: [] })

        try {
            const conversation = await executeQuery(res, (supabase) => 
                getConversationBySessionId(supabase, token)
            )
            return res.json({ error_message: "", conversation: conversation || [] })
        } catch (err) {
            return res.json({ error_message: err.message, conversation: [] })
        }
    },

    getChatList: async (req, res) => {
        try {
            const uuid = req.query.uuid
            const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress

            const chat_list = await executeQuery(res, async (supabase) => {
                const record = await getUserCreds(supabase, uuid)
                if (!record || record.length === 0) {
                    return await getChatListHistory(supabase, 0, ip_address)
                } else {
                    return await getChatListHistory(supabase, record.id)
                }
            })

            return res.json({ error_message: "", chat_history: chat_list || [] })
        } 
        catch (err) {
            return res.json({ error_message: err.message, chat_history: [] })
        }
    },

    renameChat: async (req, res) => {
        const { chat_id, new_title } = req.body

        try {
            if (!chat_id || !new_title?.trim()) {
                throw new Error("Valid title is required.")
            }

            if (new_title.length > 100) {
                throw new Error('Title is too long (max 100 characters).')
            }

            await executeQuery(res, async (supabase) => {
                const { error } = await supabase
                    .from('chat_sessions')
                    .update({ title: new_title.trim() })
                    .eq('id', chat_id)
                
                if (error) throw error
            })

            return res.json({ error_message: "", success: true })

        } catch (err) {
            return res.json({ error_message: err.message, success: false })
        }
    },

    deleteChat: async (req, res) => {
        try {
            const chat_id = req.body.chat_id
            if (!chat_id) throw new Error("Deleting id is not provided.")
            
            await executeQuery(res, async (supabase) => {
                // Note: If you set up ON DELETE CASCADE in your SQL earlier, 
                // deleting the session will automatically delete the messages.
                const { error } = await supabase
                    .from('chat_sessions')
                    .delete()
                    .eq('id', chat_id)

                if (error) throw error
            })

            return res.json({ error_message: "", success_message: 'Chat deleted successfully.' })
        } 
        catch (err) {
            return res.json({ error_message: err.message, success_message: '' })
        }
    }
}

module.exports = ChatController