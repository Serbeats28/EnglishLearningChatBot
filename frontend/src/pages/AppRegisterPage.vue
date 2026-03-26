<template>
  <main class="auth-screen">
    <section class="auth-card">
      <p class="auth-kicker">Get Started</p>
      <h1>Create your account</h1>
      <p class="auth-subtitle">Start practicing English with your personalized assistant.</p>

      <div class="step-indicator">
        <span :class="['step-chip', currentStep >= 1 ? 'active' : '']">1. Email</span>
        <span :class="['step-chip', currentStep >= 2 ? 'active' : '']">2. OTP</span>
        <span :class="['step-chip', currentStep >= 3 ? 'active' : '']">3. Profile</span>
      </div>

      <form v-if="currentStep === 1" class="auth-form" @submit.prevent="handleSendOtp">
        <label for="email">Email Address</label>
        <input
          id="email"
          v-model.trim="form.email"
          type="email"
          required
          placeholder="you@example.com"
        >
        <button type="submit" class="primary-btn">Send OTP</button>
      </form>

      <form v-else-if="currentStep === 2" class="auth-form otp-card" @submit.prevent="handleValidateOtp">
        <p class="otp-text">Enter the 6-digit code sent to <strong>{{ form.email }}</strong>.</p>
        <label for="otp">One-Time Password (OTP)</label>
        <input
          id="otp"
          v-model.trim="form.otp"
          type="text"
          inputmode="numeric"
          maxlength="6"
          placeholder="123456"
        >
        <button type="submit" class="primary-btn">Validate OTP</button>
        <button type="button" class="secondary-btn" @click="handleSendOtp">Resend OTP</button>
      </form>

      <form v-else class="auth-form" @submit.prevent="handleRegister">
        <label for="displayName">User Name</label>
        <input
          id="displayName"
          v-model.trim="form.username"
          type="text"
          placeholder="Your display name"
        >

        <label for="password">Password</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="Create a password"
        >

        <label for="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          placeholder="Repeat password"
        >

        <button type="submit" class="primary-btn">Create Account</button>
      </form>

      <p class="auth-footer">
        Already have an account?
        <router-link to="/login">Sign in</router-link>
      </p>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref, onMounted} from 'vue'
import { closeWaitBox, confirmationMessage, showWaitBox, systemMessage } from '../helper/common'
import ApiRequest from '../helper/ApiConfig'
import {useRouter} from 'vue-router'


onMounted(() =>{
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  if(isLoggedIn || isLoggedIn == true) router.replace({name: 'new chat'})
})
const router = useRouter()
const form = reactive({
  email: '',
  otp: '',
  username: '',
  password: '',
  confirmPassword: ''
})
const currentStep = ref(1)

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const handleSendOtp = async () => {
  try {
    if (!isValidEmail(form.email)) {
      systemMessage('Please provide a valid email address.', 'error')
      return
    }
    showWaitBox('Sending OTP code...')
    const response = await ApiRequest.post(`/generating_otp`, {email_address: form.email})

    if(response && response.data.error_message.length > 0){
      closeWaitBox()
      systemMessage(response.data.error_message, 'error')
      return
    }

    if(response && response.data.success_message){
      closeWaitBox()
      systemMessage(response.data.success_message, 'success')
      form.otp = ''
      currentStep.value = 2
    }
  } 
  catch (err) {
    closeWaitBox()
    systemMessage(err.message, 'error')
  }

}
const handleValidateOtp = async () => {
  try {
    if (!form.otp || form.otp.length !== 6) {
      systemMessage('Please enter a valid 6-digit OTP.', 'error')
      return
    }
    showWaitBox('Verefying OTP code..')
    const response = await ApiRequest.get(`/verifying_otp_code?code=${form.otp}`)
    
    if(response && response.data.error_message.length > 0){
      closeWaitBox()
      systemMessage(response.data.error_message, 'error')
      return
    }

    if(response && response.data.is_otp_code_validated){
      closeWaitBox()
      currentStep.value = 3
    }
    
  } 
  catch (err) {
    systemMessage(err.message, 'error')
  }
}

const handleRegister = () => {
  try {
    if (!form.username.trim()) {
      systemMessage('user name is required.', 'error')
      return
    }

    if (form.password.length < 8) {
      systemMessage('Password must be at least 8 characters.', 'error')
      return
    }

    if (form.password !== form.confirmPassword) {
      systemMessage('Password and confirm password do not match.', 'error')
      return
    }
    confirmationMessage('Are you want to create this account?', async() =>{
      showWaitBox('Creating User....')
      const payload = {
        email: form.email,
        username: form.username,
        password: form.password
      }

      const response = await ApiRequest.post('/register_user', payload)
      
      if(response && response.data.error_message.length > 0){
        closeWaitBox()
        systemMessage(response.data.error_message, 'error')
        return
      }

      if(response && response.data.success_message.length > 0){
        closeWaitBox()
        systemMessage(response.data.success_message, 'success')
        router.push('/login')
      }
    })
  } 
  catch (err) {
    systemMessage(err.message, 'error')
  }
}
</script>

<style scoped>
.auth-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px 16px;
  background:
    radial-gradient(circle at 85% 12%, rgba(14, 165, 233, 0.2), transparent 34%),
    radial-gradient(circle at 12% 86%, rgba(34, 197, 94, 0.17), transparent 35%),
    #0f172a;
}

.auth-card {
  width: min(100%, 500px);
  border-radius: 20px;
  padding: 28px 22px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 20px 45px rgba(2, 6, 23, 0.45);
  color: #e2e8f0;
}

.auth-kicker {
  margin: 0 0 8px;
  color: #86efac;
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

.step-indicator {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.step-chip {
  font-size: 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.35);
  color: #94a3b8;
  border-radius: 999px;
  padding: 4px 10px;
}

.step-chip.active {
  background: rgba(34, 197, 94, 0.16);
  border-color: rgba(34, 197, 94, 0.6);
  color: #bbf7d0;
}

/* .status-message {
  margin: 2px 0 16px;
  font-size: 0.86rem;
  color: #bae6fd;
} */

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
  width: 26%;
  border-top: 1px solid rgba(148, 163, 184, 0.35);
}

.divider::before { left: 0; }
.divider::after { right: 0; }

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.otp-card {
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  padding: 14px;
  background: rgba(15, 23, 42, 0.35);
}

.otp-text {
  margin: 0 0 8px;
  color: #cbd5e1;
  font-size: 0.86rem;
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
  border-color: #4ade80;
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.2);
}

.primary-btn {
  margin-top: 4px;
  height: 46px;
  border: none;
  border-radius: 11px;
  background: linear-gradient(100deg, #22c55e, #38bdf8);
  color: #082f49;
  font-weight: 700;
}

.secondary-btn {
  height: 44px;
  border: 1px solid rgba(148, 163, 184, 0.45);
  border-radius: 11px;
  background: transparent;
  color: #cbd5e1;
  font-weight: 600;
}

.auth-footer {
  margin: 18px 0 0;
  color: #94a3b8;
  font-size: 0.92rem;
}

.auth-footer a {
  color: #86efac;
  text-decoration: none;
}
</style>
