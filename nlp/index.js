const fs = require('fs');
const { NlpManager } = require('node-nlp/lib')
const nlpManager = new NlpManager({ languages: ['pt'] });

if (fs.existsSync('./models/model.nlp')) {
  nlpManager.load('./models/model.nlp');
}else{
  throw new Error("Model nao existe")
}

module.exports.parse = (async (message) => {
  const result = await nlpManager.process(message);
  return result
});