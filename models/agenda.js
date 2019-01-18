const mongoose = require("mongoose")
const Agenda = new mongoose.Schema({
  telegram_id:String,
  data_alerta:Date
})

module.exports = mongoose.model("Agenda",Agenda)