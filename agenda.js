const mongoose = require("mongoose")
const env = require("./env.json")
const agenda = require("./models/agenda")

/**
 * @class Agenda
 * @description construtor da classe agenda que tenta se conectar ao bd 
 */
function Agenda(){
  mongoose.connect(env.db_url, {useNewUrlParser:true})
  console.log("Conectado ao banco")
}
/**
 * @method save
 * @param {Number} id do telegram
 * @param {Date} data data do agendamento
 * @description salva a data de agendamento no db
 */
Agenda.prototype.save = async function(id, data){
  await agenda.create({
    telegram_id:id,
    data_alerta:data
  })
}

/**
 * @method getAgendas
 * @param {function} callbck callback do metodo
 * @description roda a cada minuto procurando todos os agendamentos daquele minuto manda para o callback
 */
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
