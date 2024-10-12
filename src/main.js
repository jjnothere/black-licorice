import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuth } from '@/composables/auth' // Import useAuth composable

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Set initial auth state before mounting the app
const { setInitialAuthState } = useAuth()
setInitialAuthState()

app.mount('#app')
