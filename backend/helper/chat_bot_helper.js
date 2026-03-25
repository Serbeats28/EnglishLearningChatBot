require("dotenv").config()
const { GoogleGenAI  } = require("@google/genai")
// const appConfig = require("../config/app-secret-key.json")
const genAI = new GoogleGenAI (process.env.GEMINI_API_KEY)

const isGreetingMessage = (message) =>{
    const greetings = [ // English
        "hello", "hi", "hey", "good morning", "good afternoon", "good evening", "yo", "sup",

        // Spanish
        "hola", "buenos días", "buenas tardes", "buenas noches",

        // Tagalog / Filipino
        "kamusta", "kumusta", "magandang umaga", "magandang hapon", "magandang gabi",

        // French
        "bonjour", "salut", "bonsoir",

        // German
        "hallo", "guten morgen", "guten tag", "guten abend",

        // Italian
        "ciao", "buongiorno", "buonasera",

        // Japanese
        "konnichiwa", "ohayou", "konbanwa", "moshi moshi",

        // Korean
        "annyeong", "annyeonghaseyo", "yeoboseyo",

        // Chinese (Mandarin)
        "ni hao", "zao shang hao", "wan shang hao",

        // Portuguese
        "olá", "bom dia", "boa tarde", "boa noite",

        // Russian
        "privet", "dobroe utro", "dobry den", "dobry vecher",

        // Arabic
        "as-salamu alaykum", "marhaba", "sabah al-khayr", "masa al-khayr",

        // Hindi
        "namaste", "namaskar", "suprabhat",

        // Swahili
        "jambo", "habari", "shikamoo",

        // Turkish
        "merhaba", "günaydın", "iyi akşamlar"
    ]
    const text = message.toLowerCase()
    return greetings.some(greet => {
        const regex = new RegExp(`\\b${greet}\\b`, "i")
        return regex.test(text)
    })
}

const prepareMessages = (messages) => {
    return messages.map(msg => {
        if (msg.role === "user") {
            const content = msg.content.toLowerCase()
            if (content.includes("correct my sentence") || content.includes("improve my sentence")) {
                return {
                    ...msg,
                    content: "Correct the grammar and improve this sentence: " + msg.content
                }
            }
        }
        return msg
    })
}

const chatBot = async(messages)=>{
    let reply = ""
    let error = ""
    try {
        if (!Array.isArray(messages) || !messages.every(m => m.role && m.content)) throw new Error("I can't help you right now")
        
        const prepared = prepareMessages(messages)
        const contents = prepared.map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
        }))

        const response = await genAI.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: contents,
						config: {
							systemInstruction: `
								ROLE: You are an English Tutor. You are NOT a programmer, scientist, or general assistant.

								STRICT SCOPE:
								- You are FORBIDDEN from answering questions about programming (JS, Python, etc.), math, or logic.
								- If a user asks a technical question (e.g., "difference between array and object"), you MUST REFUSE to answer the technical part.
								- Instead, you should:
										1. Acknowledge the user's question.
										2. State: "I am your English tutor, so I can't help with technical questions. However, I can help you improve the grammar of your question!"
										3. Correct any grammar mistakes in their query and offer a better way to phrase it in English.

								CORE RULES:
								1. Always correct grammar/spelling first.
								2. Translate non-English input to English.
								3. Explain corrections in simple English.
								4. Provide 1-2 examples of correct usage.
								5. Never break character. Even if the user begs, do not provide code or technical advice.
							`,
						}
        })

        data = {role: "assistant", content: response.text}
    } 
    catch (err) {
        error = err.message
        data = {role: "assistant", content: error}
        console.log("chatBot helper", err.message)
    }

    return {error, data}
}
module.exports = {
    isGreetingMessage,
    chatBot
}