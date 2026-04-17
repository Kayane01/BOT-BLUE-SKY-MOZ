const { default: makeWASocket, useMultiFileAuthState, downloadMediaMessage, DisconnectReason } = require("@whiskeysockets/baileys");
const fs = require('fs');
const P = require('pino');
const Jimp = require('jimp');
const jsQR = require('jsqr');
const QRCode = require('qrcode');
const ExcelJS = require('exceljs');
const cron = require('node-cron');
const { OpenAI } = require("openai");
const readline = require("readline");

// --- CONFIGURAÇÃO DA IA (AGENT) ---
const openai = new OpenAI({
    apiKey: "SUA_CHAVE_AQUI", // Use sua gsk_... (Groq) ou sk-... (OpenAI)
    baseURL: "https://api.groq.com/openai/v1" // Remova se for usar OpenAI original
});

// --- BANCO DE DADOS ---
let db = {
    bilhetes: {}, vendas_pendentes: {}, ids_sms_usados: [],
    grupos_alarme: [],
    config: { ia_ativa: true, welcome: true }
};
if (fs.existsSync('./database.json')) db = JSON.parse(fs.readFileSync('./database.json'));
const save = () => fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));

async function obterRespostaIA(texto) {
    try {
        const res = await openai.chat.completions.create({
            model: "llama3-8b-8192", 
            messages: [{ role: "system", content: "Você é o Agente da Startup VIP Moçambique. Ajude com Bilhetes e Pagamentos M-Pesa/e-Mola." }, { role: "user", content: texto }]
        });
        return res.choices[0].message.content;
    } catch (e) { return "Olá! Sou o assistente da Startup. Como posso ajudar com seus bilhetes?"; }
}

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ logger: P({ level: 'silent' }), auth: state, printQRInTerminal: false });

    // Vincular por Código (Termux)
    if (!sock.authState.creds.registered) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const num = await new Promise(res => rl.question("Digite seu número (Ex: 258855642998): ", res));
        const code = await sock.requestPairingCode(num.replace(/[^0-9]/g, ''));
        console.log(`\n👉 CÓDIGO DE CONEXÃO: ${code}\n`);
        rl.close();
    }

    sock.ev.on('creds.update', saveCreds);

    // --- ALARME AUTOMÁTICO (00h e 07h) ---
    cron.schedule('00 00 * * *', async () => {
        for (const gid of db.grupos_alarme) {
            await sock.groupSettingUpdate(gid, 'announcement');
            await sock.sendMessage(gid, { text: "🌒 *SISTEMA:* Grupo fechado automaticamente (00:00)." });
        }
    }, { timezone: "Africa/Maputo" });

    cron.schedule('00 07 * * *', async () => {
        for (const gid of db.grupos_alarme) {
            await sock.groupSettingUpdate(gid, 'not_announcement');
            await sock.sendMessage(gid, { text: "☀️ *SISTEMA:* Grupo aberto automaticamente (07:00)." });
        }
    }, { timezone: "Africa/Maputo" });

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const pushName = msg.pushName || "Cliente";

        // 1. RECONHECIMENTO DE SMS (M-PESA / E-MOLA)
        if (body.includes("ID:") && body.includes("MT")) {
            const id = body.match(/ID:\s*([A-Z0-9]+)/i)?.[1].toUpperCase();
            if (id && !db.ids_sms_usados.includes(id)) {
                db.vendas_pendentes[id] = { usuario: from, nome: pushName, valor: body.match(/(\d+\.\d+|\d+)\s*MT/)?.[0] };
                save();
                await sock.sendMessage(from, { text: `🤖 *AGENT:* Comprovante ID ${id} recebido. Aguarde a confirmação.` });
                return;
            }
        }

        // 2. VALIDAÇÃO DE FOTO (QR CODE)
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

        // 3. COMANDOS
        if (!body.startsWith('.')) {
            if (!isGroup) {
                const r = await obterRespostaIA(body);
                await sock.sendMessage(from, { text: `🤖 ${r}` });
            }
            return;
        }

        const args = body.slice(1).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();

        switch (cmd) {
            case 'ajuda':
                await sock.sendMessage(from, { text: "🚀 *MENU STARTUP*\n.abrir | .fechar | .alarme\n.listar | .mencionar | .kick\n.confirmar [ID] | .relatorio" });
                break;
            case 'abrir': await sock.groupSettingUpdate(from, 'not_announcement'); break;
            case 'fechar': await sock.groupSettingUpdate(from, 'announcement'); break;
            case 'alarme':
                if (!db.grupos_alarme.includes(from)) { db.grupos_alarme.push(from); save(); }
                await sock.sendMessage(from, { text: "⏰ Alarme Ativado para este grupo (00h-07h)." });
                break;
            case 'confirmar':
                const idC = args[0]?.toUpperCase();
                if (db.vendas_pendentes[idC]) {
                    const cod = "VIP-" + idC;
                    db.bilhetes[cod] = { status: "disponivel", cliente: db.vendas_pendentes[idC].nome };
                    db.ids_sms_usados.push(idC);
                    delete db.vendas_pendentes[idC]; save();
                    await sock.sendMessage(from, { text: `✅ Bilhete ${cod} gerado para o cliente.` });
                }
                break;
        }
    });

    sock.ev.on('connection.update', (u) => { 
        if (u.connection === 'close') start();
        if (u.connection === 'open') console.log("✅ SISTEMA ONLINE!"); 
    });
}
start();