<template>
  <main class="notfound-screen">
    <section class="notfound-card">
      <p class="code">404</p>
      <h1>Page Not Found</h1>
      <p class="desc">The route you entered does not exist.</p>
      <div class="actions">
        <router-link class="btn-primary" to="/">Go To Chat</router-link>
        <router-link class="btn-secondary" to="/login">Go To Login</router-link>
      </div>
    </section>
  </main>
</template>

<script setup>
defineOptions({ name: 'AppNotFoundPage' })
</script>

<style scoped>
.notfound-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 20px;
  background:
    radial-gradient(circle at 18% 14%, rgba(56, 189, 248, 0.2), transparent 34%),
    radial-gradient(circle at 82% 82%, rgba(34, 197, 94, 0.18), transparent 36%),
    #0f172a;
}

.notfound-card {
  width: min(100%, 460px);
  border-radius: 18px;
  padding: 28px 22px;
  text-align: center;
  background: rgba(15, 23, 42, 0.86);
  border: 1px solid rgba(148, 163, 184, 0.28);
  color: #e2e8f0;
}

.code {
  margin: 0 0 6px;
  font-size: 2.4rem;
  font-weight: 800;
  color: #38bdf8;
}

h1 {
  margin: 0;
  font-size: 1.7rem;
}

.desc {
  margin: 10px 0 0;
  color: #94a3b8;
}

.actions {
  margin-top: 22px;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  border-radius: 10px;
  padding: 10px 14px;
  text-decoration: none;
  font-weight: 700;
}

.btn-primary {
  background: linear-gradient(100deg, #22c55e, #38bdf8);
  color: #082f49;
}

.btn-secondary {
  border: 1px solid rgba(148, 163, 184, 0.4);
  color: #e2e8f0;
}
</style>
