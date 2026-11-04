// Guia de compra de cada item do catálogo: como escolher, como guardar e como preparar.
// Chave = nome do item. Itens criados pelo usuário não têm guia.
window.GUIAS = {
  "Água potável (garrafas)": {
    escolher: "Garrafões de 5 L ou garrafas de água mineral lacradas. Também serve água da torneira em garrafa PET de água ou refrigerante bem lavada; nunca em embalagem que teve produto de limpeza.",
    armazenar: "Lugar fresco, escuro e longe de produtos químicos, combustível e chão úmido. Marque a data na garrafa e troque a cada 6 meses.",
    preparar: "Água guardada sem lacre ou de procedência duvidosa: ferva ou trate com hipoclorito antes de beber. Conte também a água para cozinhar e escovar os dentes.",
  },
  "Hipoclorito de sódio 2,5%": {
    escolher: "O frasco vendido em farmácia ou distribuído no posto de saúde para tratar água para beber. Não use água sanitária com perfume, alvejante ou outros aditivos.",
    armazenar: "Frasco fechado, longe da luz, do calor e do alcance das crianças. Perde a força com o tempo: respeite a validade.",
    preparar: "Siga a dose do rótulo. Em geral, 2 gotas por litro de água e esperar 30 minutos antes de beber. Água turva: deixe decantar e coe num pano limpo antes de tratar.",
  },
  "Balde com tampa": {
    escolher: "Plástico de uso alimentar, com tampa que veda bem. Um com torneira facilita servir sem pôr a mão na água.",
    armazenar: "Limpo, seco e tampado, empilhado com os outros.",
    preparar: "Lave com água e sabão e enxágue antes de encher. Se for guardar água tratada, mantenha sempre tampado.",
  },
  "Arroz": {
    escolher: "Arroz branco tipo 1, embalagem fechada e sem furos. Dura bem mais que o integral, que tem óleo e rança antes.",
    armazenar: "Pote fechado em lugar seco e fresco, longe do chão. Uma folha de louro no pote ajuda a afastar carunchos.",
    preparar: "Cerca de 2 partes de água para 1 de arroz. Gasta água e gás: conte isso na reserva.",
  },
  "Feijão": {
    escolher: "Grãos inteiros, de cor uniforme, sem furinhos (sinal de caruncho). Feijão muito velho demora mais para cozinhar.",
    armazenar: "Pote fechado em lugar seco. Use o mais antigo primeiro.",
    preparar: "Deixar de molho de 8 a 12 horas e cozinhar na panela de pressão economiza gás. Feijão pronto em lata ou sachê dispensa água e gás.",
  },
  "Macarrão": {
    escolher: "Macarrão seco de sêmola ou comum, pacote fechado. Formatos pequenos cozinham mais rápido.",
    armazenar: "Pacote fechado ou pote, em lugar seco.",
    preparar: "Cozinha em menos tempo que arroz e feijão: é o que mais economiza gás. Macarrão instantâneo é ainda mais rápido.",
  },
  "Sardinha, atum ou carne em lata": {
    escolher: "Latas sem amassado, ferrugem ou estufamento. Prefira tampa abre-fácil; se não for, tenha um abridor manual.",
    armazenar: "Lugar seco. Lata estufada, vazando ou com cheiro estranho ao abrir: jogue fora sem provar.",
    preparar: "Pronto para comer frio. É proteína sem precisar de gás nem geladeira. Depois de aberto, passe para um pote e consuma no mesmo dia.",
  },
  "Leite de caixinha": {
    escolher: "Leite UHT (longa vida), caixa sem amassado nem estufamento. Leite em pó é alternativa que ocupa menos espaço.",
    armazenar: "Fechado, em temperatura ambiente. Depois de aberto, só na geladeira e pelo prazo do rótulo, geralmente poucos dias.",
    preparar: "Sem geladeira, abra caixas pequenas e consuma de uma vez.",
  },
  "Aveia": {
    escolher: "Aveia em flocos, pacote fechado.",
    armazenar: "Pote fechado em lugar seco.",
    preparar: "Pode comer crua, com leite, água ou fruta. Com fogo, vira mingau em poucos minutos.",
  },
  "Biscoito (maizena / água e sal)": {
    escolher: "Maizena, água e sal ou cream cracker: duram mais que recheados e não derretem no calor.",
    armazenar: "Depois de aberto, pote bem fechado para não amolecer.",
    preparar: "Pronto para comer. Bom para lanche das crianças na mochila.",
  },
  "Fruta em lata ou purê": {
    escolher: "Fruta em calda, purê de fruta em sachê ou papinha. Sachês com bico são práticos para crianças pequenas.",
    armazenar: "Lugar seco; latas sem amassado ou estufamento.",
    preparar: "Pronto para comer. Depois de aberto, consuma no mesmo dia.",
  },
  "Óleo": {
    escolher: "Garrafa PET fechada, de soja ou girassol.",
    armazenar: "Longe da luz e do calor do fogão: o óleo rança com o tempo. Use o mais antigo primeiro.",
    preparar: "",
  },
  "Sal": {
    escolher: "Sal refinado com iodo, pacote fechado.",
    armazenar: "Pote fechado, em lugar seco. Guardado seco, não estraga.",
    preparar: "",
  },
  "Açúcar": {
    escolher: "Açúcar refinado ou cristal, pacote fechado.",
    armazenar: "Pote bem fechado contra formigas e umidade.",
    preparar: "Também serve para dar energia rápida quando faltar comida.",
  },
  "Café": {
    escolher: "Pacote a vácuo dura mais que o almofadado. Café solúvel dispensa coador.",
    armazenar: "Depois de aberto, pote bem fechado, longe da umidade.",
    preparar: "",
  },
  "Fraldas": {
    escolher: "Tamanho pelo peso escrito no pacote, não pela idade. Tenha um pacote do tamanho seguinte quando estiver perto de trocar.",
    armazenar: "Lugar seco, no pacote fechado.",
    preparar: "Pacotes de reserva de tamanho que já não serve: troque ou doe antes de comprar mais.",
  },
  "Lenço umedecido": {
    escolher: "Sem perfume e sem álcool. Pacotes com tampa plástica ressecam menos.",
    armazenar: "Fechado, longe do sol. Depois de aberto resseca: abra um de cada vez.",
    preparar: "Também serve para higiene de todos quando faltar água.",
  },
  "Pomada para assadura": {
    escolher: "A que o pediatra indicou.",
    armazenar: "Bem tampada, em lugar fresco.",
    preparar: "",
  },
  "Lanterna LED": {
    escolher: "LED, que gasta pouca pilha. Prefira o mesmo tipo de pilha dos outros aparelhos da casa. Uma de cabeça deixa as mãos livres.",
    armazenar: "Guarde sem as pilhas dentro, para não vazarem e estragarem a lanterna. Deixe as pilhas junto, num saquinho.",
    preparar: "Teste uma vez por mês.",
  },
  "Pilhas": {
    escolher: "Alcalinas: duram mais guardadas do que as comuns. Padronize em AA e AAA sempre que der.",
    armazenar: "Na embalagem, em lugar fresco e seco. Não misture pilhas novas com usadas no mesmo aparelho.",
    preparar: "",
  },
  "Power bank": {
    escolher: "Veja a capacidade em mAh: um de 10.000 mAh carrega um celular comum cerca de 2 vezes. Marca conhecida, com selo da Anatel, e saída compatível com o cabo dos seus celulares.",
    armazenar: "Guarde com carga entre metade e 80% e recarregue a cada 3 meses. Longe do calor; se estufar, pare de usar.",
    preparar: "Deixe o cabo preso junto com o power bank.",
  },
  "Fósforo ou isqueiro": {
    escolher: "Fósforo de segurança e um isqueiro comum. Tenha os dois.",
    armazenar: "Fósforo dentro de saco plástico fechado, contra umidade. Fora do alcance das crianças.",
    preparar: "",
  },
  "Rádio a pilha": {
    escolher: "AM e FM. Modelos com manivela ou painel solar funcionam mesmo sem pilha.",
    armazenar: "Sem as pilhas dentro, como a lanterna.",
    preparar: "Teste uma vez por mês e anote as emissoras de notícias da sua cidade.",
  },
  "Botijão de gás reserva": {
    escolher: "P13, o de cozinha. Compre de revendedor autorizado, com lacre e rótulo da distribuidora.",
    armazenar: "Em pé, em lugar ventilado, longe de tomadas e de fogo. Nunca deitado nem em armário fechado.",
    preparar: "Ao trocar, passe água com sabão na conexão: se fizer bolha, há vazamento.",
  },
  "Antitérmico infantil": {
    escolher: "O que o pediatra já indicou, com a dose pelo peso da criança anotada na caixa. Mantenha a seringa dosadora junto.",
    armazenar: "Fechado, em lugar fresco e fora do alcance das crianças. Gotas e xarope abertos têm prazo menor: veja a bula.",
    preparar: "",
  },
  "Soro de reidratação oral": {
    escolher: "Envelopes de sais de reidratação oral, vendidos em farmácia e distribuídos nos postos de saúde.",
    armazenar: "Envelope fechado, em lugar seco.",
    preparar: "Dissolva um envelope na quantidade de água indicada na embalagem, usando água filtrada, fervida ou tratada. Depois de pronto, use em até 24 horas.",
  },
  "Termômetro": {
    escolher: "Digital. Tenha a bateria de reserva se não for de pilha comum.",
    armazenar: "No estojo, junto com os remédios.",
    preparar: "",
  },
  "Kit de curativos": {
    escolher: "Gaze, esparadrapo ou fita, curativos adesivos de tamanhos variados, soro fisiológico, luvas descartáveis e uma tesoura pequena.",
    armazenar: "Numa caixa ou estojo fechado. Confira a validade da gaze e do soro a cada 6 meses.",
    preparar: "",
  },
  "Álcool 70%": {
    escolher: "Líquido ou em gel. Frascos pequenos são práticos para a mochila.",
    armazenar: "Bem fechado, longe de fogo e calor: é inflamável.",
    preparar: "",
  },
  "Papel higiênico": {
    escolher: "Pacotes grandes saem mais baratos por rolo.",
    armazenar: "Lugar seco, dentro do pacote ou em saco plástico.",
    preparar: "",
  },
  "Sabonete": {
    escolher: "Em barra: dura mais e ocupa menos espaço que o líquido.",
    armazenar: "Na embalagem, em lugar seco.",
    preparar: "",
  },
  "Absorventes": {
    escolher: "Os que já são usados em casa. Coletor menstrual reduz a necessidade de reserva.",
    armazenar: "Lugar seco, na embalagem.",
    preparar: "",
  },
  "Sacos de lixo resistentes": {
    escolher: "Reforçados, de 100 L. Servem para lixo, banheiro de emergência, proteger coisas da chuva e como capa improvisada.",
    armazenar: "No rolo, junto da mochila.",
    preparar: "",
  },
  "Dinheiro em espécie (notas pequenas)": {
    escolher: "Notas de 2, 5, 10 e 20 e algumas moedas. Sem energia, maquininha e Pix podem parar.",
    armazenar: "Em envelope ou saco à prova d'água, dividido em mais de um lugar.",
    preparar: "",
  },
};
