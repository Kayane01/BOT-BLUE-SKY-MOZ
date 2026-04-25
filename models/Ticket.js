const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  codigo: { type: String, required: true },
  cliente: { type: String, required: true },
  status: { type: String, default: "pendente" },
  dataCompra: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Ticket", ticketSchema);