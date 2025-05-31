<template>
  <!-- injeta sempre o componente da rota atual -->
  <router-view />

  <!-- só mostra a nav se a rota não tiver meta.hideNav -->
  <nav v-if="showNav" class="bottom-nav">
    <router-link to="/profile"    class="nav-item" active-class="active">
      <img :src="profileIcon" class="nav-icon" alt="Perfil"/>
    </router-link>
    <router-link to="/auditorias" class="nav-item" active-class="active">
      <img :src="auditIcon"   class="nav-icon" alt="Auditorias"/>
    </router-link>
    <router-link to="/sugestoes"  class="nav-item" active-class="active">
      <img :src="starIcon"    class="nav-icon" alt="Sugestões"/>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import profileIcon  from '@/assets/ic--baseline-article.png'
import auditIcon    from '@/assets/ic--baseline-assignment-ind.png'
import starIcon     from '@/assets/ic--outline-star-outline.png'

const route         = useRoute()
const isAuthenticated = computed(() => !!localStorage.getItem('credential'))

// só mostra se não for rota de Login e se estivermos autenticados
const showNav = computed(() =>
  !route.meta.hideNav && isAuthenticated.value
)
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 60px; background: #fff;
  display: flex; justify-content: space-around;
  align-items: center;
  padding: 0 2rem;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.05);
}
.nav-item { 
  display: flex; 
  align-items: center; 
}
.nav-icon { 
  width: 24px; 
  height: 24px; 
}
.nav-item.active .nav-icon {
  filter: brightness(0) saturate(100%) invert(48%) sepia(73%) saturate(495%) hue-rotate(76deg) brightness(94%) contrast(90%);
}
</style>