
const express = require('express')
const router = express.Router()
const ConfigurationController = require('../controller/ConfigurationController')
const ChatController = require('../controller/ChatController')
const RegistrationController = require('../controller/RegistrationController')
const LoginController = require('../controller/LoginController')

router.get('/test', (req, res)=>{
    res.json({message: "hello world"})
})

router.post('/generating_otp', RegistrationController.generateOTPCode)
router.get('/verifying_otp_code', RegistrationController.verifyingOTPCode)
router.post('/register_user', RegistrationController.registerUser)
router.post('/login', LoginController.userLogin)

router.get('/get_conversation', ChatController.getConversation)
router.get('/get_chat_list', ChatController.getChatList)
router.post('/rename_chat', ChatController.renameChat)
router.post('/delete_chat', ChatController.deleteChat)
router.post('/chat', ChatController.chat)

router.get('/get_default_theme', ConfigurationController.getConfiguration)
router.post('/update_default_theme', ConfigurationController.setConfiguration)

module.exports = router
