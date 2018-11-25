const mongoose = require("mongoose")
const env = require("./env.json")
const agenda = require("./models/agenda")

function Agenda(){
  mongoose.connect(env.db_url, {useNewUrlParser:true})
  console.log("Conectado ao banco")
}

Agenda.prototype.save = async function(id, data){
  await agenda.create({
    telegram_id:id,
    data_alerta:data
  })
}

Agenda.prototype.getAgendas =  async function(callbck){
  setInterval(async ()=>{
    let gte = new Date();
    gte.setMinutes(gte.getMinutes()-1,0,0)
    let lt = new Date();
    lt.setMinutes(gte.getMinutes(),59,59)
    agenda.find({'data_alerta':{"$gte": gte, "$lt": lt}},(err, val)=>{
      if(val != []){
        callbck(val)
      }
    })
  },60000) 
}

module.exports = Agenda
