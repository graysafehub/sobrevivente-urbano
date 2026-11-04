// Guia de compra de cada item do catálogo: como escolher, como guardar e como preparar para guardar.
// preparar = o que fazer com o item antes de estocar (não é receita); vazio quando não há preparo.
// Chave = nome do item. Itens criados pelo usuário não têm guia.
window.GUIAS = {
  "Água potável (garrafas)": {
    escolher: "Garrafões de 5 L ou garrafas de água mineral lacradas. Também serve água da torneira em garrafa PET de água ou refrigerante bem lavada; nunca em embalagem que teve produto de limpeza.",
    armazenar: "Lugar fresco, escuro e longe de produtos químicos, combustível e chão úmido. Marque a data na garrafa e troque a cada 6 meses.",
    preparar: "Lave a garrafa e a tampa com água e sabão e enxágue bem. Encha com água da torneira, feche bem e escreva a data na garrafa. Para mais garantia, trate com hipoclorito conforme o rótulo antes de fechar.",
  },
  "Hipoclorito de sódio 2,5%": {
    escolher: "O frasco vendido em farmácia ou distribuído no posto de saúde para tratar água para beber. Não use água sanitária com perfume, alvejante ou outros aditivos.",
    armazenar: "Frasco fechado, longe da luz, do calor e do alcance das crianças. Perde a força com o tempo: respeite a validade.",
    preparar: "",
  },
  "Balde com tampa": {
    escolher: "Plástico de uso alimentar, com tampa que veda bem. Um com torneira facilita servir sem pôr a mão na água.",
    armazenar: "Limpo, seco e tampado, empilhado com os outros.",
    preparar: "Lave com água e sabão e enxágue antes de encher. Escreva na tampa a data em que encheu.",
  },
  "Arroz": {
    escolher: "Arroz branco tipo 1, embalagem fechada e sem furos. Dura bem mais que o integral, que tem óleo e rança antes.",
    armazenar: "Pote fechado em lugar seco e fresco, longe do chão. Uma folha de louro no pote ajuda a afastar carunchos.",
    preparar: "Passe do pacote para um pote com tampa que vede. Para evitar carunchos, deixe o pacote fechado 2 dias no congelador antes de guardar. Escreva a validade no pote.",
  },
  "Feijão": {
    escolher: "Grãos inteiros, de cor uniforme, sem furinhos (sinal de caruncho). Feijão muito velho demora mais para cozinhar.",
    armazenar: "Pote fechado em lugar seco. Use o mais antigo primeiro.",
    preparar: "Passe do pacote para um pote com tampa que vede. Para evitar carunchos, deixe o pacote fechado 2 dias no congelador antes de guardar. Escreva a validade no pote.",
  },
  "Macarrão": {
    escolher: "Macarrão seco de sêmola ou comum, pacote fechado. Formatos pequenos cozinham mais rápido.",
    armazenar: "Pacote fechado ou pote, em lugar seco.",
    preparar: "Pacote aberto: passe para um pote fechado e escreva a validade.",
  },
  "Sardinha, atum ou carne em lata": {
    escolher: "Latas sem amassado, ferrugem ou estufamento. Prefira tampa abre-fácil; se não for, tenha um abridor manual.",
    armazenar: "Lugar seco. Lata estufada, vazando ou com cheiro estranho ao abrir: jogue fora sem provar.",
    preparar: "Escreva a validade em letras grandes na tampa, para ler sem tirar da prateleira. Latas novas no fundo, antigas na frente.",
  },
  "Leite de caixinha": {
    escolher: "Leite UHT (longa vida), caixa sem amassado nem estufamento. Leite em pó é alternativa que ocupa menos espaço.",
    armazenar: "Fechado, em temperatura ambiente. Depois de aberto, só na geladeira e pelo prazo do rótulo, geralmente poucos dias.",
    preparar: "Escreva a validade no topo da caixa. Caixas novas no fundo, antigas na frente.",
  },
  "Aveia": {
    escolher: "Aveia em flocos, pacote fechado.",
    armazenar: "Pote fechado em lugar seco.",
    preparar: "Depois de aberta, passe para um pote fechado e escreva a validade.",
  },
  "Biscoito (maizena / água e sal)": {
    escolher: "Maizena, água e sal ou cream cracker: duram mais que recheados e não derretem no calor.",
    armazenar: "Depois de aberto, pote bem fechado para não amolecer.",
    preparar: "",
  },
  "Fruta em lata ou purê": {
    escolher: "Fruta em calda, purê de fruta em sachê ou papinha. Sachês com bico são práticos para crianças pequenas.",
    armazenar: "Lugar seco; latas sem amassado ou estufamento.",
    preparar: "Escreva a validade em letras grandes na tampa. Novas no fundo, antigas na frente.",
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
    preparar: "Passe para um pote com tampa que vede.",
  },
  "Café": {
    escolher: "Pacote a vácuo dura mais que o almofadado. Café solúvel dispensa coador.",
    armazenar: "Depois de aberto, pote bem fechado, longe da umidade.",
    preparar: "",
  },
  "Fraldas": {
    escolher: "Tamanho pelo peso escrito no pacote, não pela idade. Tenha um pacote do tamanho seguinte quando estiver perto de trocar.",
    armazenar: "Lugar seco, no pacote fechado.",
    preparar: "Separe um pacote fechado para a mochila e escreva o tamanho por fora.",
  },
  "Lenço umedecido": {
    escolher: "Sem perfume e sem álcool. Pacotes com tampa plástica ressecam menos.",
    armazenar: "Fechado, longe do sol. Depois de aberto resseca: abra um de cada vez.",
    preparar: "",
  },
  "Pomada para assadura": {
    escolher: "A que o pediatra indicou.",
    armazenar: "Bem tampada, em lugar fresco.",
    preparar: "",
  },
  "Lanterna LED": {
    escolher: "LED, que gasta pouca pilha. Prefira o mesmo tipo de pilha dos outros aparelhos da casa. Uma de cabeça deixa as mãos livres.",
    armazenar: "Guarde sem as pilhas dentro, para não vazarem e estragarem a lanterna. Deixe as pilhas junto, num saquinho.",
    preparar: "Tire as pilhas antes de guardar e deixe-as junto, num saquinho preso à lanterna.",
  },
  "Pilhas": {
    escolher: "Alcalinas: duram mais guardadas do que as comuns. Padronize em AA e AAA sempre que der.",
    armazenar: "Na embalagem, em lugar fresco e seco. Não misture pilhas novas com usadas no mesmo aparelho.",
    preparar: "Escreva o mês da compra na embalagem.",
  },
  "Power bank": {
    escolher: "Veja a capacidade em mAh: um de 10.000 mAh carrega um celular comum cerca de 2 vezes. Marca conhecida, com selo da Anatel, e saída compatível com o cabo dos seus celulares.",
    armazenar: "Guarde com carga entre metade e 80% e recarregue a cada 3 meses. Longe do calor; se estufar, pare de usar.",
    preparar: "Carregue até mais ou menos 3/4 antes de guardar, prenda o cabo junto e anote a data da carga.",
  },
  "Fósforo ou isqueiro": {
    escolher: "Fósforo de segurança e um isqueiro comum. Tenha os dois.",
    armazenar: "Fósforo dentro de saco plástico fechado, contra umidade. Fora do alcance das crianças.",
    preparar: "Coloque a caixa de fósforos dentro de um saco plástico com fecho.",
  },
  "Rádio a pilha": {
    escolher: "AM e FM. Modelos com manivela ou painel solar funcionam mesmo sem pilha.",
    armazenar: "Sem as pilhas dentro, como a lanterna.",
    preparar: "Tire as pilhas antes de guardar. Anote num papel, junto do rádio, as emissoras de notícias da cidade.",
  },
  "Botijão de gás reserva": {
    escolher: "P13, o de cozinha. Compre de revendedor autorizado, com lacre e rótulo da distribuidora.",
    armazenar: "Em pé, em lugar ventilado, longe de tomadas e de fogo. Nunca deitado nem em armário fechado.",
    preparar: "Confira o lacre ao receber. Ao instalar, passe água com sabão na conexão: se fizer bolha, há vazamento.",
  },
  "Antitérmico infantil": {
    escolher: "O que o pediatra já indicou, com a dose pelo peso da criança anotada na caixa. Mantenha a seringa dosadora junto.",
    armazenar: "Fechado, em lugar fresco e fora do alcance das crianças. Gotas e xarope abertos têm prazo menor: veja a bula.",
    preparar: "Escreva na caixa a dose pelo peso que o pediatra indicou e prenda a seringa dosadora junto.",
  },
  "Soro de reidratação oral": {
    escolher: "Envelopes de sais de reidratação oral, vendidos em farmácia e distribuídos nos postos de saúde.",
    armazenar: "Envelope fechado, em lugar seco.",
    preparar: "Separe alguns envelopes para a mochila.",
  },
  "Termômetro": {
    escolher: "Digital. Tenha a bateria de reserva se não for de pilha comum.",
    armazenar: "No estojo, junto com os remédios.",
    preparar: "",
  },
  "Kit de curativos": {
    escolher: "Gaze, esparadrapo ou fita, curativos adesivos de tamanhos variados, soro fisiológico, luvas descartáveis e uma tesoura pequena.",
    armazenar: "Numa caixa ou estojo fechado. Confira a validade da gaze e do soro a cada 6 meses.",
    preparar: "Monte numa caixa ou estojo e cole na tampa a lista do que tem dentro, com as validades.",
  },
  "Álcool 70%": {
    escolher: "Líquido ou em gel. Frascos pequenos são práticos para a mochila.",
    armazenar: "Bem fechado, longe de fogo e calor: é inflamável.",
    preparar: "",
  },
  "Papel higiênico": {
    escolher: "Pacotes grandes saem mais baratos por rolo.",
    armazenar: "Lugar seco, dentro do pacote ou em saco plástico.",
    preparar: "Separe alguns rolos num saco plástico fechado, protegidos da umidade.",
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
    armazenar: "Longe da umidade, em lugar discreto.",
    preparar: "Separe em mais de um envelope à prova d'água: um na mochila, outro em casa.",
  },
};
