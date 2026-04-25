
📘 README.md – BOT-BLUE-SKY-MOZ

🚀 Descrição
Bot para gerenciamento de grupos de WhatsApp com Inteligência Artificial e suporte a bilhetes digitais em Moçambique.  
Funcionalidades incluem:
- Atendimento automático via ChatGPT/Groq.  
- Integração manual com M-Pesa e e-Mola.  
- Geração de bilhete digital com QR Code.  
- Validação de bilhetes por foto (QR).  
- Reconhecimento automático de IDs de transação da Vodacom e Movitel.  

---

📦 Instalação no Termux

1. Preparar ambiente
`bash
pkg update && pkg upgrade
pkg install git nodejs
`

2. Clonar repositório
`bash
git clone https://github.com/Kayane01/BOT-BLUE-SKY-MOZ.git
cd BOT-BLUE-SKY-MOZ
`

3. Instalar dependências
`bash
npm install --legacy-peer-deps
`

(se der conflito, use npm install --force)

4. Iniciar bot
`bash
node index.js
`

---

⚙️ Comandos Principais

🛒 Venda (Clientes)
- .comprar → Mostra instruções de pagamento.  
- .pagar [ID] → Envia ID da transação manualmente.  
- Encaminhar SMS → Bot reconhece ID e valor automaticamente.  

🎫 Bilheteria (Administradores)
- .confirmar [ID] → Confirma pagamento e gera bilhete com QR.  
- .relatorio → Exporta relatório Excel com bilhetes vendidos/usados.  
- .addbilhete [CÓDIGO] → Adiciona bilhete manualmente.  
- Foto de Bilhete → Valida QR Code enviado pelo cliente.  

🤖 Automação
- .ia on / off → Liga/desliga atendimento automático.  
- .alarme → Fecha grupo às 00h e abre às 07h.  
- .ping → Testa velocidade de resposta.  

---

📋 Requisitos
- Node.js 18+  
- Termux atualizado  
- Conexão com internet  
- Conta GitHub para clonar repositório  

---

📌 Notas
- Para manter o bot ativo em segundo plano:
`bash
npm install -g pm2
pm2 start index.js
pm2 save
`
 