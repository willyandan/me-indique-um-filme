const fs = require('fs');
const { NlpManager } = require('node-nlp/lib')
const nlpManager = new NlpManager({ languages: ['pt'] });

if (fs.existsSync('./models/model.nlp')) {
  nlpManager.load('./models/model.nlp');
}else{
  throw new Error("Model nao existe")
}
/**
 * parse
 * @param {string} message mensagem que sera analisada
 * @description analisa uma mensagem e retorna o resultado com intenções e entidades
 * 
 */
module.exports.parse = (async (message) => {
  const result = await nlpManager.process(message);
  return result
});