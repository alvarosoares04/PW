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

            const statusBtnClasse = perito.status === "ativo" ? "btn-success" : "btn-danger";
            const statusBtnTexto = perito.status === "ativo" ? "Ativo" : "Inativo";

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${perito.nome}</td>
                <td>${perito.especializacao || ""}</td>
                <td class="text-center">
                    <button class="btn ${statusBtnClasse} btn-sm" onclick="alternarStatusPerito(${index})">
                        ${statusBtnTexto}
                    </button>
                </td>
            `;

            tabela.appendChild(row);
        });
    }

    window.alternarStatusPerito = function (index) {
        peritos[index].status = peritos[index].status === "ativo" ? "inativo" : "ativo";
        guardarPeritos(peritos);
        carregarTabela();
    };

    carregarTabela();
});
