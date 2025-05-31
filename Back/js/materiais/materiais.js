let materiais = [];

// Carregar materiais do localStorage ao iniciar
function carregarMateriais() {
    materiais = JSON.parse(localStorage.getItem("materiais")) || [];
    console.log("Materiais carregados:", materiais);
}

// Guardar materiais no localStorage
function guardarMateriais() {
    localStorage.setItem("materiais", JSON.stringify(materiais));
}

// Renderizar a tabela com os materiais
function renderTabela() {
    const tbody = document.querySelector('#tabelaMateriais tbody');
    tbody.innerHTML = '';

    materiais.forEach((mat, index) => {
        const row = `
            <tr>
                <td>${mat.nome}</td>
                <td>${mat.quantidade}</td>
                <td>${mat.unidade}</td>
                <td>€ ${mat.preco ? mat.preco.toFixed(2) : '0.00'}</td>
                <td>
                    <button class="btn btn-sm btn-warning mr-1" onclick="editarMaterial(${index})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="removerMaterial(${index})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Abrir modal para editar material
function editarMaterial(index) {
    const mat = materiais[index];
    document.getElementById('materialId').value = index;
    document.getElementById('nomeMaterial').value = mat.nome;
    document.getElementById('quantidade').value = mat.quantidade;
    document.getElementById('unidade').value = mat.unidade;
    document.getElementById('preco').value = mat.preco || 0;
    document.getElementById('modalLabel').innerText = 'Editar Material';
    $('#modalAdicionarMaterial').modal('show');
}

// Remover material
function removerMaterial(index) {
    if (confirm('Tem certeza que deseja excluir este material?')) {
        materiais.splice(index, 1);
        guardarMateriais();
        renderTabela();
    }
}

// Submissão do formulário para adicionar/editar
document.getElementById('formMaterial').addEventListener('submit', function (e) {
    e.preventDefault();

    const id = document.getElementById('materialId').value;
    const nome = document.getElementById('nomeMaterial').value;
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const unidade = document.getElementById('unidade').value;
    const preco = parseFloat(document.getElementById('preco').value);

    const material = { nome, quantidade, unidade, preco };

    if (id === '') {
        // Adicionar novo material
        materiais.push(material);
    } else {
        // Atualizar material existente
        materiais[id] = material;
    }

    guardarMateriais();
    $('#modalAdicionarMaterial').modal('hide');
    document.getElementById('formMaterial').reset();
    document.getElementById('materialId').value = '';
    document.getElementById('modalLabel').innerText = 'Adicionar Material';
    renderTabela();
});

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
    carregarMateriais();
    renderTabela();
});
