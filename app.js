/**
 * ME INDIQUE UM FILME
 * Bot que consulta os cinemas de São josé dos campos e retorna
 * todos os filmes disponiveis por dia e shopping
 */
const nlp = require('./nlp')
const search = require('./searcher')
const button = require("node-telegram-keyboard-wrapper")
const TelegramBot = require('node-telegram-bot-api');
const env = require("./env.json")
const Agenda = require("./agenda")

const agenda = new Agenda()

const token = env.telegram_token;
const bot = new TelegramBot(token, {polling: true});
const cv_ativas = {}
/**
 * getAgendas
 * @callback Agenda.getAgendas()
 * manda mensagem para todas as pessoas que solicitaram um agendamento em tal horario
 */
agenda.getAgendas((val)=>{
  for (let v = 0; v < val.length; v++) {
    const element = val[v];
    bot.sendMessage(element.telegram_id, "Ei você tem um filme agendado para agora")
  }
})

/**
 * getResponse
 * @param {*} obj Objeto do parser que contem a entidade e todas as intenções da frase
 * @param {Number} id id do telegram
 * @description recebe um objeto do nlu e um id do telegram
 *  verifica se essa convsersa ja existe
 *  verifica as intenções e retira as entidades de acordo com a intenção e se a "progressão da conversa"
 */
async function getReponse(obj, id){
  const entities = obj.entities
  const intent = obj.intent
  const answer = obj.answer?obj.answer:"Desculpe não entendi"
  let dia, horario, dia_horario, cinema

  if(cv_ativas[id]){
    const conv = cv_ativas[id]
    if(intent == "cancelar"){
      bot.sendMessage(id,answer);
      delete cv_ativas[id]
      return
    }
    if(conv.status == "waiting"){
      bot.sendMessage(id,"Aguarde um minuto por favor")
      return
    }
    if(conv.intent == "cinema"){ 
      const dia = entities.find((val)=>val.entity == "date")
      const cinema = entities.find((val)=>val.entity == "cinema")
      
      if(dia) cv_ativas[id].entities.dia = dia.resolution.strPastValue
      if(cinema) {
        cv_ativas[id].entities.cinema_id = cinema.option
        cv_ativas[id].entities.cinema_name = cinema.sourceText
      }
      searchCinema(cv_ativas[id],id)
    }
    if(conv.intent == "agendar"){
      dia = entities.find((val)=>val.entity == "date")
      horario = entities.find((val)=>val.entity == "time")
      dia_horario = entities.find((val)=>val.entity == "datetime")
      if(dia) cv_ativas[id].entities.dia = dia.resolution.strPastValue
      if(horario) cv_ativas[id].entities.horario = horario.resolution.values[0].value
      if(dia_horario) cv_ativas[id].entities.dia_horario = dia_horario.resolution.values[1].value
      getAgendamento(cv_ativas[id],id)
    }
  }else{
    switch(intent){
      case 'cumprimento':
      case 'despedida':  
        bot.sendMessage(id,answer)
        break
      case 'cinema':
        dia = entities.find((val)=>val.entity == "date")
        horario = entities.find((val)=>val.entity == "time")
        dia_horario = entities.find((val)=>val.entity == "datetime")
        cinema = entities.find((val)=>val.entity == "cinema")
        ents = {
          "dia":dia?dia.resolution.strPastValue:null,
          "horario":horario?horario.resolution.values[0].value:null,
          "dia_horario":dia_horario?dia_horario.resolution.values[1].value:null,
          "cinema_id": cinema?cinema.option:null,
          "cinema_name":cinema?cinema.sourceText:null
        }
        cv_ativas[id] = {
          intent:intent,
          entities:ents,
          status:"waiting"
        }
        searchCinema(cv_ativas[id],id)
        break
      case 'agendar':
        dia = entities.find((val)=>val.entity == "date")
        horario = entities.find((val)=>val.entity == "time")
        dia_horario = entities.find((val)=>val.entity == "datetime")
        ents = {
          "dia":dia?dia.resolution.strPastValue:null,
          "horario":horario&&horario.resolution?horario.resolution.values[0].value:null,
          "dia_horario":dia_horario?dia_horario.resolution.values[1].value:null,
        }
        cv_ativas[id] = {
          intent:intent,
          entities:ents,
          status:"waiting"
        }
        getAgendamento(cv_ativas[id],id)
        break
      default:
        bot.sendMessage(id,answer)
    }
  }
}

/**
 * searchCinema
 * @param {*} user Objeto de conversa ativa com intenção e entidades
 * @param {Number} id id do Telegram 
 * @description retorna cinemas, dias disponiveis e filmes dependendo das entidades do obj user
 */
async function searchCinema(user,id){
  const ents = user.entities
  if( (ents.dia_horario || ents.dia) && ents.cinema_id){
    bot.sendMessage(id,"Procurando filmes")
    let dia
    if(ents.dia_horario){
      const d = new Date(ents.dia_horario)
      dia = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
    }else{
      const d = ents.dia.split("-")
      dia = `${d[0]}-${d[2]}-${d[1]}`
    }
    try {
      const response = await search.getFilmes(ents.cinema_id,dia)
      const movies = response.movies.reduce((mv,resp)=>{
        const obj = {}
        obj.link = resp.siteURLByTheater
        obj.name = resp.title
        obj.rating = resp.contentRating
        obj.genres = resp.genres.join(", ")
        obj.buy_url = resp.siteURL
        obj.dates = resp.rooms.reduce((dates,rooms)=>{
          let hours = rooms.sessions.reduce((d,session)=>{
            d.push(session.realDate.localDate)
            return d
          },[])
          return dates.concat(hours)
        },[])
        mv.push(obj)
        return mv
      },[])
      movies.forEach(mv => {
        let msg =`${mv.name}\n`
        msg+= `Gêneros: ${mv.genres}\n`
        msg+= `Classificação indicativa: ${mv.rating}\n`
        msg+= `Comprar: ${mv.buy_url}\n`
        bot.sendMessage(id,msg)
      });
      delete cv_ativas[id]
    } catch (error) {
      bot.sendMessage(id,"Desculpe eu não consegui achar nada :/")
      delete cv_ativas[id]
    }

  }else if(!ents.cinema_id){
    const keyboard = new button.InlineKeyboard()
    keyboard
      .addRow({ text: "Colinas", callback_data: "Colinas" })
      .addRow({ text: "Vale sul", callback_data: "Vale sul" })
      .addRow({ text: "Center vale", callback_data: "Center vale" })
    bot.sendMessage(id,"Escolha um cinema", keyboard.build())
    user.status="ready"
  }
  else if(!ents.dia_horario && !ents.dia){
    bot.sendMessage(id,`Procurando os dias no cinema ${ents.cinema_name}`)
    const dates = await search.getDates(ents.cinema_id)
    const keyboard = new button.InlineKeyboard()
    dates.forEach((val)=>{
      keyboard.addRow({
        text:`${val.dayOfWeek} (${val.dateFormatted})`,
        callback_data:val.dateFormatted
      })
    })
    bot.sendMessage(id,"Escolha um dia", keyboard.build())
    user.status="ready"
  }
}

/**
 * getAgendamento
 * @param {*} user Objeto de conversa ativa
 * @param {Number} id id do telegram
 * @description pergunta por dia e horario e caso tenha as entidades necessárias salva no banco um agendamento
 */
async function getAgendamento(user, id){
  const ents = user.entities
  if(ents["dia_horario"]){
    const d = new Date(ents["dia_horario"])
    bot.sendMessage(id, `Estamos agendando para ${d.getDate()}/${d.getMonth()}/${d.getFullYear()} às ${d.getHours()}:${d.getMinutes()}`)
    await agenda.save(id,d)
    delete cv_ativas[id]
  }
  else if(ents["dia"] && ents["horario"]){
    const d = new Date(ents["dia"])
    const h = ents["horario"].split(":")
    d.setHours(parseInt(h[0]), parseInt(h[1]), parseInt(h[2]))
    bot.sendMessage(id, `Estamos agendando para ${d.getDate()}/${d.getMonth()}/${d.getFullYear()} às ${d.getHours()}:${d.getMinutes()}`)
    await agenda.save(id,d)
    delete cv_ativas[id]
  }
  else if(ents["dia"]){
    bot.sendMessage(id,"Ok agora só falta o horário")
    user.status="ready"

  }else if(ents["horario"]){
    const d = new Date()
    const h = ents["horario"].split(":")
    d.setHours(parseInt(h[0]), parseInt(h[1]), parseInt(h[2]))

    bot.sendMessage(id,`Agendando para hoje às ${d.getHours()}:${d.getMinutes()}`)
    await agenda.save(id,d)
    delete cv_ativas[id]

  }else{
    bot.sendMessage(id,"Beleza, só me diga o dia e o horário, ou só o horario caso for para hoje")
    user.status="ready"
  }
} 
/**
 * @callback Telegram.msg
 * analisa a mensagem e manda analisa e manda a mensagem para o getResponse
 */
bot.on("message",(msg)=>{
  nlp.parse(msg.text).then(val=>{
    getReponse(val,msg.chat.id)
  })
})

/**
 * @callback Telegram.keyboard
 * Recebe a mensagem do inline keyboard do telegram, analisa essa msg e manda ela para o getResponse
 */
bot.on("callback_query", (query) => {
  nlp.parse(query.data).then(val=>{
    getReponse(val,query.message.chat.id)
  })
})
