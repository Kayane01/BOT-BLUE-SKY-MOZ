
# 🤖 Startup Agent AI - Bilheteria Digital Moçambique

Sistema avançado de gestão de eventos e bilhetes com Inteligência Artificial.

## 🚀 Funcionalidades
- **Agent IA:** Atendimento automático via ChatGPT/Groq.
- **Pagamentos:** Integração manual com M-Pesa e e-Mola.
- **Bilhetes:** Geração de bilhete digital com QR Code.
- **Validação:** Escaneamento de fotos (QR) para entrada no evento.
- **SMS:** Reconhecimento automático de IDs de transação da Vodacom e Movitel.

🛒 1. Comandos de Venda (Para os Clientes)
Estes comandos são usados por quem quer comprar um bilhete.
.comprar – Mostra as instruções de pagamento, os números do M-Pesa (Elisio) e e-Mola (Percina) e como enviar o comprovativo.
.pagar [ID] – O cliente envia o ID da transação manualmente para você confirmar.
Exemplo: .pagar ABC123XYZ
Encaminhar SMS (Automático) – Se o cliente copiar e colar o SMS oficial da Vodacom ou Movitel, o bot reconhece o valor e o ID sozinho e avisa você.

🎫 2. Comandos de Bilheteria (Para os Administradores)
Use estes comandos para gerir o dinheiro e os acessos.
.confirmar [ID] – Você usa este comando após conferir se o dinheiro caiu. O bot gera o bilhete com QR Code e envia para o cliente.
.relatorio – O bot gera um ficheiro Excel (.xlsx) e envia para você com a lista de todos os bilhetes vendidos, quem comprou e quais já foram usados.
.addbilhete [CÓDIGO] – Adiciona manualmente um bilhete ao sistema sem precisar de pagamento.
Enviar Foto de Bilhete – Se você (ou o porteiro) receber a foto do bilhete/QR Code do cliente, o bot lê a imagem e diz na hora: "✅ ACESSO LIBERADO" ou "❌ JÁ FOI USADO".

.
🤖 4. Comandos de IA e Automação (Startup Elite)
.ia on / .ia off – Liga ou desliga a Inteligência Artificial (Agent). Quando ligada, o bot responde dúvidas dos clientes como se fosse um humano.
.alarme – Ativa o sistema automático no grupo atual.
00:00h: O grupo fecha sozinho.
07:00h: O grupo abre sozinho.
.ping – Testa a velocidade de resposta do bot.

❓ 5. Comando Geral
.ajuda – Abre o menu principal com a lista resumida de todos os comandos acima.

cd ~/bot-startup-pro
git init
git add .
git commit -m "Add: Agent AI + Bilheteria Digital"
git branch -M main
git remote add origin https://github.com/Elisio-10/startup-agent-pro.git
git push -u origin main

Instalar Dependências:
code
Bash
pkg install nodejs -y
npm install
Ligar o Bot:
code
Bash
node index.js
Coloque seu número e conecte no WhatsApp.
Manter Online 24h:
code
Bash
npm install pm2 -g
pm2 start index.js --name "bot-startup"
pm2 save