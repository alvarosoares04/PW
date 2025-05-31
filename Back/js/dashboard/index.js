document.addEventListener("DOMContentLoaded", function () {
    const map = L.map('map').setView([39.5, -8.0], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var portugalBounds = [
            [30.0, -31.5], // Sudoeste (incluindo Madeira e Açores)
            [42.5, -5.0]   // Nordeste (Trás-os-Montes)
        ];

        // Restringir o mapa aos limites de Portugal
        map.setMaxBounds(portugalBounds);

        // Impedir que o usuário zom no mapa para fora dos limites
        map.on('drag', function() {
            map.panInsideBounds(portugalBounds, { animate: true });
        });

    const binIcon = L.icon({
        iconUrl: 'img/bin.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    const sprayPaintIcon = L.icon({
        iconUrl: 'img/spray-paint.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    const ocorrencias = JSON.parse(localStorage.getItem("ocorrencias")) || [];

    function criarPopup(o) {
        return `
            <div class="custom-popup">
                <h5>${o.nome}</h5>
                <p><strong>Tipo:</strong> ${o.tipo}</p>
                <p><strong>Gravidade:</strong> ${o.gravidade}</p>
                <p><strong>Data:</strong> ${o.dataHora.split("T")[0]}</p>
                <p><strong>Hora:</strong> ${o.dataHora.split("T")[1].substring(0,5)}</p>
                <p><strong>Rua:</strong> ${o.rua}</p>
                <p><strong>Código Postal:</strong> ${o.codigoPostal}</p>
                <div class="mt-3 text-center">
                    <button class="btn btn-primary btn-sm" data-id="${o.id}" onclick="mostrarDetalhes(${o.id})">
                        <i class="fas fa-info-circle"></i> Detalhes
                    </button>
                </div>
            </div>
        `;
    }

    ocorrencias.forEach((o) => {
        if (o.latitude && o.longitude) {
            const icon = o.tipo === "grafiti" ? sprayPaintIcon : binIcon;
            L.marker([o.latitude, o.longitude], { icon })
                .addTo(map)
                .bindPopup(criarPopup(o));
        }
    });

    window.mostrarDetalhes = function (id) {
        const o = ocorrencias.find(o => o.id === id);
        if (!o) return;

        const imagem = o.anexos?.[0]?.data || "";
        const content = `
            <p><strong>Tipo:</strong> ${o.tipo}</p>
            <p><strong>Data:</strong> ${o.dataHora.split("T")[0]}</p>
            <p><strong>Hora:</strong> ${o.dataHora.split("T")[1].substring(0, 5)}</p>
            <p><strong>Rua:</strong> ${o.rua}</p>
            <p><strong>Código Postal:</strong> ${o.codigoPostal}</p>
            <p><strong>Descrição:</strong> ${o.descricao}</p>
            <img src="${imagem}" class="img-fluid mb-3" alt="Imagem da Ocorrência" />
            <div class="text-right">
                <button class="btn btn-success mr-2" onclick="aceitarOcorrencia(${id})">Aceitar</button>
                <button class="btn btn-danger" onclick="rejeitarOcorrencia(${id})">Rejeitar</button>
            </div>
        `;

        const offcanvas = document.getElementById("conteudoDetalhes");
        if (offcanvas) {
            offcanvas.innerHTML = content;
            document.getElementById("abrirOffcanvas").click();
        } else {
            alert("Elemento de destino para detalhes não encontrado.");
        }
    };

    window.aceitarOcorrencia = function (id) {
        const index = ocorrencias.findIndex(o => o.id === id);
        if (index !== -1) {
            ocorrencias[index].estado = "aceite";
            localStorage.setItem("ocorrencias", JSON.stringify(ocorrencias));
            alert("Ocorrência aceite.");
            location.reload();
        }
    };

    window.rejeitarOcorrencia = function (id) {
        const index = ocorrencias.findIndex(o => o.id === id);
        if (index !== -1) {
            ocorrencias[index].estado = "rejeitada";
            localStorage.setItem("ocorrencias", JSON.stringify(ocorrencias));
            alert("Ocorrência rejeitada.");
            location.reload();
        }
    };

    // Estatísticas e gráfico
    const totalOcorrencias = ocorrencias.length;
    const ocorrenciasConcluidas = ocorrencias.filter(o => o.estado === "concluida").length;
    const ocorrenciasTratamento = ocorrencias.filter(o => o.estado === "em_tratamento").length;

    document.getElementById("totalOcorrencias").innerText = totalOcorrencias;
    document.getElementById("ocorrenciasConcluidas").innerText = ocorrenciasConcluidas;
    document.getElementById("ocorrenciasTratamento").innerText = ocorrenciasTratamento;

    const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const tipos = ["lixo", "vandalismo", "grafiti", "entulho"];
    const cores = ["#4E79A7", "#F28E2B", "#76B7B2", "#E15759"];

    const datasets = tipos.map((tipo, i) => {
        const data = new Array(12).fill(0);
        ocorrencias.forEach(o => {
            if (o.tipo.toLowerCase() === tipo && o.estado === "concluida") {
                const mes = new Date(o.dataHora).getMonth();
                data[mes]++;
            }
        });
        return {
            label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
            data,
            backgroundColor: cores[i]
        };
    });

    const config = {
        type: 'bar',
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    grid: { display: false }
                },
                y: {
                    stacked: true,
                    ticks: { beginAtZero: true }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Ocorrências Resolvidas por Tipo (Mensal)'
                }
            }
        }
    };

    const ctx = document.getElementById("ocorrenciasBarChart").getContext("2d");
    new Chart(ctx, config);
});
