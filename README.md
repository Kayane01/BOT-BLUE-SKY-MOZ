
# 🤖 Startup Agent AI - Bilheteria Digital Moçambique

Sistema avançado de gestão de eventos e bilhetes com Inteligência Artificial.

## 🚀 Funcionalidades
- **Agent IA:** Atendimento automático via ChatGPT/Groq.
- **Pagamentos:** Integração manual com M-Pesa e e-Mola.
- **Bilhetes:** Geração de bilhete digital com QR Code.
- **Validação:** Escaneamento de fotos (QR) para entrada no evento.
- **SMS:** Reconhecimento automático de IDs de transação da Vodacom e Movitel.

## 🛠 Comandos Cliente
- `.comprar` : Inicia o processo de compra.
- `.pagar [ID]` : Envia o ID para confirmação.

## 🛠 Comandos Admin
- `.confirmar [ID]` : Gera e envia o bilhete ao cliente.
- `.relatorio` : Gera planilha Excel com todas as vendas.

cd ~/bot-startup-pro
git init
git add .
git commit -m "Add: Agent AI + Bilheteria Digital"
git branch -M main
git remote add origin https://github.com/Elisio-10/startup-agent-pro.git
git push -u origin main