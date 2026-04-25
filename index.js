const express = require("express");
const connectDB = require("./db");
const Ticket = require("./models/Ticket");

const app = express();
app.use(express.json());

// Conectar ao MongoDB
connectDB();

// Rota principal
app.get("/", (req, res) => {
  res.send("🚀 Bot Blue Sky rodando no Railway/Heroku!");
});

// Criar bilhete
app.post("/comprar", async (req, res) => {
  const { codigo, cliente } = req.body;
  const novoTicket = new Ticket({ codigo, cliente });
  await novoTicket.save();
  res.json({ msg: "🎫 Bilhete criado com sucesso!", ticket: novoTicket });
});

// Confirmar bilhete
app.post("/confirmar", async (req, res) => {
  const { codigo } = req.body;
  const ticket = await Ticket.findOneAndUpdate(
    { codigo },
    { status: "confirmado" },
    { new: true }
  );
  if (!ticket) return res.status(404).json({ msg: "Bilhete não encontrado" });
  res.json({ msg: "✅ Bilhete confirmado!", ticket });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));