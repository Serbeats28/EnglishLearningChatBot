<template>
  <nav :class="['navbar navbar-expand custom-topnav px-3', themeClass]">
    <div class="d-flex align-items-center">
      <button class="btn text-white p-0 me-3" @click="$emit('toggle-sidebar')">
        <font-awesome-icon icon="bars" id="sidebar-toggle-icon" />
      </button>
    </div>

    <div class="ms-auto d-flex align-items-center">
      <div class="text-white-50 small d-none d-sm-block">
        English Learning Assistant
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'AppNavbar'
})
const props = defineProps({
  theme: { type: String, default: 'system' }
})
defineEmits(['toggle-sidebar'])

const themeClass = computed(() => (props.theme === 'dark' ? 'dark' : 'light'))
</script>

<style scoped>
.custom-topnav {
  /* Height must be consistent with the calc() in AppLayout */
  height: 60px; 
  width: 100%;
  z-index: 1030; /* Ensure it stays above content while scrolling */
}

.custom-topnav.dark {
  background-color: #0f172a;
  border-bottom: 1px solid rgba(148, 163, 184, 0.22);
  color: #e2e8f0;
}

.custom-topnav.light {
  background-color: #ffffff;
  border-bottom: 1px solid rgba(18, 49, 72, 0.15);
  color: #123148;
}

.custom-topnav.light .btn,
.custom-topnav.light .text-white,
.custom-topnav.light .text-white-50 {
  color: #123148 !important;
}

#sidebar-toggle-icon {
  font-size: 1.2rem;
  transition: transform 0.2s ease;
}

#sidebar-toggle-icon:active {
  transform: scale(0.9);
}

.navbar-brand {
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}
</style>
