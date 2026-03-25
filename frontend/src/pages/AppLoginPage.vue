<template>
  <main class="auth-screen">
    <section class="auth-card">
      <p class="auth-kicker">Welcome Back</p>
      <h1>Sign in to continue</h1>
      <p class="auth-subtitle">Access your English learning chats and progress.</p>

      <!-- <button class="google-btn" type="button" @click="handleGoogleSignIn">
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <path fill="#FFC107" d="M43.6 20.4H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.6z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 19 12 24 12c3 0 5.8 1.1 8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.1 0 9.8-1.9 13.4-5l-6.2-5.2c-2.1 1.4-4.7 2.2-7.2 2.2-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.7 39.7 16.3 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.4H42V20H24v8h11.3c-1 2.9-3 5.2-5.8 6.8l6.2 5.2C39.3 36.9 44 31 44 24c0-1.3-.1-2.4-.4-3.6z"/>
        </svg>
        Continue with Google
      </button> -->

      <div class="divider"><span>or sign in with Username</span></div>

      <form class="auth-form" @submit.prevent="handleLogin">
        <label for="username">Username</label>
        <input id="username" v-model.trim="form.username" type="text" required placeholder="Enter your username">

        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" required placeholder="Enter your password">

        <button type="submit" class="primary-btn">Sign In</button>
      </form>

      <p class="auth-footer">
        No account yet?
        <router-link to="/register">Create one</router-link>
      </p>
    </section>
  </main>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { showWaitBox, systemMessage, closeWaitBox } from '../helper/common'
import ApiRequest from '../helper/ApiConfig'
import {useRouter} from 'vue-router'

const router = useRouter()
const form = reactive({
  username: '',
  password: ''
})

onMounted(() =>{
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  if(isLoggedIn || isLoggedIn == true) router.replace({name: 'new chat'})
})

const handleLogin = async () => {
  try {
    if(!form.username || !form.password){
      systemMessage('All fields are required.', 'error')
      return
    }

    showWaitBox('Logging....')
    const response = await ApiRequest.post('/login', form)
    if(response && response.data.error_message.length > 0){
      closeWaitBox()
      systemMessage(response.data.error_message, 'error')
      return
    }

    if(response && response.data.isLoggedIn){
      localStorage.setItem('isLoggedIn', response.data.isLoggedIn)
      localStorage.setItem('userCreds',JSON.stringify(response.data.userCreds))
      router.push('/')
      closeWaitBox()
    }
  } 
  catch (err) {
    closeWaitBox()
    systemMessage(err.message, 'error')
  }
}

// const handleGoogleSignIn = () => {
//   startGoogleAuth('signin')
// }
</script>

<style scoped>
.auth-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px 16px;
  background:
    radial-gradient(circle at 20% 15%, rgba(66, 153, 225, 0.2), transparent 35%),
    radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.15), transparent 30%),
    #0f172a;
}

.auth-card {
  width: min(100%, 460px);
  border-radius: 20px;
  padding: 28px 22px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 20px 45px rgba(2, 6, 23, 0.45);
  color: #e2e8f0;
}

.auth-kicker {
  margin: 0 0 8px;
  color: #7dd3fc;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

h1 {
  margin: 0;
  font-size: clamp(1.55rem, 4.6vw, 2rem);
}

.auth-subtitle {
  margin: 10px 0 20px;
  color: #94a3b8;
}

.google-btn {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  height: 46px;
  background: #ffffff;
  color: #0f172a;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.google-btn svg {
  width: 18px;
  height: 18px;
}

.divider {
  margin: 18px 0;
  text-align: center;
  position: relative;
  color: #94a3b8;
  font-size: 0.86rem;
}

.divider::before,
.divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 28%;
  border-top: 1px solid rgba(148, 163, 184, 0.35);
}

.divider::before { left: 0; }
.divider::after { right: 0; }

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 0.88rem;
  color: #cbd5e1;
}

input {
  width: 100%;
  border-radius: 11px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  padding: 11px 12px;
  background: rgba(15, 23, 42, 0.7);
  color: #e2e8f0;
  margin-bottom: 10px;
}

input:focus {
  outline: none;
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.22);
}

.primary-btn {
  margin-top: 4px;
  height: 46px;
  border: none;
  border-radius: 11px;
  background: linear-gradient(100deg, #38bdf8, #22c55e);
  color: #082f49;
  font-weight: 700;
}

.auth-footer {
  margin: 18px 0 0;
  color: #94a3b8;
  font-size: 0.92rem;
}

.auth-footer a {
  color: #bae6fd;
  text-decoration: none;
}
</style>
