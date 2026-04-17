const { default: makeWASocket, useMultiFileAuthState, downloadMediaMessage, delay } = require("@whiskeysockets/baileys");
const fs = require('fs');
const P = require('pino');
const Jimp = require('jimp');
const jsQR = require('jsqr');
const QRCode = require('qrcode');
const ExcelJS = require('exceljs');
const { OpenAI } = require("openai");
const readline = require("readline");

// CONFIGURAÇÃO DA IA (Substitua pela sua chave)
const openai = new OpenAI({
    apiKey: "SUA_CHAVE_AQUI", 
    baseURL: "https://api.groq.com/openai/v1" // Opcional: use Groq para ser grátis
});

// BANCO DE DADOS
let db = {
    bilhetes: {}, vendas_pendentes: {}, ids_usados: [],
    contas: { mpesa: "855642998 (Elisio Mocumbe)", emola: "879740345 (Percina Elta)" }
};
if (fs.existsSync('./database.json')) db = JSON.parse(fs.readFileSync('./database.json'));
const save = () => fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));

async function obterRespostaIA(texto) {
    try {
        const res = await openai.chat.completions.create({
            model: "llama3-8b-8192", 
            messages: [{ role: "system", content: "Você é o Agente da Startup VIP. Ajude com pagamentos M-Pesa/e-Mola." }, { role: "user", content: texto }]
        });
        return res.choices[0].message.content;
    } catch (e) { return "Olá! Como posso ajudar com seus bilhetes hoje?"; }
}

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ logger: P({ level: 'silent' }), auth: state });

    if (!sock.authState.creds.registered) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const num = await new Promise(res => rl.question("Digite seu número (Ex: 25885...): ", res));
        const code = await sock.requestPairingCode(num.replace(/[^0-9]/g, ''));
        console.log(`\n👉 CÓDIGO DE CONEXÃO: ${code}\n`);
        rl.close();
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const pushName = msg.pushName || "Cliente";

        // --- RECONHECIMENTO DE SMS ---
        if (body.includes("ID:") && body.includes("MT")) {
            const id = body.match(/ID:\s*([A-Z0-9]+)/i)?.[1].toUpperCase();
            if (id) {
                db.vendas_pendentes[id] = { usuario: from, nome: pushName };
                save();
                await sock.sendMessage(from, { text: `🤖 *IA:* Comprovante ID ${id} recebido. Aguarde a confirmação.` });
                return;
            }
        }

        // --- VALIDAÇÃO DE QR CODE (FOTO) ---
        if (msg.message.imageMessage) {
            const buffer = await downloadMediaMessage(msg, 'buffer');
            const img = await Jimp.read(buffer);
            const qr = jsQR(img.bitmap.data, img.bitmap.width, img.bitmap.height);
            if (qr) {
                const b = db.bilhetes[qr.data];
                if (b && b.status === "disponivel") {
                    b.status = "usado"; b.validado_em = new Date().toLocaleString(); save();
                    await sock.sendMessage(from, { text: `✅ *ACESSO LIBERADO!*\n🎫 ${qr.data}` });
                } else {
                    await sock.sendMessage(from, { text: "❌ *BILHETE INVÁLIDO OU JÁ USADO!*" });
                }
                return;
            }
        }

        // --- COMANDOS ---
        if (body.startsWith('.')) {
            const cmd = body.slice(1).trim().split(' ')[0].toLowerCase();
            const arg = body.split(' ')[1]?.toUpperCase();

            if (cmd === 'confirmar' && arg) {
                const venda = db.vendas_pendentes[arg];
                if (venda) {
                    const cod = "VIP-" + arg;
                    db.bilhetes[cod] = { status: "disponivel", cliente: venda.nome };
                    delete db.vendas_pendentes[arg]; save();
                    await sock.sendMessage(venda.usuario, { text: `🎉 *PAGO!* Seu bilhete é: *${cod}*` });
                    await sock.sendMessage(from, { text: "✅ Confirmado." });
                }
                return;
            }
        }

        // --- RESPOSTA DA IA ---
        if (!body.startsWith('.')) {
            const resp = await obterRespostaIA(body);
            await sock.sendMessage(from, { text: `🤖 *AGENT AI:*\n\n${resp}` });
        }
    });
}
start();