from flask import Flask, request, send_file
import io
import re
from fpdf import FPDF

app = Flask(__name__)

class PDF(FPDF):
    def header(self):
        self.set_font("Arial", "B", 14)
        self.cell(0, 10, "Relatório de Auditoria Finalizada", ln=True, align="C")

    def footer(self):
        self.set_y(-15)
        self.set_font("Arial", "I", 8)
        self.cell(0, 10, f"Página {self.page_no()}", align="C")

    def add_content(self, relatorio):
        self.set_font("Arial", "", 12)
        self.ln(10)
        self.multi_cell(0, 10, f"Descrição: {relatorio['descricao']}")
        self.multi_cell(0, 10, f"Perito: {relatorio['perito']}")
        self.multi_cell(0, 10, f"Data de Início: {relatorio['dataInicio']}")
        self.multi_cell(0, 10, f"Data de Fim: {relatorio['dataFim']}")
        self.multi_cell(0, 10, f"Preço Total: €{relatorio['precoTotal']:.2f}")

        self.ln(10)
        self.set_font("Arial", "B", 12)
        self.cell(0, 10, "Materiais Utilizados:", ln=True)
        self.set_font("Arial", "", 12)

        for mat in relatorio["materiais"]:
            self.cell(60, 10, mat["nome"], border=1)
            self.cell(40, 10, str(mat["quantidade"]), border=1)
            self.cell(40, 10, mat["unidade"], border=1)
            self.ln()

@app.route('/gerar-relatorio', methods=['POST'])
def gerar_relatorio():
    data = request.get_json()
    pdf = PDF()
    pdf.add_page()
    pdf.add_content(data)

    output = io.BytesIO()
    pdf.output(output)
    output.seek(0)

    nome_arquivo = f"Relatorio_{re.sub(r'\\W+', '_', data['descricao'])}_{re.sub(r'\\W+', '_', data['perito'])}.pdf"
    return send_file(output, as_attachment=True, download_name=nome_arquivo, mimetype='application/pdf')

if __name__ == '__main__':
    app.run(debug=True)
