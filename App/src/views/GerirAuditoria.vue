<template>
  <div class="gerir-container">
    <button class="back-btn" @click="$router.back()">
        <img
          src="@/assets/back-arrow-icon.png"
          alt="Voltar"
          class="back-img"
        />
    </button>

    <div class="card">
      <h2 class="card-title">Gerir Auditoria</h2>

      <!-- Tipo exibido apenas -->
      <div class="field">
        <label>Tipo:</label>
        <span>{{ auditoria.tipo }}</span>
      </div>

      <!-- Data de início com três inputs -->
      <div class="field date-start">
        <label>Data de início:</label>
        <div class="inputs-date">
          <input
            type="number"
            v-model="dia"
            placeholder="Dia"
            min="1"
            max="31"
          />
          <input
            type="number"
            v-model="mes"
            placeholder="Mês"
            min="1"
            max="12"
          />
          <input
            type="number"
            v-model="ano"
            placeholder="Ano"
            min="2000"
            class="input-year"
          />
        </div>
      </div>

      <!-- Descrição -->
      <div class="field description">
        <label>Descrição:</label>
        <textarea v-model="auditoria.descricao" rows="6"></textarea>
      </div>

      <!-- Materiais a utilizar -->
      <div class="field materials">
        <label>Materiais a utilizar:</label>

        <div class="material-row">
          <div class="custom-select-wrapper">
            <select v-model="novoMaterial.nome" class="custom-select">
              <option disabled value="">Selecione...</option>
              <option
                v-for="mat in materiaisDisponiveis"
                :key="mat.nome"
                :value="mat.nome"
              >
                {{ mat.nome }} (disp.: {{ mat.quantidadeDisponivel }} {{ mat.unidade }})
              </option>
            </select>
            <svg class="select-arrow" viewBox="0 0 10 6" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0l5 6 5-6z"/>
            </svg>
          </div>

          <div class="material-controls">
            <button
              @click.prevent="decrementQty"
              class="btn-small"
              :disabled="novoMaterial.quantidade <= 1"
            >－</button>
            <input
              type="number"
              v-model.number="novoMaterial.quantidade"
              class="material-qty"
              :min="1"
              :max="maxQuantidade"
            />
            <button
              @click.prevent="incrementQty"
              class="btn-small"
              :disabled="novoMaterial.quantidade >= maxQuantidade"
            >＋</button>
          </div>
        </div>

        <button
          class="btn-add-mat"
          @click="saveMaterial"
          :disabled="!novoMaterial.nome || novoMaterial.quantidade < 1"
        >
          Adicionar material
        </button>

        <ul class="materials-list">
          <li
            v-for="(m, i) in auditoria.materiais"
            :key="i"
            class="material-item"
          >
            <span class="item-name">{{ m.nome + " " }} </span>
            <span class="item-qty">{{ m.quantidade }} {{ m.unidade }}</span>
            <button class="btn-delete" @click="removeMaterialAt(i)">✕</button>
          </li>
        </ul>
      </div>

      <!-- Upload de ficheiros -->
      <div class="field upload">
        <label>Upload ficheiros:</label>
        <div class="upload-box">
          Clique para anexar
          <input type="file" multiple @change="onFiles" />
        </div>
        <ul class="materials-list" v-if="auditoria.anexos.length">
          <li v-for="(anexo, i) in auditoria.anexos" :key="i">
            {{ anexo.name }}
          </li>
        </ul>
      </div>

      <!-- Botões finais -->
      <div class="actions">
        <button class="btn-finish" @click="finish">Terminar auditoria</button>
        <button class="btn-save" @click="save">Guardar auditoria</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Estado da auditoria
const auditoria = ref({
  id: null,
  tipo: '',
  descricao: '',
  materiais: [],
  anexos: [],
  estado: 'em curso'
})
const dia = ref('')
const mes = ref('')
const ano = ref('')

// Novo material
const novoMaterial = ref({ nome: '', preco: "", quantidade: 1, unidade: '' })
// Materiais disponíveis
const materiaisDisponiveis = ref([])

onMounted(() => {
  // Carregar estoque de materiais
  const rawMateriais = localStorage.getItem('materiais')
  if (rawMateriais) {
    try {
      const arr = JSON.parse(rawMateriais)
      materiaisDisponiveis.value = arr.map(m => ({
        nome: m.nome,
        preco: m.preco,
        unidade: m.unidade,
        quantidadeDisponivel: m.quantidade
      }))
    } catch (e) {
      console.error('Erro ao parsear materiais do localStorage:', e)
    }
  }

  // Carregar auditoria existente
  const rawOc = localStorage.getItem('ocorrencias')
  if (!rawOc) return
  try {
    const arr = JSON.parse(rawOc)
    const idParam = Number(route.params.id)
    const found = arr.find(o => o.id === idParam)
    if (found) {
      auditoria.value = {
        id:        found.id,
        tipo:      found.tipo,
        descricao: found.descricao || '',
        materiais: found.materiais || [],
        anexos:    found.anexos || [],
        estado:    found.estado || 'em curso'
      }
      if (found.dataHora) {
        const d = new Date(found.dataHora)
        dia.value = String(d.getDate())
        mes.value = String(d.getMonth() + 1)
        ano.value = String(d.getFullYear())
      }
    }
  } catch (e) {
    console.error('Erro ao parsear ocorrências:', e)
  }
})

// Máximo disponível para o material selecionado
const maxQuantidade = computed(() => {
  const sel = materiaisDisponiveis.value.find(
    m => m.nome === novoMaterial.value.nome
  )
  if (sel) {
    novoMaterial.value.unidade = sel.unidade
    return sel.quantidadeDisponivel
  }
  novoMaterial.value.unidade = ''
  return 1
})

// Incrementa/decrementa quantidade
function incrementQty() {
  if (novoMaterial.value.quantidade < maxQuantidade.value) {
    novoMaterial.value.quantidade++
  }
}
function decrementQty() {
  if (novoMaterial.value.quantidade > 1) {
    novoMaterial.value.quantidade--
  }
}

// Adiciona material à auditoria e ajusta estoque
function saveMaterial() {
  if (
    !novoMaterial.value.nome ||
    novoMaterial.value.quantidade < 1 ||
    novoMaterial.value.quantidade > maxQuantidade.value
  ) return

  auditoria.value.materiais.push({ ...novoMaterial.value })

  // Decrementar do estoque e persistir
  const idx = materiaisDisponiveis.value.findIndex(
    m => m.nome === novoMaterial.value.nome
  )
  if (idx !== -1) {
    materiaisDisponiveis.value[idx].quantidadeDisponivel -=
      novoMaterial.value.quantidade
    localStorage.setItem(
      'materiais',
      JSON.stringify(
        materiaisDisponiveis.value.map(m => ({
          nome: m.nome,
          preco: m.preco,
          quantidade: m.quantidadeDisponivel,
          unidade: m.unidade
        }))
      )
    )
  }

  novoMaterial.value = { nome: '', quantidade: 1, unidade: '' }
}

// Remove material e devolve ao estoque
function removeMaterialAt(i) {
  const mat = auditoria.value.materiais[i]
  const idx = materiaisDisponiveis.value.findIndex(m => m.nome === mat.nome)
  if (idx !== -1) {
    materiaisDisponiveis.value[idx].quantidadeDisponivel += mat.quantidade
    localStorage.setItem(
      'materiais',
      JSON.stringify(
        materiaisDisponiveis.value.map(m => ({
          nome: m.nome,
          preco: m.preco,
          quantidade: m.quantidadeDisponivel,
          unidade: m.unidade
        }))
      )
    )
  }
  auditoria.value.materiais.splice(i, 1)
}

// Upload de anexos: lê cada ficheiro como base64 e adiciona ao array existente
async function onFiles(e) {
  const files = Array.from(e.target.files)
  const anexosNovos = []
  for (const file of files) {
    const data = await new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(file)
    })
    anexosNovos.push({ name: file.name, data })
  }
  auditoria.value.anexos = [...auditoria.value.anexos, ...anexosNovos]
}

// Constrói data ISO a partir de dia/mes/ano
function isoDataInicio() {
  if (!dia.value || !mes.value || !ano.value) return auditoria.value.dataHora
  return new Date(ano.value, mes.value - 1, dia.value).toISOString()
}

// Persiste auditoria no localStorage preservando campos não editados
function persistirAuditoria(novoEstado = null) {
  const arr = JSON.parse(localStorage.getItem('ocorrencias') || '[]')
  const idx = arr.findIndex(o => o.id === auditoria.value.id)

  let merged
  if (idx >= 0) {
    const existing = arr[idx]
    merged = {
      ...existing,
      ...auditoria.value,
      dataHora: isoDataInicio(),
      estado: novoEstado ?? auditoria.value.estado
    }
    arr[idx] = merged
  } else {
    auditoria.value.id = Date.now()
    merged = {
      ...auditoria.value,
      dataHora: isoDataInicio(),
      estado: novoEstado ?? auditoria.value.estado
    }
    arr.push(merged)
  }

  localStorage.setItem('ocorrencias', JSON.stringify(arr))
}

// Salvar auditoria (mantém estado atual)
function save() {
  persistirAuditoria()
  router.back()
}

// Terminar auditoria (define estado como finalizada)
function finish() {
  auditoria.value.estado = 'finalizada'
  persistirAuditoria('finalizada')
  router.push('/auditorias')
}
</script>

<style scoped>
/* estilos mantidos igual */
.gerir-container {
  font-family: Verdana;
  background: #f5f5f5;
  min-height: 100vh;
  padding: 1rem;
  padding-bottom: 6rem;
}
.back-btn {
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
  font-size: 1rem;
}
.card {
  background: #fff;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin-top: 0rem;
}
.card-title {
  background: #ffffff;
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
.field {
  background: #f5f5f5;
  border-radius: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
}
.field label {
  font-weight: bold;
  display: block;
  margin-bottom: 0.5rem;
}
.date-start .inputs-date {
  display: flex;
  gap: 0.5rem;
}
.date-start .inputs-date input {
  box-sizing: border-box;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  flex: none;
}
.date-start .inputs-date input:nth-child(1),
.date-start .inputs-date input:nth-child(2) {
  width: 3rem;
}
.date-start .inputs-date .input-year {
  flex: 1;
  width: 6rem;
}
.description textarea {
  width: 100%;
  border: 1px solid #000;
  text-size-adjust: 120%;
  border-radius: 0.75rem;
  padding: 0.5rem;
  box-sizing: border-box;
}
.materials .material-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.custom-select-wrapper {
  position: relative;
  width: 100%;
}
.custom-select {
  appearance: none;
  width: 100%;
  padding: 0.6rem 1.5rem 0.6rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  background: #fff;
  font-size: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  transition: border-color 0.2s;
  cursor: pointer;
}
.custom-select:focus {
  outline: none;
  border-color: #2ecc71;
}
.select-arrow {
  position: absolute;
  top: 50%;
  right: 0.8rem;
  width: 1rem;
  pointer-events: none;
  transform: translateY(-50%);
  fill: #666;
  transition: fill 0.2s;
}
.material-controls {
  display: flex;
  gap: 0.5rem;
}
.material-qty {
  width: 4rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  text-align: center;
}
.btn-small {
  width: 2rem;
  height: 2rem;
  border: none;
  background: #eee;
  cursor: pointer;
}
.btn-add-mat {
  margin-top: 0.5rem;
  margin-left: 0.6rem;
  background: #2ecc71;
  color: #fff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}
.materials-list,
.materials-list li {
  list-style: none;
  padding: 0;
}
.materials-list li {
  background: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  margin-bottom: 0.5rem;
}
.btn-delete {
  background: none;
  border: none;
  color: #c0392b;
  font-size: 1rem;
  cursor: pointer;
}
.upload-box {
  border: 2px dashed #ccc;
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  position: relative;
  cursor: pointer;
}
.upload-box input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}
.actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
.btn-finish {
  flex: 1;
  background: #c0392b;
  color: #fff;
  padding: 0.75rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
}
.btn-save {
  flex: 1;
  background: #27ae60;
  color: #fff;
  padding: 0.75rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
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
.back-img {
  width: 24px;     
  height: 24px;    
  transition: opacity 0.2s ease;
}
.back-img:hover {
  opacity: 0.7;
}
</style>