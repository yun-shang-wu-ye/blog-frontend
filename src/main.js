import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(ElementPlus)
app.use(router)

window.addEventListener('storage', (e) => {
  if (e.key === 'token' && !e.newValue) {
    const authStore = useAuthStore()
    authStore.logout()
    router.push('/login')
  }
})

app.mount('#app')