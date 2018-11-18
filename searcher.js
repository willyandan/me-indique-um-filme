const axios =  require('axios')

module.exports.getFilmes = async (cinema, date)=>{
  try{
    const url = `https://api-content.ingresso.com/v0//sessions/city/46/theater/${cinema}?partnership=&date=${date}`
    const response = await axios.get(url)
    return response.data[0]
  }catch(err){
    throw err
  }
}

module.exports.getDates = async (cinema)=>{
  const url = `https://api-content.ingresso.com/v0//sessions/city/46/theater/${cinema}/dates`
  const response = await axios.get(url)
  return response.data
}