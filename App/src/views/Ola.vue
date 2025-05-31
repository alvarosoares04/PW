<template>
  <div class="ola-container">
    <header class="ola-header">
      <img :src="user.imageUrl" alt="Foto de perfil" class="profile-pic" />
      <h1 class="user-name">{{ user.name }}</h1>
      <p class="user-email">{{ user.email }}</p>
    </header>

    <section class="ficha-card">
      <h2 class="card-title">Ficha Técnica</h2>

      <div class="field">
        <span class="label">Especialidade</span>
        <span class="value">{{ user.specialty }}</span>
      </div>

      <div class="field">
        <span class="label">Data de Nascimento</span>
        <span class="value">{{ user.birthDate }}</span>
      </div>

      <div class="field">
        <span class="label">E-mail</span>
        <span class="value">{{ user.email }}</span>
      </div>

      <div class="field">
        <span class="label">Contacto</span>
        <span class="value">{{ user.contact }}</span>
      </div>
    </section>

    <nav class="bottom-nav">
      <!-- Perfil -->
      <button class="nav-item active">
        <img :src="profileIcon" alt="Perfil" class="nav-icon" />
      </button>

      <!-- Auditoria -->
      <button class="nav-item">
        <img :src="auditIcon" alt="Auditoria" class="nav-icon" />
      </button>

      <!-- Estrela -->
      <button class="nav-item">
        <img :src="starIcon" alt="Favoritos" class="nav-icon" />
      </button>
    </nav>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import profileIcon from '@/assets/ic--baseline-article.png'
import auditIcon   from '@/assets/ic--baseline-assignment-ind.png'
import starIcon    from '@/assets/ic--outline-star-outline.png'

const user = reactive({
  specialty: '',
  name:      '',
  imageUrl:  '',
  birthDate: '',
  email:     '',
  contact:   ''
})

function formatDOB(isoDate) {
  const d = new Date(isoDate)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

onMounted(() => {
  const raw = localStorage.getItem('peritoLogado')
  if (raw) {
    const data = JSON.parse(raw)
    user.name      = data.nome
    user.email     = data.email
    user.imageUrl  = data.imagem
    user.specialty = data.especializacao
    user.birthDate = formatDOB(data.dataNascimento)
    user.contact   = data.contacto
  }
})
</script>

<style scoped>
/* estilos mantidos conforme original */
.ola-container {
  font-family: Verdana;
  max-width: 400px;
  margin: 0 auto;
  padding: 1rem;
  background: #f5f5f5;
  min-height: 100vh;
  position: relative;
  box-sizing: border-box;
}

.ola-header {
  background: #fff;
  border-radius: 1.5rem;
  padding: 2rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.profile-pic {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 0.5rem;
}

.user-name {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
}

.ficha-card {
  background: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #555;
}
.value {
  margin-top: 0.25rem;
  font-size: 1rem;
  color: #222;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.05);
}

.nav-item {
  background: none;
  border: none;
  padding: 0;
}

.nav-item.active .nav-icon {
  filter: brightness(0) saturate(100%) invert(48%) sepia(73%) saturate(495%) hue-rotate(76deg) brightness(94%) contrast(90%);
}

.nav-icon {
  width: 24px;
  height: 24px;
}

.user-email {
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}
</style>
