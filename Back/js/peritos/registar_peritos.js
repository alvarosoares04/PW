function previewImage(event) {
    var input = event.target;
    var reader = new FileReader();

    reader.onload = function () {
      var img = document.getElementById('imagePreview');
      img.src = reader.result;
      img.style.display = 'block';
    };

    if (input.files.length > 0) {
      reader.readAsDataURL(input.files[0]);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const especializacoes = [
      "Polícia",
      "Equipa de Limpeza",
      "Técnico Ambiental",
      "Fiscalização Municipal"
    ];
    const selectEspecializacao = document.createElement("select");
    selectEspecializacao.className = "form-control";
    selectEspecializacao.id = "especializacaoSelect";
    selectEspecializacao.innerHTML = '<option disabled selected>Selecione a especialização</option>' +
      especializacoes.map(es => `<option value="${es}">${es}</option>`).join("");

    const inputEspecializacao = document.querySelector("input[placeholder='Digite a sua especialização']");
    inputEspecializacao.replaceWith(selectEspecializacao);

    document.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();

      const nome = document.querySelector("input[placeholder='Digite o nome']").value;
      const numeroId = document.querySelector("input[placeholder='Digite o número de ID']").value;
      const email = document.querySelector("input[placeholder='Digite a e-mail']").value;
      const contacto = document.querySelector("input[placeholder='Digite a contacto']").value;
      const dia = document.getElementById("diaNascimento").value;
      const mes = document.getElementById("mesNascimento").value;
      const ano = document.getElementById("anoNascimento").value;
      const dataNascimento = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
      const especializacao = document.getElementById("especializacaoSelect").value;
      const observacoes = document.querySelector("textarea").value;

      const fileInput = document.getElementById("fileInput");
      const imagemPreview = document.getElementById("imagePreview").src;

      const novoPerito = {
        nome,
        numeroId,
        email,
        contacto,
        dataNascimento,
        especializacao,
        observacoes,
        imagem: imagemPreview
      };

      const peritosExistentes = JSON.parse(localStorage.getItem("peritos")) || [];
      peritosExistentes.push(novoPerito);
      localStorage.setItem("peritos", JSON.stringify(peritosExistentes));

      alert("Perito registado com sucesso!");
      document.querySelector("form").reset();
      document.getElementById("imagePreview").style.display = "none";
    });
  });