<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div :class="['custom-modal-container', modalThemeColor]">
            <div class="search-header">
              <font-awesome-icon icon="magnifying-glass" class="search-icon" />
              <input type="text" 
                v-model="searchQuery"
                :class="['search-input', modalThemeColor]"
                placeholder="Search chats..." 
                autofocus
                @keydown.enter.exact.prevent="handleSearch"
              >
              <button class="custom-close-btn" @click="$emit('close')">
                <font-awesome-icon icon="xmark" />
              </button>
            </div>

            <hr class="modal-divider" />

            <div class="modal-body custom-scroll">
              <p class="section-label">
                {{ searchQuery ? 'Search Results' : 'Recent History' }}
              </p>
              
              <ul class="chat-history-list">
                <li v-for="(item, index) in displayedChats" :key="index" :class="['list-item', modalThemeColor]">
                  <span class="chat-title" @click.stop="selectedItemInModal(item)">{{ item.title }}</span>
                </li>
                
                <li v-if="displayedChats.length === 0" class="no-results">
                  No matches found.
                </li>
              </ul>

              <div ref="observerTarget" class="load-trigger">
                <span v-if="visibleCount < filteredChats.length" class="loading-text">Loading more...</span>
              </div>
            </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onUnmounted, watch } from 'vue';
import { useChatStore } from "../helper/store";
import { useRouter } from 'vue-router'

const emit = defineEmits(['close'])

const props = defineProps({ show: Boolean, modalTheme: String})
const chatStore = useChatStore()
const router = useRouter()

const modalThemeColor = computed(() => props.modalTheme === 'dark' ? 'dark' : 'light')

// --- Search & Scroll Logic ---
const searchQuery = ref('')
const itemsPerPage = 10
const visibleCount = ref(itemsPerPage)
const observerTarget = ref(null)
let observer = null

const allChats = computed(() => chatStore.chatList)

// 1. Filtered list based on search input
const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) return allChats.value
  const query = searchQuery.value.toLowerCase()
  return allChats.value.filter(chat => 
    chat.title.toLowerCase().includes(query)
  )
})

// 2. Sliced list for infinite scroll
const displayedChats = computed(() => {
  return filteredChats.value.slice(0, visibleCount.value)
})

// Reset scroll position when user types
watch(searchQuery, () => {
  visibleCount.value = itemsPerPage
})

const setupObserver = () => {
  if (observer) observer.disconnect()
  
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && visibleCount.value < filteredChats.value.length) {
      loadMore()
    }
  }, { threshold: 1.0 })

  if (observerTarget.value) observer.observe(observerTarget.value)
}

const loadMore = () => {
  visibleCount.value += itemsPerPage
}

const selectedItemInModal = (item) =>{
  if(!item) return 
  emit('close')
  router.push({ name: 'chat', query: { t: item.session_token } })
}

// Watch for modal opening/closing
watch(() => props.show, (newVal) => {
  if (newVal) {
    visibleCount.value = itemsPerPage
    setTimeout(setupObserver, 100)
  } else {
    // CLEAR TEXT WHEN CLOSING
    searchQuery.value = '' 
    if (observer) observer.disconnect()
  }
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
  display: flex;
  justify-content: center;
  align-items: center;
}

.custom-modal-container {
  width: 50%;
  max-width: 600px;
  min-height: 50vh;
  max-height: 85vh;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  padding: 20px;
  overflow: hidden;
}

/* Theme overrides */
.light { background-color: #f7fbff !important; color: #123148 !important; }
.dark { background-color: #0f172a !important; color: #e2e8f0 !important; }

.search-header {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  gap: 12px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 1rem;
  outline: none;
}

.search-input.light { color: #123148; }
.search-input.dark { color: #e2e8f0; }

.search-input::placeholder {
  color: #8e8e8e !important;
}

.search-input.dark::placeholder { color: #94a3b8 !important; }

.custom-close-btn {
  background: transparent;
  border: none;
  color: #8e8e8e;
  cursor: pointer;
}

.modal-divider { border: 0; border-top: 1px solid rgba(148, 163, 184, 0.3); margin: 0; }

.modal-body {
  max-height: 60vh;
  overflow-y: auto;
  padding-bottom: 20px;
  scrollbar-width: thin;
}

/* Modal scrollbar styling */
.custom-modal-container.light .modal-body {
  scrollbar-color: rgba(18, 49, 72, 0.35) transparent;
}

.custom-modal-container.dark .modal-body {
  scrollbar-color: rgba(148, 163, 184, 0.45) transparent;
}

.modal-body::-webkit-scrollbar {
  width: 12px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  border-radius: 999px;
  border: 3px solid transparent;
  background-clip: content-box;
}

.custom-modal-container.light .modal-body::-webkit-scrollbar-thumb {
  background-color: rgba(18, 49, 72, 0.35);
}

.custom-modal-container.dark .modal-body::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.45);
}

.custom-modal-container.light .modal-body::-webkit-scrollbar-thumb:hover {
  background-color: rgba(18, 49, 72, 0.55);
}

.custom-modal-container.dark .modal-body::-webkit-scrollbar-thumb:hover {
  background-color: rgba(148, 163, 184, 0.65);
}

.chat-history-list { list-style: none; padding: 0; margin: 0; }

.list-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
}

.list-item.light:hover { background-color: rgba(56, 189, 248, 0.14); }
.list-item.dark:hover { background-color: rgba(148, 163, 184, 0.16); }

.no-results {
  text-align: center;
  padding: 20px;
  color: #8e8e8e;
  font-style: italic;
  list-style: none;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #8e8e8e;
  margin: 15px 0 8px 12px;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.load-trigger { height: 20px; text-align: center; margin-top: 10px; }
.loading-text { font-size: 0.8rem; color: #8e8e8e; }

@media (max-width: 768px) {
  .modal-overlay {
    padding: 12px;
  }

  .custom-modal-container {
    width: 100%;
    max-width: none;
    min-height: auto;
    max-height: calc(100vh - 24px);
    border-radius: 10px;
    padding: 12px;
  }

  .search-header {
    padding: 10px 12px;
    gap: 8px;
  }

  .search-input {
    font-size: 16px;
  }

  .modal-body {
    max-height: calc(100vh - 170px);
  }
}
</style>
