<template>
  <div class="auditorias-container">
    <section class="auditorias-card">
      <h2 class="card-title">Auditorias</h2>

      <div class="filters">
        <div class="filter">
          <label for="filter-tipo">Tipo</label>
          <select id="filter-tipo" v-model="filterTipo">
            <option value="">Todos</option>
            <option v-for="tipo in tipos" :key="tipo" :value="tipo">
              {{ tipo }}
            </option>
          </select>
        </div>
        <div class="filter">
          <label for="filter-estado">Estado</label>
          <select id="filter-estado" v-model="filterEstado">
            <option value="">Todos</option>
            <option value="Pendente">Pendente</option>
            <option value="Em Progresso">Em Progresso</option>
          </select>
        </div>
      </div>

      <ul class="audit-list">
        <li
          v-for="item in visibleItems"
          :key="item.id"
          class="audit-item"
          @click="goToGerir(item.id)"
        >
          <span class="item-tipo">{{ item.nome }}</span>
          <span class="item-status" :title="item.estadoView">
            {{ item.estadoView === 'Pendente' ? '🔴' : '🟡' }}
          </span>
          <router-link
            :to="{ name: 'VerOcorrencia', params: { id: item.id } }"
            class="btn-ver-link"
            @click.stop
          >
            <button class="btn-ver">Ver</button>
          </router-link>
        </li>
      </ul>

      <button
        class="load-more"
        @click="loadMore"
        :disabled="visibleItems.length >= filteredItems.length"
      >
        Mostrar mais
      </button>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// filtros
const filterTipo   = ref('')
const filterEstado = ref('')
const displayCount = ref(5)

// só estes estados brutos são exibidos
const rawPermitidos = ['Em Progresso', 'Pendente', 'Em Progresso', 'em_tratamento']

// perito logado
const peritoLogado = JSON.parse(localStorage.getItem('peritoLogado') || '{}')
const meuNome      = peritoLogado.nome || ''

// lista carregada (sem mutação de storage)
const ocorrencias = ref([])

// converte raw.estado em rótulo de exibição
function mapEstadoView(raw) {
  if (raw === 'Em Progresso' || raw === 'Em Progresso') return 'Em Progresso'
  return 'Pendente'
}

onMounted(() => {
  const raw = localStorage.getItem('ocorrencias')
  if (!raw) return

  try {
    const arr = JSON.parse(raw)
      // só pega as do perito
      .filter(o => o.perito === meuNome)
      // anexa estadoView mas NÃO grava de volta em localStorage
      .map(o => ({
        ...o,
        estadoView: mapEstadoView(
          // normaliza também 'em_tratamento' como 'Pendente'
          o.estado === 'em_tratamento' ? 'Pendente' : o.estado
        )
      }))

    ocorrencias.value = arr
  } catch (e) {
    console.error('Erro ao carregar ocorrências:', e)
  }
})

// dropdown de tipos
const tipos = computed(() =>
  Array.from(new Set(ocorrencias.value.map(o => o.tipo)))
)

// aplica filtro de estado bruto + filtros de UI
const filteredItems = computed(() =>
  ocorrencias.value
    .filter(o => rawPermitidos.includes(
      // para comparação, use o.estado normalizado em estadoView
      o.estado === 'em_tratamento' ? 'Pendente' : o.estado
    ))
    .filter(o =>
      filterTipo.value ? o.tipo === filterTipo.value : true
    )
    .filter(o =>
      filterEstado.value ? o.estadoView === filterEstado.value : true
    )
)

// paginação
const visibleItems = computed(() =>
  filteredItems.value.slice(0, displayCount.value)
)
function loadMore() {
  displayCount.value = Math.min(
    displayCount.value + 5,
    filteredItems.value.length
  )
}

// ao clicar, atualiza só o storage e vai para GerirAuditoria
function goToGerir(id) {
  const raw = localStorage.getItem('ocorrencias')
  if (raw) {
    try {
      const arr = JSON.parse(raw).map(o =>
        o.id === id
          ? { ...o, estado: 'Em Progresso' }
          : o
      )
      localStorage.setItem('ocorrencias', JSON.stringify(arr))
    } catch (e) {
      console.error('Erro ao atualizar estado:', e)
    }
  }

  // atualiza só a visão atual (para refletir badge amarelo)
  const idx = ocorrencias.value.findIndex(o => o.id === id)
  if (idx !== -1) {
    ocorrencias.value[idx].estadoView = 'Em Progresso'
  }

  router.push({ name: 'GerirAuditoria', params: { id } })
}
</script>


<style scoped>
.auditorias-container {
  font-family: Verdana;
  max-width: 400px;
  margin: 0 auto;
  padding: 1rem;
  background: #f5f5f5;
  min-height: 100vh;
  box-sizing: border-box;
}

.auditorias-card {
  background: #fff;
  border-radius: 1rem;
  margin-top: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.card-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.filter label {
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
  color: #555;
}

.filter select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  outline: none;
}

.audit-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.audit-item {
  background: #f9f9f9;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.audit-item:hover {
  background: rgba(0,0,0,0.03);
}

.item-status {
  font-size: 1.2rem;
  line-height: 1;
  margin-right: 0.75rem;
}

.item-tipo {
  flex: 1;
  font-size: 1rem;
  color: #222;
}

.btn-ver-link {
  margin-left: 1rem;
  text-decoration: none;
}

.btn-ver {
  padding: 0.25rem 0.75rem;
  border: 1px solid #199700;
  background: #fff;
  color: #199700;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-ver:hover {
  background: #007bff;
  color: #fff;
}

.load-more {
  margin-top: 1rem;
  width: 100%;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 1rem;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
}

.load-more:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.back-btn {
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
  font-size: 1rem;
}
</style>
