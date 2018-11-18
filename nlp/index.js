
const { NlpManager } = require('node-nlp/lib')
const trainnlp = require('./train-nlp');
const nlpManager = new NlpManager({ languages: ['pt'] });

module.exports.parse = (async (message) => {
  await trainnlp(nlpManager);
  const result = await nlpManager.process(message);
  return result
});