<template>
  <div class="chat-container">
    <div class="content-body" ref="chatWindow">
      <div v-if="messages.length > 0" class="messages-list w-100">
        <div v-for="(msg, index) in messages" :key="'msg-' + index" 
          :class="['message-row', msg.role === 'user' ? 'user-row' : 'bot-row']">
          
          <div v-if="msg.role === 'assistant'"
              :class="['message-bubble markdown-body', textColorThemeBot]"
              v-html="renderMarkdown(msg.content)">
          </div>

          <div v-else :class="['message-bubble', textColorThemeUser]" style="white-space: pre-wrap;">
            {{ msg.content }}
          </div>
        </div>
      </div>

      <div v-if="error_message.length > 0" class="messages-list w-100">
        <div v-for="(msg, index) in error_message" :key="'err-' + index" class="message-row bot-row">
          <div class="message-bubble bot-dark" style="color: #ff4444; white-space: pre-wrap;">
            {{ msg.content }}
          </div>
        </div>
      </div>
    </div>

    <footer class="input-area">
      <div class="input-wrapper mx-auto">
        <div class="input-box-container">
          <textarea 
            ref="inputField"
            v-model="userInput"
            @input="adjustHeight"
            @keydown.enter.exact.prevent="handleSend"
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
import { ref, watch, computed, nextTick } from 'vue'
import { showWaitBox, closeWaitBox, AppChatBot } from '../helper/common'
import MarkdownIt from 'markdown-it'
import ApiRequest from '../helper/ApiConfig'
import { useRoute } from 'vue-router'

const md = new MarkdownIt({ breaks: true, linkify: true })

const userInput = ref('')
const messages = ref([])
const error_message = ref([])
const chatWindow = ref(null)
const inputField = ref(null) // Added ref for the textarea
const token = ref('')
const props = defineProps({ theme: String })
const route = useRoute()

// --- UI HELPERS ---

// This function makes the textarea grow/shrink
const adjustHeight = () => {
  const el = inputField.value
  if (!el) return
  el.style.height = 'auto' // Reset first
  el.style.height = el.scrollHeight + 'px' // Set to content height
}

const scrollToBottom = () => {
  if (chatWindow.value) {
    chatWindow.value.scrollTop = chatWindow.value.scrollHeight
  }
}

const textColorThemeBot = computed(() => {
  return props.theme === 'light' || props.theme === 'system' ? 'bot-dark' : 'bot-light'
})

const textColorThemeUser = computed(() => {
  return props.theme === 'light' || props.theme === 'system' ? 'user-dark' : 'user-light'
})

const renderMarkdown = (content) => md.render(content || '')

// --- MAIN ACTIONS ---

const handleSend = async () => {
  if (!userInput.value.trim()) return
  
  const userMessage = userInput.value.trim() // Keep formatting
  messages.value.push({ role: 'user', content: userMessage })
  
  // Clear input and reset height
  userInput.value = ''
  if (inputField.value) inputField.value.style.height = 'auto'
  
  showWaitBox('Thinking...')
  await nextTick()
  scrollToBottom()
  
  try {
    const AIResponse = await AppChatBot(messages.value, token.value)
    if (AIResponse?.reply) messages.value.push(AIResponse.reply)
  } catch (err) {
    error_message.value.push({ role: 'assistant', content: 'System error. Please try again.' })
  } finally {
    closeWaitBox()
    await nextTick()
    scrollToBottom()
  }
}

const loadConversation = async (newToken) => {
  if (!newToken) return
  try {
    showWaitBox('Loading conversation...')
    messages.value = []
    const response = await ApiRequest.get('/get_conversation', { params: { session_id: newToken } })
    if (response.data?.conversation) messages.value = response.data.conversation
  } catch (err) {
    error_message.value.push({ role: 'assistant', content: 'Failed to load history.' })
  } finally {
    closeWaitBox()
    await nextTick()
    scrollToBottom()
  }
}

watch(() => route.query.t, (newToken) => {
  token.value = newToken
  loadConversation(newToken)
}, { immediate: true })

defineOptions({ name: 'AppChatPage' })
</script>

