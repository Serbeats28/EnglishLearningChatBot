<template>
  <div class="app-shell">
    
    <header class="navbar-container">
      <AppNavbar :theme="themeClass" @toggle-sidebar="toggleSidebar" />
    </header>

    <div :class="['main-body', themeClass]">
      
      <AppSidebar 
        :collapsed="sidebarCollapsed" 
        :theme="themeClass"
        @select-theme="handleThemeChange" 
        @handle-search-chat-modal="handleSearchChatModal" 
        @logout="handleLogout"
        @signin="handleSignin"
      />
      <div
        v-if="isMobile && !sidebarCollapsed"
        class="sidebar-backdrop"
        @click="closeSidebar"
      ></div>

      <div :class="['content-wrapper', themeClass]">
        <main class="page-content">
          <router-view v-slot="{Component}"> 
            <component :is="Component" :theme="themeClass" />
          </router-view>
        </main>
        
        <AppModal 
          :show="isModalOpen" 
          @close="isModalOpen = false" 
          :modal-theme="themeClass"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import AppSidebar from '../components/AppSidebar.vue'
import AppNavbar from '../components/AppNavbar.vue'
import AppModal from '../components/AppModal.vue'
import { appDefaultThemeConfiguration, showWaitBox,closeWaitBox, systemMessage } from '../helper/common'
import ApiRequest  from '../helper/ApiConfig'
import { useRouter } from 'vue-router'

defineOptions({ name: 'AppLayout' })

const isModalOpen = ref(false)
const sidebarCollapsed = ref(false)
const theme = ref('')
const isMobile = ref(false)
const MOBILE_BREAKPOINT = 768
const router = useRouter()

const updateViewportState = () => {
  const nextIsMobile = window.innerWidth <= MOBILE_BREAKPOINT
  if (nextIsMobile && !isMobile.value) {
    sidebarCollapsed.value = true
  }
  isMobile.value = nextIsMobile
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
const closeSidebar = () => {
  if (isMobile.value) sidebarCollapsed.value = true
}

const handleThemeChange = async (item) => {
  showWaitBox('Updating theme...')
  try {
    const userCreds = JSON.parse(localStorage.getItem('userCreds')) || undefined
    const uuid = userCreds ? userCreds.unique_uid : ''
    const response = await ApiRequest.post('/update_default_theme', { uuid: uuid, code: item.toLowerCase() })
    if(response?.data?.error_message){
      systemMessage("Failed to update theme: " + response.data.error_message, 'error')
    }
  } 
  catch (err) {
    console.log(err)
    systemMessage("Failed to update theme: " + err.message, 'error')
  }
  finally{
    theme.value = item
    closeWaitBox()
  }
}
onMounted(async() =>{
  updateViewportState()
  window.addEventListener('resize', updateViewportState)
  const themeConfig = await appDefaultThemeConfiguration()
  theme.value = themeConfig ? themeConfig.toLowerCase() : 'system';
})
onUnmounted(() => window.removeEventListener('resize', updateViewportState))
const themeClass = computed(() => {
  if (theme.value === 'dark') return 'dark'
  if (theme.value === 'light') return 'light'
  return 'system'
})

const handleSearchChatModal = () => {
  isModalOpen.value = true
}

const handleLogout = async () => {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('userCreds')
  await router.push({ name: 'login' })
}

const handleSignin = async () => {
  await router.push({ name: 'login' })
}


</script>

<style scoped>
/* 1. The Shell: Forces the page to 100% height and stacks elements vertically */
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden; /* Prevents double scrollbars */
}

/* 2. Navbar: Fixed height ensures the body math works */
.navbar-container {
  width: 100%;
  flex-shrink: 0;
  z-index: 1000;
}

/* 3. Main Body: A horizontal flex container for Sidebar + Content */
.main-body {
  display: flex;
  flex-grow: 1; /* Takes up all remaining space below navbar */
  overflow: hidden;
  position: relative;
}

/* 4. Content Wrapper: Holds the actual router-view */
.content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: hidden; /* Allows only the content to scroll */
  transition: background-color 0.3s ease;
}

.page-content {
  padding: 20px;
  flex-grow: 1;
}

.sidebar-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 1040;
}

@media (max-width: 768px) {
  .page-content {
    padding: 0;
  }
}

/* Theme Backgrounds */
.content-wrapper.dark { background-color: #0f172a; color: #e2e8f0; }
.content-wrapper.light { background-color: #f4f8fb; color: #123148; }
.content-wrapper.system { background-color: #f4f8fb; color: #123148; }
</style>
