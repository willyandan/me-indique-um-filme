const axios =  require('axios')

/**
 * getFilmes
 * @param {Number} cinema - id do cinema
 * @param { string } data - dia do cinema
 * @description pesquisa todos os filmes em um cinema em um certo dia usando a api do ingresso rapido
 */
module.exports.getFilmes = async (cinema, date)=>{
  try{
    const url = `https://api-content.ingresso.com/v0//sessions/city/46/theater/${cinema}?partnership=&date=${date}`
    const response = await axios.get(url)
    return response.data[0]
  }catch(err){
    throw err
  }
}

/**
 * getDates
 * @param {cinema} - id do cinema
 * @description pega os dias em que o cinema tem filme cadastrado
 */
module.exports.getDates = async (cinema)=>{
  const url = `https://api-content.ingresso.com/v0//sessions/city/46/theater/${cinema}/dates`
  const response = await axios.get(url)
  return response.data
}