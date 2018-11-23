
async function trainnlp(manager) {
  //INTENÇÕES DE CUMPRIMENTO
  manager.addDocument('pt', 'ola', 'cumprimento');
  manager.addDocument('pt', 'oi', 'cumprimento');
  manager.addDocument('pt', 'eae', 'cumprimento');
  manager.addDocument('pt', 'ei', 'cumprimento');
  manager.addDocument('pt', 'tudo bem?', 'cumprimento');
  manager.addDocument('pt', 'tudo bom?', 'cumprimento');
  manager.addDocument('pt', 'tudo em cima?', 'cumprimento');
  manager.addDocument('pt', 'oi tudo bem?', 'cumprimento');

  //INTENÇÕES DE PEDIDO  DE CINEMA
  manager.addDocument('pt', 'quero um cinema', 'cinema');
  manager.addDocument('pt', 'quero assistir um filme', 'cinema');
  manager.addDocument('pt', 'quero ver um filme', 'cinema');
  manager.addDocument('pt', 'que tal um filme?', 'cinema');
  manager.addDocument('pt', 'filme', 'cinema');
  manager.addDocument('pt', 'cinema', 'cinema');
  manager.addDocument('pt', 'o que tem no', 'cinema');

  //INTENÇÃO DE DESPEDIDA
  manager.addDocument('pt', 'tchau', 'despedida');
  manager.addDocument('pt', 'até mais', 'despedida');
  manager.addDocument('pt', 'até', 'despedida');
  manager.addDocument('pt', 'xau', 'despedida');
  manager.addDocument('pt', 'foi legal conversar com você', 'despedida');
  manager.addDocument('pt', 'é nois', 'despedida');
  manager.addDocument('pt', 'falou', 'despedida');
  manager.addDocument('pt', 'flw', 'despedida');
  manager.addDocument('pt', 'nos vemos por ai', 'despedida');
  
  //INTENÇÃO DE AGENDAMENTO
  manager.addDocument("pt", "queria fazer um agendamento", "agendar")
  manager.addDocument("pt", "Gostaria de agendar um horário", "agendar");
  manager.addDocument("pt", "Me agende um horario por favor", "agendar");
  manager.addDocument("pt", "Gostaria de um agendamento", "agendar");
  manager.addDocument("pt", "pode me agendar um horário?", "agendar");

  //INTENÇÃO DE CANCELAMENTO
  manager.addDocument("pt","cancelar","cancelar")
  manager.addDocument("pt","quero cancelar","cancelar")
  manager.addDocument("pt","cancela por favor","cancelar")

  //TREINANDO INTENÇÕES
  console.info('Training, please wait..');
  const hrstart = process.hrtime();
  await manager.train();
  const hrend = process.hrtime(hrstart);
  console.info('Trained (hr): %ds %dms', hrend[0], hrend[1] / 1000000);
  console.info("Trained")

  //ENTIDADE VALE SUL
  manager.addNamedEntityText(
    'cinema',
    '1064',
    ['pt'],
    ['vale-sul', 'vale sul', 'vale sul shopping'],
  );
  //ENTIDADE COLINAS
  manager.addNamedEntityText(
    'cinema',
    '377',
    ['pt'],
    ['colinas', 'colinas shopping'],
  );
  //ENTIDADE CENTERVALE
  manager.addNamedEntityText(
    'cinema',
    '351',
    ['pt'],
    ['center', 'center vale', 'center vale shopping'],
  );
  
  //REPOSTAS PARA CUMPRIMENTO
  manager.addAnswer('pt', 'cumprimento', "Seja bem vindo, o que deseja?");
  manager.addAnswer('pt', 'cumprimento', "Olá :) vai um cinema?");
  manager.addAnswer('pt', 'cumprimento', "Oiiii! que tal um cinema?");
  
  //RESPOSTAS PARA A DESPEDIDA
  manager.addAnswer('pt', 'despedida', "Até mais");
  manager.addAnswer('pt', 'despedida', "Até");
  manager.addAnswer('pt', 'despedida', "Até um outro dia");
  manager.addAnswer('pt', 'despedida', "Tchau");

  //RESPOSTAS PARA CANCELAR
  manager.addAnswer("pt","cancelar","Cancelar")
  
  manager.save('./models/model.nlp');
};
const { NlpManager } = require('node-nlp/lib')
const nlpManager = new NlpManager({ languages: ['pt'] });
trainnlp(nlpManager)