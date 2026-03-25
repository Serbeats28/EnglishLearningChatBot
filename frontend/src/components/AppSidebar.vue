<template>
  <div :class="['custom-sidebar', themeClass, collapsed ? 'collapsed' : '']">
    <div class="d-flex flex-column align-items-stretch h-100 sidebar-inner">
      <div class="sidebar-main-scroll">
        <ul class="mt-4 nav nav-pills flex-column mb-auto w-100 p-0">
          <router-link to="/" class="nav-link sidebar-link w-100">
            <font-awesome-icon icon="pen-to-square" class="sidebar-icon"/>
            <span class="ms-2 link-text">New Chat</span>
          </router-link>

          <li class="nav-link sidebar-link w-100" @click="$emit('handle-search-chat-modal')">
            <font-awesome-icon icon="search" class="sidebar-icon" />
            <span class="ms-2 link-text">Search</span>
          </li>

          <li class="nav-link sidebar-link position-relative w-100" @click.stop="openSettings">
            <font-awesome-icon icon="gear" class="sidebar-icon"/>
            <span class="ms-2 link-text">Settings</span>

            <ul v-if="showPopup" class="sidebar-popup-list">
              <li v-for="theme in ['system', 'dark', 'light']" 
                  :key="theme" 
                  class="popup-item" 
                  @click.stop="selectItem(theme)"> 
                <font-awesome-icon v-if="selectedItem === theme" icon="check" class="me-2 text-primary" /> 
                <span class="text-capitalize">{{ theme }}</span>
              </li>
            </ul>
          </li>

          <li class="sidebar-divider my-3"></li>

          <li class="sidebar-header-label w-100">
            <div class="section-title-wrapper">
              <strong class="section-title">Your chats</strong>
            </div>

            <ul class="chat-list custom-scroll p-0">
              <li v-for="chat in chatList" :key="chat.id" class="chat-item-container">
                <div class="chat-item" @click="handleChatClick(chat.session_token)">
                  <template v-if="editingId !== chat.id">
                    <span class="chat-text">{{ chat.title }}</span>
                  </template>
                  <template v-else>
                    <input 
                      ref="renameInput"
                      v-model="editTitle" 
                      class="chat-rename-input"
                      @blur="confirmRename(chat.id)"
                      @keyup.enter="confirmRename(chat.id)"
                      @keyup.esc="editingId = null"
                      @click.stop
                    />
                  </template>
                  
                  <button v-if="editingId !== chat.id" class="btn-item-dots" @click.stop="toggleItemMenu(chat.id)">
                    <font-awesome-icon icon="ellipsis" />
                  </button>

                  <div v-if="activeItemMenu === chat.id" class="chat-item-popup">
                    <button class="popup-option" @click.stop="startRename(chat)">
                      <font-awesome-icon icon="pen-to-square" class="me-2 icon-fw" />
                      Rename
                    </button>
                    <button class="popup-option text-danger" @click.stop="handleDelete(chat.id)">
                      <font-awesome-icon icon="trash" class="me-2 icon-fw" />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <button class="sidebar-user-footer" type="button" @click="handleUserAction">
        <div class="sidebar-user-left">
          <font-awesome-icon icon="user" class="sidebar-user-icon" />
          <span class="sidebar-user-name">{{ userDisplayName }}</span>
        </div>
        <span v-if="isAuthenticated" class="sidebar-user-action">Log out</span>
        <span v-else class="sidebar-user-action">Sign In</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue"
import { appDefaultThemeConfiguration, systemMessage, confirmationMessage, showWaitBox, closeWaitBox } from '../helper/common'
import { useChatStore } from "../helper/store";
import { useRoute, useRouter } from 'vue-router'
import ApiRequest from "../helper/ApiConfig";

const props = defineProps({
  collapsed: Boolean,
  theme: { type: String, default: 'system' }
})
const emit = defineEmits(['select-theme', 'handle-search-chat-modal', 'logout', 'signin'])

const chatStore = useChatStore()
const router = useRouter()
const route = useRoute()

// UI State
const showPopup = ref(false)
const activeItemMenu = ref(null)
const selectedItem = ref("")
const chatList = computed(() => chatStore.chatList)

// Rename State
const editingId = ref(null)
const editTitle = ref("")
const renameInput = ref(null)
const themeClass = computed(() => (props.theme === 'dark' ? 'dark' : 'light'))
const storedUserCreds = computed(() => {
  const raw = localStorage.getItem('userCreds')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (err) {
    return null
  }
})

const isAuthenticated = computed(() => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  return Boolean(isLoggedIn && storedUserCreds.value)
})

const userDisplayName = computed(() => {
  if (!isAuthenticated.value) return 'Guest User'
  return storedUserCreds.value?.username || 'Guest User'
})

const openSettings = () => { 
  closeAllMenus()
  showPopup.value = !showPopup.value 
}

const toggleItemMenu = (id) => {
  activeItemMenu.value = activeItemMenu.value === id ? null : id
}

const selectItem = (item) => {
  selectedItem.value = item
  showPopup.value = false
  emit('select-theme', item)
}

const closeAllMenus = () => {
  showPopup.value = false
  activeItemMenu.value = null
}

const handleChatClick = (token) => {
  if (editingId.value) return // Prevent navigation while renaming
  router.push({ name: 'chat', query: { t: token } })
}

// Prepare the UI for renaming
const startRename = async (chat) => {
  editingId.value = chat.id
  editTitle.value = chat.title
  activeItemMenu.value = null // close the menu
  
  await nextTick()
  // Focus the input field automatically
  if (renameInput.value && renameInput.value[0]) {
    renameInput.value[0].focus()
  }
}

// Save to Database
const confirmRename = async (id) => {
  if (!editTitle.value.trim() || editingId.value === null) {
    editingId.value = null
    return
  }

  const newTitle = editTitle.value.trim()
  editingId.value = null // Close input immediately for UI responsiveness

  try {
    const response = await ApiRequest.post('/rename_chat', { 
      chat_id: id, 
      new_title: newTitle 
    })
    
    if (response.data?.success) {
      await chatStore.fetchConversations()
    } 
    else if (response.data?.error_message) {
      systemMessage(response.data.error_message, 'error')
    }
  } 
  catch (err) {
    systemMessage(err.message, 'error')
  }
}

const handleDelete = (id) => {
  try {
    confirmationMessage("Are you want to delete this chat?", async() =>{
      showWaitBox("Deleting chat...")

      const chatToDelete = chatList.value.find(c => c.id === id)
      const deletedToken = chatToDelete ? chatToDelete.session_token : null

      const response = await ApiRequest.post("/delete_chat", {chat_id: id})
      
      if(response && response.data.error_message.length > 0){
        systemMessage(response.data.error_message, 'error')
        closeWaitBox()
        return
      }

    if (response && response.data.success_message) {
        systemMessage(response.data.success_message, 'success')
        // 1. Refresh the sidebar list
        await chatStore.fetchConversations()

        const currentToken = route.query.t
        if (deletedToken && currentToken === deletedToken) {
          router.push({ name: 'new chat' })
        }

        closeWaitBox()
        activeItemMenu.value = null // Close the ellipsis menu
        closeWaitBox()
      }
    })
  } 
  catch (err) {
    systemMessage(err.message, 'error')
  }
}

const handleUserAction = () => {
  emit(isAuthenticated.value ? 'logout' : 'signin')
}

onMounted(async() =>{
  try {
    await chatStore.fetchConversations()
  } 
  catch (err) {
    console.error("Error fetching chat list:", err)
  } 
  finally {
    const defaultTheme = await appDefaultThemeConfiguration()
    selectedItem.value = defaultTheme.toLowerCase() || ''
    window.addEventListener('click', closeAllMenus)
  }
})

onUnmounted(() => window.removeEventListener('click', closeAllMenus))
</script>
<style scoped>

</style>
