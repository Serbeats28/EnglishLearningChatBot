import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/AppLayout.vue'
import NewChatPage from '../pages/AppNewChatPage.vue'
import AppChatPage from '../pages/AppChatPage.vue'
import AppLoginPage from '../pages/AppLoginPage.vue'
import AppRegisterPage from '../pages/AppRegisterPage.vue'

const routes = [
    { path: '/login', name: 'login', component: AppLoginPage },
    { path: '/register', name: 'register', component: AppRegisterPage },
    {
        path: '/',
        component: MainLayout,
        children: [
        { path: '/', name: 'new chat', component: NewChatPage },
        { path: '/chat', name: 'chat', component: AppChatPage }
    ]
    }
]
const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
