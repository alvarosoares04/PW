document.addEventListener("DOMContentLoaded", function () {
    const peritos = JSON.parse(localStorage.getItem("peritos")) || [];
    const todasOcorrencias = JSON.parse(localStorage.getItem("ocorrencias")) || [];
    const ocorrencias = todasOcorrencias.filter(o => o.estado === "em_tratamento");

    const tbody = document.getElementById("ocorrenciasBody");

    function preencherTabela() {
        tbody.innerHTML = "";

        const horaInicio = document.getElementById("filtroHoraInicio").value;
        const horaFim = document.getElementById("filtroHoraFim").value;

        ocorrencias.forEach((o) => {
            const data = o.dataHora.split("T")[0];
            const hora = o.dataHora.split("T")[1].substring(0, 5); // formato HH:mm

            let dentroIntervalo = true;
            if (horaInicio && horaFim) {
                dentroIntervalo = hora >= horaInicio && hora <= horaFim;
            } else if (horaInicio) {
                dentroIntervalo = hora >= horaInicio;
            } else if (horaFim) {
                dentroIntervalo = hora <= horaFim;
            }

            if (!dentroIntervalo) return; // pula esta linha

            const row = document.createElement("tr");

            const peritoObj = peritos.find(p => p.nome === o.perito);
            const perito = peritoObj
                ? `${peritoObj.nome} (${peritoObj.especializacao || peritoObj.papel})`
                : "<span class='text-muted'>Não atribuído</span>";

            const estadoTexto = `${o.gravidade} - ${['Baixa', 'Moderada', 'Considerável', 'Alta', 'Crítica'][o.gravidade - 1]}`;

            row.innerHTML = `
                <td>${o.tipo}</td>
                <td>${o.rua}</td>
                <td>${data} ${hora}</td>
                <td>${perito}</td>
                <td>${estadoTexto}</td>
                <td><button class="btn btn-info btn-sm" onclick="abrirDetalhes(${o.id})">Detalhes</button></td>
            `;

            tbody.appendChild(row);
        });
    }

    window.abrirDetalhes = function (id) {
        const o = todasOcorrencias.find(o => o.id === id);
        if (!o) return;

        const materiaisHTML = o.materiais?.length
            ? o.materiais.map(m => `<li>${m.nome}: ${m.quantidade}</li>`).join("")
            : "<li>Nenhum material associado</li>";

        const peritoHTML = o.perito
            ? `<p><strong>Perito:</strong> ${o.perito}</p>`
            : `<p><em>Perito não atribuído</em></p>`;

        document.getElementById("conteudoDetalhes").innerHTML = `
            <p><strong>Tipo:</strong> ${o.tipo}</p>
            <p><strong>Descrição:</strong> ${o.descricao}</p>
            <p><strong>Data:</strong> ${o.dataHora.split("T")[0]}</p>
            <p><strong>Hora:</strong> ${o.dataHora.split("T")[1].substring(0,5)}</p>
            <p><strong>Rua:</strong> ${o.rua}</p>
            <p><strong>Código Postal:</strong> ${o.codigoPostal}</p>
            ${peritoHTML}
            <p><strong>Materiais:</strong></p>
            <ul>${materiaisHTML}</ul>
        `;

        $('#modalDetalhes').modal('show');
    };

    // Inicial preencher a tabela
    preencherTabela();

    // Filtros de hora usando flatpickr
    flatpickr("#filtroHoraInicio", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        allowInput: false,
        onChange: preencherTabela
    });

    flatpickr("#filtroHoraFim", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        allowInput: false,
        onChange: preencherTabela
    });
});
