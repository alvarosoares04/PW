document.addEventListener('DOMContentLoaded', function () {
    atualizarTabela();

    // Atualiza a tabela sempre que os filtros mudam
    document.getElementById("filtroHoraInicio").addEventListener("change", atualizarTabela);
    document.getElementById("filtroHoraFim").addEventListener("change", atualizarTabela);

    flatpickr("#filtroHoraInicio", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        allowInput: false,
        onChange: atualizarTabela
    });

    flatpickr("#filtroHoraFim", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        allowInput: false,
        onChange: atualizarTabela
    });
});

function obterOcorrencias() {
    return JSON.parse(localStorage.getItem('ocorrencias')) || [];
}

function atualizarEstadoOcorrencia(id, novoEstado) {
    const ocorrencias = obterOcorrencias();
    const index = ocorrencias.findIndex(o => o.id === id);
    if (index !== -1) {
        ocorrencias[index].estado = novoEstado;
        localStorage.setItem('ocorrencias', JSON.stringify(ocorrencias));
    }
}

function atualizarTabela() {
    const ocorrencias = obterOcorrencias();
    const tbody = document.getElementById("ocorrenciasBody");
    tbody.innerHTML = "";

    const horaInicio = document.getElementById("filtroHoraInicio").value;
    const horaFim = document.getElementById("filtroHoraFim").value;

    const pendentes = ocorrencias.filter(o => {
        if (o.estado !== "inicial") return false;

        const horaOcorrencia = o.dataHora.split("T")[1].substring(0, 5); // HH:mm

        let dentroIntervalo = true;
        if (horaInicio && horaFim) {
            dentroIntervalo = horaOcorrencia >= horaInicio && horaOcorrencia <= horaFim;
        } else if (horaInicio) {
            dentroIntervalo = horaOcorrencia >= horaInicio;
        } else if (horaFim) {
            dentroIntervalo = horaOcorrencia <= horaFim;
        }

        return dentroIntervalo;
    });

    pendentes.forEach(o => {
        const data = o.dataHora.split("T")[0];
        const hora = o.dataHora.split("T")[1].substring(0, 5);

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${o.tipo}</td>
            <td>${data}</td>
            <td>${hora}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="mostrarDetalhes('${o.id}')">
                    <i class="fas fa-info-circle"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.mostrarDetalhes = function (id) {
    const ocorrencias = obterOcorrencias();
    const o = ocorrencias.find(o => String(o.id) === String(id));
    if (!o) {
        alert("Ocorrência não encontrada.");
        return;
    }

    const anexosHtml = (o.anexos || []).map(anexo =>
        `<img src="${anexo.data}" class="img-fluid mb-2" alt="Imagem">`
    ).join("");

    document.getElementById("conteudoDetalhes").innerHTML = `
        <p><strong>Tipo:</strong> ${o.tipo}</p>
        <p><strong>Data:</strong> ${o.dataHora.split("T")[0]}</p>
        <p><strong>Hora:</strong> ${o.dataHora.split("T")[1].substring(0, 5)}</p>
        <p><strong>Rua:</strong> ${o.rua}</p>
        <p><strong>Código Postal:</strong> ${o.codigoPostal}</p>
        <p><strong>Descrição:</strong> ${o.descricao}</p>
        <div class="mb-3">
            ${anexosHtml || "<em>Sem anexos</em>"}
        </div>
        <div class="text-right">
            <button class="btn btn-success mr-2" onclick="aceitarOcorrencia('${o.id}')">Aceitar</button>
            <button class="btn btn-danger" onclick="rejeitarOcorrencia('${o.id}')">Rejeitar</button>
        </div>
    `;

    $('#detalhesModal').modal('show');
};

window.aceitarOcorrencia = function (id) {
    const ocorrencias = obterOcorrencias();
    const index = ocorrencias.findIndex(o => String(o.id) === String(id));
    if (index !== -1) {
        ocorrencias[index].estado = "aceite";
        localStorage.setItem('ocorrencias', JSON.stringify(ocorrencias));
        alert("Ocorrência aceita com sucesso!");
    } else {
        alert("Erro: ocorrência não encontrada.");
    }
    $('#detalhesModal').modal('hide');
    atualizarTabela();
};

window.rejeitarOcorrencia = function (id) {
    const ocorrencias = obterOcorrencias();
    const index = ocorrencias.findIndex(o => String(o.id) === String(id));
    if (index !== -1) {
        ocorrencias[index].estado = "rejeitada";
        localStorage.setItem('ocorrencias', JSON.stringify(ocorrencias));
        alert("Ocorrência rejeitada.");
    } else {
        alert("Erro: ocorrência não encontrada.");
    }
    $('#detalhesModal').modal('hide');
    atualizarTabela();
};
