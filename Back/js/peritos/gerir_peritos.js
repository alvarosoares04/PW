document.addEventListener("DOMContentLoaded", function () {
    const tabela = document.getElementById("corpoTabelaPeritos");

    function obterPeritos() {
      return JSON.parse(localStorage.getItem("peritos")) || [];
    }

    function guardarPeritos(lista) {
      localStorage.setItem("peritos", JSON.stringify(lista));
    }

    let peritos = obterPeritos();

    function carregarTabela() {
      tabela.innerHTML = "";
      peritos.forEach((perito, index) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${perito.nome}</td>
            <td>${perito.especializacao || ""}</td>
            <td class="text-center">
                <button class="btn btn-warning btn-sm" onclick="editarPerito(${index})">
                <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="removerPerito(${index})">
                <i class="fas fa-trash-alt"></i> Excluir
                </button>
            </td>
            `;

        tabela.appendChild(row);
      });
    }

    window.removerPerito = function (index) {
      if (confirm("Tem certeza que deseja excluir este perito?")) {
        peritos.splice(index, 1);
        guardarPeritos(peritos);
        carregarTabela();
      }
    };

    window.editarPerito = function (index) {
    const perito = peritos[index];

    document.getElementById("editId").value = index;
    document.getElementById("editNome").value = perito.nome;

    // Predefinir o papel/especialização
    const editPapelSelect = document.getElementById("editPapel");
        if (editPapelSelect) {
            editPapelSelect.value = perito.especializacao || "";
        }

    $("#modalEditarPerito").modal("show");
};


    document.getElementById("formEditarPerito").addEventListener("submit", function (event) {
      event.preventDefault();
      const index = document.getElementById("editId").value;
      peritos[index].nome = document.getElementById("editNome").value;
      peritos[index].especializacao = document.getElementById("editPapel").value;
      guardarPeritos(peritos);
      carregarTabela();
      $("#modalEditarPerito").modal("hide");
    });

    carregarTabela();
  });