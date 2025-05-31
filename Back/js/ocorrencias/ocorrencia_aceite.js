$(document).ready(function () {
    preencherTabelaComAceites();

    function preencherTabelaComAceites() {
        const ocorrencias = JSON.parse(localStorage.getItem("ocorrencias")) || [];
        const tbody = $("#ocorrenciasBody");
        tbody.empty();

        ocorrencias
            .filter(o => o.estado?.toLowerCase() === "aceite")
            .forEach(o => {
                const dataHora = new Date(o.dataHora);
                const data = dataHora.toISOString().split("T")[0];
                const hora = dataHora.toTimeString().substring(0, 5);
                const perito = o.perito || "";
                const materiais = (o.materiais || []).join(", ");

                const tr = $(`
                    <tr>
                        <td>${o.tipo}</td>
                        <td>${data}</td>
                        <td>${hora}</td>
                        <td>${perito}</td>
                        <td>${materiais}</td>
                        <td>
                            <button class="btn btn-info btn-sm ver-detalhes">Ver</button>
                        </td>
                    </tr>
                `);

                tr.find(".ver-detalhes").on("click", function () {
                    const peritoObjetos = JSON.parse(localStorage.getItem("peritos")) || [];
                    const peritosAtivos = peritoObjetos 
                        .filter(p => p.status?.toLowerCase() === "ativo")
                        .map(p => p.nome);


                    const materiaisObjetos = JSON.parse(localStorage.getItem("materiais")) || [];
                    const materiaisDisponiveis = materiaisObjetos.map(m => m.nome);

                    const peritoSelect = `
                        <select id="selecionarPerito" class="form-control mb-3">
                            ${peritosAtivos.map(p => `<option ${p === perito ? 'selected' : ''}>${p}</option>`).join("")}
                        </select>
                    `;

                    const materiaisCheckboxes = materiaisDisponiveis.map(mat => `
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="${mat}" id="mat-${mat}" ${materiais.includes(mat) ? "checked" : ""}>
                            <label class="form-check-label" for="mat-${mat}">${mat}</label>
                        </div>
                    `).join("");

                    $("#conteudoEditarOcorrencia").html(`
                        <p><strong>Tipo:</strong> ${o.tipo}</p>
                        <p><strong>Data:</strong> ${data}</p>
                        <p><strong>Hora:</strong> ${hora}</p>
                        <p><strong>Rua:</strong> ${o.rua}</p>
                        <hr>
                        <label><strong>Selecionar Perito:</strong></label>
                        ${peritoSelect}
                        <label class="mt-3"><strong>Selecionar Materiais:</strong></label>
                        ${materiaisCheckboxes}
                        <div class="mt-3">
                            <button class="btn btn-success" id="guardarAlteracoes">Guardar Alterações</button>
                            <button class="btn btn-warning ml-2" id="marcarEmTratamento">Marcar como Ativa</button>
                        </div>
                    `);

                    const modal = new bootstrap.Modal(document.getElementById("modalEditarOcorrencia"));
                    modal.show();

                    $("#guardarAlteracoes").off("click").on("click", function () {
                        const peritoSelecionado = $("#selecionarPerito").val();
                        const materiaisSelecionados = [];
                        $("input.form-check-input:checked").each(function () {
                            materiaisSelecionados.push($(this).val());
                        });

                        o.perito = peritoSelecionado;
                        o.materiais = materiaisSelecionados;

                        const ocorrenciasAtualizadas = JSON.parse(localStorage.getItem("ocorrencias")) || [];
                        const index = ocorrenciasAtualizadas.findIndex(oc =>
                            oc.dataHora === o.dataHora && oc.rua === o.rua && oc.tipo === o.tipo
                        );

                        if (index !== -1) {
                            ocorrenciasAtualizadas[index] = o;
                            localStorage.setItem("ocorrencias", JSON.stringify(ocorrenciasAtualizadas));
                            alert("Alterações guardadas!");
                            preencherTabelaComAceites();
                            modal.hide();
                        }
                    });

                    $("#marcarEmTratamento").off("click").on("click", function () {
                        const ocorrenciasAtualizadas = JSON.parse(localStorage.getItem("ocorrencias")) || [];
                        const index = ocorrenciasAtualizadas.findIndex(oc =>
                            oc.dataHora === o.dataHora && oc.rua === o.rua && oc.tipo === o.tipo
                        );

                        if (index !== -1) {
                            ocorrenciasAtualizadas[index].estado = "em_tratamento";
                            localStorage.setItem("ocorrencias", JSON.stringify(ocorrenciasAtualizadas));
                            alert("Ocorrência movida para Auditorias Ativas!");
                            preencherTabelaComAceites();
                            modal.hide();
                        }
                    });
                });

                tbody.append(tr);
            });

        preencherFiltroPeritos();
    }

    function preencherFiltroPeritos() {
        const nomes = new Set();

        $('#ocorrenciasBody tr').each(function () {
            const nome = $(this).find('td:eq(3)').text().trim();
            if (nome) nomes.add(nome);
        });

        const filtro = $('#filtroPerito');
        filtro.empty().append('<option value="">Filtrar por Perito</option>');

        Array.from(nomes).sort().forEach(function (nome) {
            filtro.append(`<option value="${nome}">${nome}</option>`);
        });
    }

    function aplicarFiltros() {
        const tipo = $('#filtroTipo').val().toLowerCase();
        const data = $('#filtroData').val();
        const horaInicio = $('#filtroHoraInicio').val();
        const horaFim = $('#filtroHoraFim').val();
        const perito = $('#filtroPerito').val().toLowerCase();

        $('#ocorrenciasBody tr').each(function () {
            const tds = $(this).find("td");
            const tipoLinha = tds.eq(0).text().toLowerCase();
            const dataLinha = tds.eq(1).text();
            const horaLinha = tds.eq(2).text(); // formato HH:mm
            const peritoLinha = tds.eq(3).text().toLowerCase();

            let mostrar = (!tipo || tipo === tipoLinha)
                && (!data || data === dataLinha)
                && (!perito || perito === peritoLinha);

            if (horaInicio && horaFim) {
                mostrar = mostrar && (horaLinha >= horaInicio && horaLinha <= horaFim);
            } else if (horaInicio) {
                mostrar = mostrar && (horaLinha >= horaInicio);
            } else if (horaFim) {
                mostrar = mostrar && (horaLinha <= horaFim);
            }

            $(this).toggle(mostrar);
        });
    }

    $('#filtroTipo, #filtroData, #filtroHora, #filtroPerito').on('change', aplicarFiltros);

    flatpickr("#filtroHoraInicio", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        allowInput: false,
        onChange: aplicarFiltros
    });

    flatpickr("#filtroHoraFim", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        allowInput: false,
        onChange: aplicarFiltros
    });
});
