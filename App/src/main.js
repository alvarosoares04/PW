import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vue3GoogleLogin from 'vue3-google-login'
 
const app = createApp(App)
app.use(router)
app.use(vue3GoogleLogin, {
  clientId: '601570228826-iitg4jrf7hppsqo120qq56slb6a4jcos.apps.googleusercontent.com'
})
 
app.mount('#app')
