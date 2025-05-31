<template>
  <div class="ver-ocorrencia-container">
    <div class="header">
      <button @click="$router.back()" class="back-btn">
        <img
          src="@/assets/back-arrow-icon.png"
          alt="Voltar"
          class="back-img"
        />
      </button>
      <h1 class="title">Ver Ocorrência</h1>
    </div>

    <div class="card" v-if="achei">
      <div class="field">
        <label>Tipo:</label>
        <span>{{ ocorrencia.tipo }}</span>
      </div>
      <div class="field">
        <label>Data:</label>
        <span>{{ formatDate(ocorrencia.dataHora) }}</span>
      </div>
      <div class="field">
        <label>Gravidade:</label>
        <span>{{ ocorrencia.gravidade }}</span>
      </div>
      <div class="field description">
        <label>Descrição:</label>
        <p>{{ ocorrencia.descricao }}</p>
      </div>
      <div class="field">
        <label>Código postal:</label>
        <span>{{ ocorrencia.codigoPostal }}</span>
      </div>
      <div class="field">
        <label>Rua:</label>
        <span>{{ ocorrencia.rua }}</span>
      </div>

      <div id="map" class="map"></div>

      <div v-if="ocorrencia.anexos && ocorrencia.anexos.length" class="carousel">
        <button
          @click="prevImage"
          class="arrow left"
          :disabled="currentIndex === 0"
        >
          ‹
        </button>

        <div class="slide">
          <img
            :src="ocorrencia.anexos[currentIndex].data"
            :alt="ocorrencia.anexos[currentIndex].name || `Anexo ${currentIndex+1}`"
            class="anexo-img"
          />
          <div class="anexo-nome">
            {{ ocorrencia.anexos[currentIndex].name }}
          </div>
        </div>

        <button
          @click="nextImage"
          class="arrow right"
          :disabled="currentIndex === ocorrencia.anexos.length - 1"
        >
          ›
        </button>
      </div>

      <button class="download-btn" @click="downloadEvidencias">
        Baixar Fotos
      </button>
    </div>

    <div v-else class="not-found">
      <p>Ocorrência não encontrada.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const route = useRoute()

const ocorrencia = ref({
  tipo: '',
  gravidade: '',
  dataHora: '',
  descricao: '',
  codigoPostal: '',
  rua: '',
  anexos: [],
  latitude: null,
  longitude: null
})
const achei = ref(false)
const currentIndex = ref(0)

function loadArray() {
  try {
    return JSON.parse(localStorage.getItem('ocorrencias') || '[]')
  } catch (e) {
    console.error('Erro ao parsear ocorrências:', e)
    return []
  }
}

async function initialize() {
  const arr = loadArray()
  const found = arr.find(o => String(o.id) === route.params.id)
  if (!found) return

  ocorrencia.value = {
    tipo: found.tipo,
    gravidade: found.gravidade,
    dataHora: found.dataHora,
    descricao: found.descricao,
    codigoPostal: found.codigoPostal || found.cep || '',
    rua: found.rua,
    anexos: found.anexos || [],
    latitude: found.latitude,
    longitude: found.longitude
  }
  achei.value = true
  currentIndex.value = 0

  await nextTick()
  const lat = parseFloat(found.latitude)
  const lng = parseFloat(found.longitude)
  if (!isNaN(lat) && !isNaN(lng)) initMap(lat, lng)
}

function initMap(lat, lng) {
  const map = L.map('map').setView([lat, lng], 15)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)
  L.marker([lat, lng]).addTo(map)
}

function formatDate(dateString) {
  if (!dateString) return ''
  const dt = new Date(dateString)
  const d = String(dt.getDate()).padStart(2, '0')
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const y = dt.getFullYear()
  return `${d}/${m}/${y}`
}

function prevImage() {
  if (currentIndex.value > 0) currentIndex.value--
}

function nextImage() {
  if (currentIndex.value < ocorrencia.value.anexos.length - 1)
    currentIndex.value++
}

function downloadEvidencias() {
  const anexos = ocorrencia.value.anexos
  if (!anexos.length) {
    alert('Não há evidências para download.')
    return
  }
  anexos.forEach(anexo => {
    const link = document.createElement('a')
    link.href = anexo.data
    link.download = anexo.name || 'evidencia'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  })
}

onMounted(initialize)
</script>

<style scoped>
.ver-ocorrencia-container {
  font-family: Verdana, sans-serif;
  max-width: 400px;
  margin: 0 auto;
  padding: 1rem;
  padding-bottom: 4rem;
}


.header {
  position: relative;
  text-align: center;
  margin-bottom: 1rem;
}


.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  width: 32px;  
  height: 32px;  
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-img {
  width: 24px;     
  height: 24px;    
  transition: opacity 0.2s ease;
}
.back-img:hover {
  opacity: 0.7;
}


.title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: bold;
  line-height: 32px; 
}

.card {
  background: #ededed;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.field {
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}
.field label {
  font-weight: bold;
  display: inline-block;
  margin-bottom: 0.25rem;
}
.field.description {
  max-height: 300px;
  overflow-y: auto;
}
.field.description p {
  margin: 0.5rem 0 0;
  line-height: 1.4;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
}
.carousel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0;
}
.arrow {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  padding: 0 0.5rem;
}
.arrow:disabled {
  opacity: 0.3;
  cursor: default;
}
.slide {
  flex: 1;
  text-align: center;
}
.anexo-img {
  max-width: 100%;
  border-radius: 0.5rem;
}
.anexo-nome {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #555;
}
.map {
  width: 100%;
  height: 200px;
  margin: 0 0 1rem;
  border-radius: 0.75rem;
}
.download-btn {
  width: 100%;
  color: #fff;
  font-weight: bold;
  padding: 0.75rem;
  border: 1px solid #fff;
  border-radius: 0.75rem;
  background-color: #4caf50;
  font-size: 1rem;
  cursor: pointer;
}
.not-found {
  text-align: center;
  color: #999;
  margin-top: 2rem;
}
</style>
