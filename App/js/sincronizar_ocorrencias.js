// sincronizar_ocorrencias.js (versão completa)

// Obter lista de ocorrências do localStorage
function obterOcorrencias() {
    return JSON.parse(localStorage.getItem("ocorrencias")) || [];
  }
  
  // Guardar lista de ocorrências no localStorage
  function guardarOcorrencias(lista) {
    localStorage.setItem("ocorrencias", JSON.stringify(lista));
  }
  
  // Adicionar nova ocorrência
  function adicionarOcorrencia(nova) {
    let lista = obterOcorrencias();
    const contador = parseInt(localStorage.getItem("ocorrenciasCounter")) || 1;
    nova.id = contador;
    nova.estado = "inicial";
    nova.dataHora = new Date().toISOString();
  
    lista.push(nova);
    guardarOcorrencias(lista);
  
    localStorage.setItem("ocorrenciasCounter", contador + 1);
  }
  
  // Atualizar estado da ocorrência (aceite, rejeitada, etc.)
  function atualizarEstadoOcorrencia(id, novoEstado) {
    let lista = obterOcorrencias();
    const index = lista.findIndex(o => o.id === id);
    if (index !== -1) {
      lista[index].estado = novoEstado;
      guardarOcorrencias(lista);
    }
  }
  
  // Listar todas as ocorrências com callback para renderização
  function listarOcorrencias(callback) {
    const lista = obterOcorrencias();
    callback(lista);
  }
  
  // Listar por estado específico (ex: 'inicial', 'aceite')
  function listarOcorrenciasPorEstado(estado, callback) {
    const lista = obterOcorrencias();
    const filtradas = lista.filter(o => o.estado === estado);
    callback(filtradas);
  }
  
  // Excluir ocorrência (opcional)
  function removerOcorrencia(id) {
    let lista = obterOcorrencias();
    lista = lista.filter(o => o.id !== id);
    guardarOcorrencias(lista);
  }
  
  function guardarMateriais() {
    localStorage.setItem("materiais", JSON.stringify(materiais));
  }
  
  function carregarMateriais() {
    materiais = JSON.parse(localStorage.getItem("materiais")) || [];
  }
  