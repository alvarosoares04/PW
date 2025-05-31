<template>
    <div class="wrapper">
      <div class="header"><h2 class="titulo">Login</h2></div>
      <div class="content">
        <img src="@/assets/googlelogo.png" alt="Logo" class="logo" />
        <GoogleLogin
          :callback="callback"
          :prompt="true"
          :auto-login="false"
          :useOneTap="false"
        />
      </div>
    </div>
  </template>
  
  <script setup>
import { ref } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'vue-router'

const router       = useRouter()
const userProfile  = ref(null)

function callback(response) {
  if (!response?.credential) return;
  const decoded = jwtDecode(response.credential);
  const profileData = {
    name:     decoded.name,
    email:    decoded.email,
    imageUrl: decoded.picture
  };
  // grava o perfil Google
  localStorage.setItem('userProfile', JSON.stringify(profileData));
  localStorage.setItem('credential', response.credential)

  // lê lista de peritos que o backoffice já guardou
  const peritos = JSON.parse(localStorage.getItem('peritos') || '[]');
  // tenta encontrar o perito cujo email bate com o login Google
  const meuPerito = peritos.find(p => p.email === decoded.email);
  if (!meuPerito) {
    console.warn('Perito não encontrado para o email:', decoded.email);
    // opcional: redirecionar para página de erro ou criar perfil automaticamente
  } else {
    // grava o perito “logado”
    localStorage.setItem('peritoLogado', JSON.stringify(meuPerito));
    router.push({ name: 'Auditorias' });
  }
}
</script>

<style scoped>
.titulo {
  font-family: Verdana;
}
.wrapper {
  height: 100vh;
  background-color: #4caf50;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.header {
  padding: 30px;
  margin-top: 50px;
  text-align: center;
  color: white;
  font-size: 1rem;
  font-weight: bold;
}
.content {
  width: 90%;
  height: 90%;
  background-color: #fff;
  padding: 40px 20px;
  margin-top: 20px;
  border-radius: 30px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column; 
  align-items: center;
  justify-content: center;
}
.logo {
  width: 120px;
  margin-bottom: 40px;
  margin-top: -200px;
}
.profile {
  text-align: center;
  margin-top: 20px;
}
.profile-pic {
  width: 80px;
  border-radius: 50%;
  margin-bottom: 10px;
}
</style>