<template>
  <div class="sugestoes-container">
    <section class="sugestoes-card">
      <h2 class="card-title">Sugestões</h2>
      <form @submit.prevent="handleSubmit" class="sugestoes-form">
        <div class="field">
          <label for="subject" class="field-label">Assunto</label>
          <input
            id="subject"
            v-model="subject"
            type="text"
            class="field-input"
            required
          />
        </div>

        <div class="field">
          <label for="suggestion" class="field-label">A sua sugestão</label>
          <textarea
            id="suggestion"
            v-model="suggestion"
            class="field-textarea"
            required
          ></textarea>
        </div>

        <button type="submit" class="submit-btn">Submeter</button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// obtém perito logado do localStorage
const peritoLogado = JSON.parse(localStorage.getItem('peritoLogado') || '{}')
const meuNome = peritoLogado.nome || ''

const subject = ref('')
const suggestion = ref('')

function handleSubmit() {
  // recupera array de sugestões do localStorage
  const stored = localStorage.getItem('sugestoes')
  let lista = []
  try {
    lista = stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('Erro ao ler sugestões:', e)
    lista = []
  }

  // adiciona nova sugestão com perito e timestamp
  const novaSugestao = {
    tipo:"perito",
    nome: meuNome,
    assunto: subject.value,
    texto: suggestion.value,
    data: new Date().toISOString()
  }
  lista.push(novaSugestao)

  // grava de volta no localStorage
  try {
    localStorage.setItem('sugestoes', JSON.stringify(lista))
    alert('Sugestão submetida com sucesso!')
  } catch (e) {
    console.error('Erro ao salvar sugestões:', e)
    alert('Ocorreu um erro ao submeter a sugestão.')
  }


  subject.value = ''
  suggestion.value = ''
}
</script>

  
  <style scoped>
  .sugestoes-container {
    font-family: Verdana;
    max-width: 400px;
    margin: 0 auto;
    padding: 1rem;
    background: #f5f5f5;
    min-height: 100vh;
    box-sizing: border-box;
  }
  
  .sugestoes-card {
    background: #fff;
    border-radius: 1rem;
    padding: 1.5rem;
    margin-top: 9rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  .card-title {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 3rem; /* espaçamento aumentado entre título e assunto */
  }
  
  .sugestoes-form .field {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }
  
  .field-label {
    font-size: 1rem;
    margin-bottom: 0.25rem;
    color: #555;
  }
  
  .field-input,
  .field-textarea {
    border: none;
    border-bottom: 1px solid #ccc;
    padding: 0.5rem 0;
    font-size: 1rem;
    outline: none;
    resize: none;
  }
  
  .field-textarea {
    min-height: 80px;
  }
  
  .submit-btn {
    width: 100%;
    background: #4caf50;
    color: #fff;
    border: none;
    border-radius: 9999px;
    padding: 0.75rem;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .submit-btn:hover {
    background: #45a049;
  }
  </style>