<template>
  <div class="chat-container">
    <div class="content-body">
      
      <div class="welcome-section text-center">
        <div class="icon-wrapper mb-4">
          <font-awesome-icon icon="face-smile" />
        </div>
        <h1 class="fw-bold mb-3">How can I help you improve your English?</h1>
        <p class="text-secondary fs-5 mb-5">Practice grammar, expand your vocabulary, or just chat.</p>

        <div class="action-suggestions d-flex flex-wrap justify-content-center gap-2">
          <button @click="sendSuggestion('Practice Grammar')" class="suggestion-btn">Practice Grammar</button>
          <button @click="sendSuggestion('New Vocabulary')" class="suggestion-btn">New Vocabulary</button>
          <button @click="sendSuggestion('Casual Conversation')" class="suggestion-btn">Casual Conversation</button>
        </div>
      </div>


      <div v-if="error_message.length > 0" class="messages-list w-100">
        <div v-for="(msg, index) in error_message" :key="index" 
            :class="['message-row', msg.role === 'user' ? 'user-row' : 'bot-row']">
            <div v-if="msg.role === 'assistant'"
								:class="['message-bubble markdown-body', textColorThemeBot]"
								v-html="renderMarkdown(msg.content)">
						</div>

						<div v-else :class="['message-bubble', textColorThemeUser]">
							{{ msg.content }}
						</div>
        </div>
      </div>
    </div>

    <footer class="input-area">
      <div class="input-wrapper mx-auto">
        <div class="input-box-container">
          <textarea 
            v-model="userInput"
            @keydown.enter.prevent="handleSend"
            rows="1"
            class="chat-input" 
            placeholder="Message English Learning Assistant..."
          ></textarea>
          <button @click="handleSend" class="send-btn" :disabled="!userInput.trim()">
            <font-awesome-icon icon="paper-plane" />
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showWaitBox, closeWaitBox, AppChatBot } from '../helper/common'
import { useChatStore } from '../helper/store'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  breaks: true,
  linkify: true
})

const userInput = ref('')
const messages = ref([])
const error_message = ref([])
const router = useRouter()
const chatStore = useChatStore()
const renderMarkdown = (content) => {
  return md.render(content || '')
}

const handleSend = async () => {
  if (!userInput.value.trim()) return
  
  const userMessage = userInput.value.trim()
  
  messages.value.push({ role: 'user', content: userMessage })
  userInput.value = ''
  
  showWaitBox('Thinking...')
  
  try {
    const sessionId = Math.random().toString(36).substring(7)
    const token = btoa(sessionId.toString())
    const AIResponse = await AppChatBot(messages.value, token)
    if(AIResponse?.error_message && AIResponse.error_message.length > 0) error_message.value.push(AIResponse.reply)

    if(AIResponse?.reply) {
      router.push({ name: 'chat', query:{t:token}})
      await chatStore.fetchConversations()
    }
  }
  catch (err) {
    error_message.value.push({ role: 'assistant', content: 'Something went wrong with the system. Please try again.' })
  }
  finally {
    closeWaitBox()
  }
}

const sendSuggestion = (text) => {
  userInput.value = text
  handleSend()
}

</script>

<style scoped>

</style>