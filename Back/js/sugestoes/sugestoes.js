document.addEventListener("DOMContentLoaded", function () {
    function carregarSugestoes() {
        return JSON.parse(localStorage.getItem("sugestoes")) || [];
    }

    function guardarSugestoes(sugestoes) {
        localStorage.setItem("sugestoes", JSON.stringify(sugestoes));
    }

    function renderSugestoes(containerId, lista, mostrarCampo, tipo) {
        const container = document.getElementById(containerId);
        container.innerHTML = "";

        if (lista.length === 0) {
            container.innerHTML = `<p class="text-muted">Nenhuma sugestão disponível.</p>`;
            return;
        }

        lista.forEach((s, index) => {
            const card = document.createElement("div");
            card.className = "card shadow mb-3";
            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${s.nome} <small class="text-muted float-right">${s.data}</small></h5>
                    <p class="mb-1"><strong>${mostrarCampo}:</strong> ${s[mostrarCampo.toLowerCase()]}</p>
                    <p class="card-text">${s.texto}</p>
                    <div class="text-right">
                        <button class="btn btn-sm btn-outline-danger eliminar-sugestao" data-index="${index}" data-tipo="${tipo}">Eliminar</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function atualizarRender() {
        const todasSugestoes = carregarSugestoes();
        const sugestoesUtilizadores = todasSugestoes.filter(s => s.tipo === "utilizador");
        const sugestoesPeritos = todasSugestoes.filter(s => s.tipo === "perito");

        renderSugestoes("sugestoesUtilizadores", sugestoesUtilizadores, "Email", "utilizador");
        renderSugestoes("sugestoesPeritos", sugestoesPeritos, "Assunto", "perito");
    }

    // Delegação de evento para remover sugestão
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('eliminar-sugestao')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            const tipo = e.target.getAttribute('data-tipo');

            let todasSugestoes = carregarSugestoes();
            const listaFiltrada = todasSugestoes.filter(s => s.tipo === tipo);

            // Remove pelo índice dentro da lista filtrada
            const sugestaoRemovida = listaFiltrada[index];
            todasSugestoes = todasSugestoes.filter(s => s !== sugestaoRemovida);

            guardarSugestoes(todasSugestoes);
            atualizarRender();
        }
    });

    atualizarRender();
});
