import { createRouter, createWebHistory } from 'vue-router'
import Login       from '@/views/Login.vue'
import Profile     from '@/views/Ola.vue'
import Auditorias  from '@/views/Auditorias.vue'
import Sugestoes   from '@/views/Sugestoes.vue'
import verOcorrencia from '@/views/verOcorrencia.vue'
import GerirAuditoria from '@/views/GerirAuditoria.vue'

const routes = [
  { path: '/',          name: 'Login',      component: Login,     meta: { hideNav: true } },
  { path: '/profile',   name: 'Profile',    component: Profile, meta: { hideNav: false }   },
  { path: '/auditorias',name: 'Auditorias', component: Auditorias, meta: { hideNav: false }  },
  { path: '/sugestoes', name: 'Sugestoes',  component: Sugestoes, meta: { hideNav: false }   },
  { path: '/ocorrencia/:id', name: 'VerOcorrencia', component: verOcorrencia, props: true  },
  { path: '/auditoria/:id', name: 'GerirAuditoria', component: GerirAuditoria, props: true}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


export default router
