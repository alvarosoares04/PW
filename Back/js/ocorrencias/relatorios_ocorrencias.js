$(document).ready(function () {
    function carregarOcorrencias() {
        const todasOcorrencias = JSON.parse(localStorage.getItem("ocorrencias")) || [];
        const finalizadas = todasOcorrencias.filter(o => o.estado === "finalizada");

        const tbody = $('#dataTable tbody');
        tbody.empty();

        if (finalizadas.length === 0) {
            tbody.append('<tr><td colspan="6" class="text-center">Nenhuma ocorrência finalizada encontrada</td></tr>');
            return;
        }

        finalizadas.forEach(o => {
            const dataFormatada = o.dataHora ? o.dataHora.split("T")[0] : 'Data não disponível';
            const horaFormatada = o.dataHora ? o.dataHora.split("T")[1].substring(0,5) : 'Hora não disponível';

            const row = `
                <tr>
                    <td>${o.tipo || 'Sem tipo'}</td>
                    <td>${o.descricao || 'Sem descrição'}</td>
                    <td>${o.perito || 'Sem perito'}</td>
                    <td>${o.estado}</td>
                    <td>${dataFormatada} ${horaFormatada}</td>
                    <td>
                        <button class="btn btn-sm btn-success gerar-pdf" data-id="${o.id}">
                            Gerar PDF
                        </button>
                    </td>
                </tr>
            `;

            tbody.append(row);
        });
    }

    // Inicializa DataTable depois de carregar os dados
    carregarOcorrencias();

    $('#dataTable').DataTable({
        order: [],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/pt-PT.json'
        }
    });

    $(document).on('click', '.gerar-pdf', function () {
        const id = $(this).data('id');
        const todasOcorrencias = JSON.parse(localStorage.getItem("ocorrencias")) || [];
        const ocorrencia = todasOcorrencias.find(o => o.id === id && o.estado === "finalizada");

        if (!ocorrencia) {
            alert("Ocorrência finalizada não encontrada.");
            return;
        }

        gerarPdfOcorrencia(ocorrencia);
    });

    async function gerarPdfOcorrencia(o) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 10;

    doc.setFontSize(16);
    doc.text(`Relatório de Ocorrência Finalizada`, 10, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Tipo: ${o.tipo}`, 10, y); y += 8;
    doc.text(`Descrição: ${o.descricao}`, 10, y); y += 8;
    doc.text(`Data: ${o.dataHora.split("T")[0]}`, 10, y); y += 8;
    doc.text(`Hora: ${o.dataHora.split("T")[1].substring(0, 5)}`, 10, y); y += 8;
    doc.text(`Rua: ${o.rua}`, 10, y); y += 8;
    doc.text(`Código Postal: ${o.codigoPostal}`, 10, y); y += 8;
    doc.text(`Perito: ${o.perito || 'Não atribuído'}`, 10, y); y += 8;
    doc.text(`Estado: ${o.estado}`, 10, y); y += 8;
    doc.text(`Gravidade: ${o.gravidade}`, 10, y); y += 10;

    doc.text(`Materiais Utilizados:`, 10, y); y += 8;

    const materiaisCatalogo = JSON.parse(localStorage.getItem("materiais")) || [];
    let totalOrcamento = 0;

    if (o.materiais && o.materiais.length > 0) {
        o.materiais.forEach(m => {
            const catalogoItem = materiaisCatalogo.find(item => item.nome === m.nome);
            const precoUnitario = catalogoItem ? catalogoItem.preco : 0;
            const subtotal = precoUnitario * m.quantidade;
            totalOrcamento += subtotal;

            doc.text(`- ${m.nome}: ${m.quantidade} x €${precoUnitario.toFixed(2)} = €${subtotal.toFixed(2)}`, 14, y);
            y += 6;

            // Evitar ultrapassar a página (ajusta conforme necessário)
            if (y > 280) {
                doc.addPage();
                y = 10;
            }
        });
    } else {
        doc.text(`Nenhum material associado`, 14, y);
        y += 6;
    }

    y += 10;
    doc.setFontSize(14);
    doc.text(`Orçamento Total: €${totalOrcamento.toFixed(2)}`, 10, y);

    const nomeArquivo = `Relatorio_${o.tipo.replace(/\W+/g, "_")}_${o.id}.pdf`;
    doc.save(nomeArquivo);
}

});
