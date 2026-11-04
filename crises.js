// Guias de crise: consulta rápida, offline. Cada passo vem de fonte oficial (chaves de FONTES, em guias.js).
// estoque = nomes de itens do catálogo que o guia usa; o app mostra quanto há em casa.
// criancas = mostrar as fichas de menores de 12 anos (idade, alergias, remédios).

Object.assign(window.FONTES, {
  msEnchentes: { nome: "Ministério da Saúde · Saiba como agir em caso de enchentes (2011)", url: "https://www.saude.sp.gov.br/resources/ccd/noticias/material_ms_-_saiba_como_agir_em_caso_de_enchentes.pdf" },
  dcChuvas: { nome: "Defesa Civil Nacional (SEDEC) · Chuvas intensas", url: "https://www.gov.br/mdr/pt-br/assuntos/protecao-e-defesa-civil/informacoes-uteis/centro-nacional-de-gerenciamento-de-riscos-e-desastres-cenad/chuvasintensas.pdf" },
  dcAlagamentos: { nome: "Defesa Civil Nacional (SEDEC) · Alagamentos", url: "https://www.gov.br/mdr/pt-br/assuntos/protecao-e-defesa-civil/informacoes-uteis/centro-nacional-de-gerenciamento-de-riscos-e-desastres-cenad/Alagamentos.pdf" },
  dcVendavais: { nome: "Defesa Civil Nacional (SEDEC) · Vendavais", url: "https://www.gov.br/mdr/pt-br/assuntos/protecao-e-defesa-civil/informacoes-uteis/centro-nacional-de-gerenciamento-de-riscos-e-desastres-cenad/Vendavais.pdf" },
  readyLuz: { nome: "Ready.gov (FEMA, EUA) · Power outages", url: "https://www.ready.gov/power-outages" },
  msDiarreia: { nome: "Ministério da Saúde · Manejo do paciente com diarreia (cartaz)", url: "https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/svsa/doencas-diarreicas-agudas/manejo-do-paciente-com-diarreia-avaliacao-do-estado-do-paciente" },
  pePebre: { nome: "Secretaria de Saúde de Pernambuco · Febre: quando buscar atendimento médico", url: "https://portal.saude.pe.gov.br/febre-quando-buscar-atendimento-medico/" },
  msAidpi: { nome: "Ministério da Saúde · AIDPI Criança: 2 meses a 5 anos", url: "https://bvsms.saude.gov.br/bvs/publicacoes/manual_quadros_procedimentos_aidpi_crianca_2meses_5anos.pdf" },
  msDengue: { nome: "Ministério da Saúde · Dengue: diagnóstico e manejo clínico, adulto e criança", url: "https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/svsa/dengue/dengue-manejo-adulto-crianca-5d-1.pdf" },
});

window.CRISES = [
  {
    id: "agua",
    titulo: "Tratar e guardar água",
    resumo: "Água da torneira parou, mudou de cor ou cheiro, ou a casa alagou.",
    estoque: ["Água potável (garrafas)", "Hipoclorito de sódio 2,5%", "Pano ou coador para filtrar água", "Balde com tampa"],
    secoes: [
      {
        titulo: "Primeiro",
        passos: [
          "Beba a água guardada da reserva antes de qualquer outra.",
          "Água da torneira com cheiro ou cor diferente do normal: não beba e avise a companhia de água ou a Secretaria de Saúde.",
          "Nunca beba água de enchente, de poço ou de fonte natural depois de alagamento: estão contaminadas.",
        ],
      },
      {
        titulo: "Tratar a água para beber",
        passos: [
          "1. Filtre: filtro de casa, coador de papel ou pano limpo. Água turva: deixe assentar num balde e use só a de cima.",
          "2. Ferva por 5 minutos, deixe esfriar e passe de um recipiente para outro algumas vezes para tirar o gosto. Ferver é o método preferido: mata bactérias, vírus e parasitas.",
          "3. Sem como ferver: 2 gotas de hipoclorito 2,5% por litro, misture e espere 30 minutos antes de beber.",
          "Doses maiores: 10 L = 20 gotas (1 ml) · 20 L = 40 gotas (2 ml) · 200 L = 4 colheres de chá (20 ml) · 1.000 L = 2 copinhos de café (100 ml).",
          "Água tratada com hipoclorito: consuma em até 24 horas, guardada em recipiente limpo e tampado.",
        ],
      },
      {
        titulo: "Limpar recipientes",
        passos: [
          "Lave com água e sabão e enxágue.",
          "Misture 2 colheres de sopa de hipoclorito 2,5% em 1 litro de água, ponha no recipiente, tampe e agite para molhar toda a parte de dentro.",
          "Deixe tampado por 30 minutos e enxágue com água já tratada.",
          "Use esses recipientes só para água de beber.",
        ],
      },
      {
        titulo: "Não faça",
        alerta: true,
        passos: [
          "Não use água sanitária com perfume ou alvejante para tratar água de beber, alimentos ou recipientes de água.",
          "Não misture hipoclorito com outros produtos de limpeza.",
          "Não use hipoclorito vencido: a dose deixa de garantir a desinfecção.",
        ],
      },
      {
        titulo: "Caixa d'água depois de enchente",
        passos: [
          "Feche o registro, esvazie abrindo torneiras e descargas e use o que sobrar para a limpeza.",
          "Esfregue paredes e fundo com pano e escova macia. Nunca use sabão nem detergente.",
          "Retire a água suja, deixe encher e ponha 1 litro de hipoclorito 2,5% para cada 1.000 litros.",
          "Espere 2 horas, esvazie de novo (essa água serve para limpar canos, chão e paredes), tampe a caixa, anote a data por fora e abra a entrada de água.",
        ],
      },
    ],
    fontes: ["cveSP", "msEnchentes", "dcAlagamentos"],
  },

  {
    id: "luz",
    titulo: "Falta de luz",
    resumo: "Primeiras horas sem energia: comida da geladeira, aparelhos e segurança.",
    estoque: ["Lanterna LED", "Pilhas", "Power bank", "Rádio a pilha", "Fósforo ou isqueiro"],
    secoes: [
      {
        titulo: "Primeiras horas",
        passos: [
          "Prefira lanterna a vela: vela acesa é risco de incêndio, ainda mais com crianças em casa.",
          "Desligue da tomada aparelhos e eletrônicos: quando a luz volta, picos de tensão podem queimá-los.",
          "Ligue o rádio para avisos da Defesa Civil e da companhia de energia.",
          "Economize a bateria do celular: brilho baixo, modo economia, só ligações e mensagens necessárias. Use o power bank para o celular de quem vai precisar falar.",
        ],
      },
      {
        titulo: "Geladeira e freezer",
        passos: [
          "Mantenha as portas fechadas. Fechada, a geladeira conserva a comida fria por até 4 horas; o freezer, por cerca de 24 horas (Ministério da Saúde; o Ready.gov fala em 48 horas para freezer cheio).",
          "Falta longa: se conseguir, ponha blocos de gelo na geladeira.",
          "Coma primeiro o que estraga primeiro (geladeira), depois o freezer, por último a despensa.",
          "Carne, frango, peixe e ovos que ainda estejam frios: cozinhe muito bem antes de comer.",
        ],
      },
      {
        titulo: "Quando a luz voltar",
        alerta: true,
        passos: [
          "Jogue fora alimento que ficou mais de 2 horas acima de 5 °C. Não confie no cheiro nem na aparência.",
          "Na dúvida, jogue fora. Carne, frango, peixe, leite e ovos mal refrigerados causam febre, diarreia e vômito mesmo bem cozidos.",
          "Remédio que precisa de geladeira e ficou mais de um dia sem refrigeração: descarte, salvo se a bula disser outra coisa, e fale com o médico ou farmacêutico.",
        ],
      },
      {
        titulo: "Não faça",
        alerta: true,
        passos: [
          "Nunca use fogão ou forno a gás para aquecer a casa.",
          "Gerador, só ao ar livre e longe de janelas e portas: o gás do motor (monóxido de carbono) não tem cheiro nem cor e mata em ambiente fechado.",
          "Não abasteça gerador quente.",
        ],
      },
    ],
    fontes: ["msEnchentes", "readyLuz"],
  },

  {
    id: "chuva",
    titulo: "Enchente e temporal",
    resumo: "Chuva forte, alagamento ou vendaval: antes, durante e depois.",
    estoque: ["Sacos de lixo resistentes", "Hipoclorito de sódio 2,5%", "Água potável (garrafas)", "Lanterna LED", "Repelente", "Kit de curativos", "Água sanitária (sem perfume)", "Luvas de borracha (par)", "Botas de borracha (par)", "Lona plástica e fita adesiva"],
    secoes: [
      {
        titulo: "Antes (alerta de chuva forte)",
        passos: [
          "Ponha documentos e objetos de valor em sacos plásticos bem fechados, em lugar alto e protegido.",
          "Suba móveis e utensílios.",
          "Se a água ameaçar entrar: desligue aparelhos e o quadro geral de energia, feche o registro de água e o gás.",
          "Feche portas e janelas. Com vendaval, ponha no chão o que pode cair.",
          "Carregue celulares e power banks até 100%.",
          "Morando em encosta: atenção a trincas no terreno e rachaduras nas paredes.",
          "Se a Defesa Civil mandar sair, saia para o abrigo ou ponto seguro indicado, levando a mochila.",
        ],
      },
      {
        titulo: "Durante",
        passos: [
          "Antes de tudo, salve a sua vida e a da família.",
          "Não atravesse rua alagada nem enxurrada. Espere em lugar seguro a água baixar.",
          "Evite contato com a água da enchente: está contaminada. Só entre se for indispensável, de bota ou calçado fechado.",
          "Não coma alimento que tocou a água e não beba água de alagamento.",
          "Vendaval: fique longe de janelas e objetos soltos e proteja a cabeça. Na rua, sem abrigo, deite numa vala ou depressão do terreno.",
          "Qualquer sinal de movimento do terreno: vá para lugar seguro.",
          "Preso em lugar perigoso: Bombeiros 193, Defesa Civil 199.",
        ],
      },
      {
        titulo: "Depois",
        passos: [
          "Volte para casa de dia e só quando a água baixar e o caminho estiver seguro. Veja se a casa não corre risco de desabar.",
          "Não ligue a energia nem o gás antes de checar: desligue o quadro e desconecte o gás.",
          "Fique longe de fios e postes caídos e avise a Defesa Civil ou os Bombeiros.",
          "Entre com cuidado: cobras, aranhas e escorpiões procuram lugares secos. Bata colchões e sacuda roupas, sapatos, toalhas e lençóis. Nunca ponha a mão em buracos: use um cabo de vassoura.",
          "Para limpar, use botas e luvas (ou sacos plásticos duplos amarrados nas mãos e pés) e um pano cobrindo boca e nariz.",
          "Raspe a lama, lave e desinfete: 2 xícaras (400 ml) de hipoclorito 2,5% em 20 litros de água; passe com pano em pisos, paredes e bancadas e deixe agir 30 minutos. Utensílios: lave e deixe 1 hora de molho nessa solução.",
          "Jogue fora todo alimento que ficou submerso ou molhado pela enchente. Latas, vidros e caixas longa vida fechados e sem dano podem ser aproveitados depois de lavar e desinfetar a embalagem.",
          "Use o repelente: água parada em baldes e entulho vira criadouro do mosquito da dengue.",
        ],
      },
      {
        titulo: "Sinais para procurar a unidade de saúde",
        alerta: true,
        passos: [
          "Febre, dor de cabeça e dor no corpo até 40 dias depois de contato com água ou lama de enchente: pode ser leptospirose. Procure atendimento e conte do contato com a enchente.",
          "Corte ou furo com prego, lata, vidro ou entulho: procure atendimento com urgência e diga com o que se feriu (tétano). Confira a vacina: reforço a cada 10 anos, ou 5 em caso de ferimento grave.",
          "Picada de cobra, aranha ou escorpião: atendimento o mais rápido possível, pessoa deitada e sem andar, membro picado elevado, lavar com água e sabão. Nunca faça torniquete.",
          "Três ou mais episódios de diarreia em 24 horas, ou várias pessoas com diarreia e vômito depois da mesma comida: procure a unidade de saúde.",
        ],
      },
    ],
    fontes: ["dcChuvas", "dcAlagamentos", "dcVendavais", "msEnchentes"],
  },

  {
    id: "crianca",
    titulo: "Criança com febre ou diarreia",
    resumo: "O que fazer em casa e os sinais para levar ao atendimento já.",
    estoque: ["Termômetro", "Antitérmico infantil", "Soro de reidratação oral", "Água potável (garrafas)"],
    criancas: true,
    secoes: [
      {
        titulo: "Febre: o que é",
        passos: [
          "Febre é temperatura na axila de 37,5 °C ou mais (critério atual da Sociedade Brasileira de Pediatria). Meça de preferência na axila.",
          "Febre é defesa do corpo, não doença. Dê o antitérmico quando ela vier com desconforto (dor, mal-estar, choro), na dose pelo peso que o pediatra indicou.",
          "Suspeita de dengue (febre com dor no corpo, atrás dos olhos, manchas): não dê AAS (aspirina) nem anti-inflamatório como ibuprofeno. Procure a unidade de saúde.",
        ],
      },
      {
        titulo: "Febre: leve ao atendimento já",
        alerta: true,
        passos: [
          "Bebê com menos de 3 meses com temperatura acima de 38 °C ou abaixo de 35,5 °C.",
          "Criança que não consegue beber ou mamar, vomita tudo, teve convulsão, ou está muito mole, sonolenta ou difícil de acordar.",
          "Dificuldade importante para respirar, pescoço duro (não consegue encostar o queixo no peito), manchas na pele, vômitos que não param, confusão ou irritação extrema.",
          "Criança que continua irritada, apática ou sem querer mamar mesmo depois que a febre baixa.",
          "Febre que não passa: procure avaliação se durar mais de 3 dias.",
        ],
      },
      {
        titulo: "Diarreia: tratar em casa (Plano A)",
        passos: [
          "Ofereça mais líquido que o normal, em pequenas quantidades e muitas vezes: água, chá, suco, água de coco, sopa ou soro de reidratação. Sem refrigerante e de preferência sem açúcar.",
          "Depois de cada evacuação líquida: menores de 1 ano, 50 a 100 ml; de 1 a 10 anos, 100 a 200 ml; maiores de 10, o quanto aceitarem.",
          "Bebê só no peito: além do leite materno, o único líquido é o soro de reidratação.",
          "Mantenha a alimentação normal, para criança e adulto.",
          "Lave as mãos, trate a água e higienize os alimentos.",
          "Não use remédio para prender o intestino (antidiarreico) nem antibiótico por conta própria.",
        ],
      },
      {
        titulo: "Diarreia: leve ao atendimento já",
        alerta: true,
        passos: [
          "Não melhorou em 2 dias.",
          "Diarreia piorando (mais vezes ou mais volume), vômitos repetidos, sangue nas fezes.",
          "Fazendo pouco xixi, com muita sede, ou recusando comida.",
          "Sinais de desidratação: irritada ou intranquila, olhos fundos, sem lágrimas ao chorar, boca e língua secas, bebendo com avidez.",
          "Desidratação grave, vá de imediato: muito mole ou inconsciente, não consegue beber, pele da barriga que demora mais de 2 segundos para voltar quando puxada.",
        ],
      },
    ],
    fontes: ["msDiarreia", "pePebre", "msAidpi", "msDengue"],
  },
];
