// Catálogo inicial. Cada item diz como a meta é calculada (escala) e a quantidade base (qtd), na unidade do item:
//   "pessoa-dia" / "adulto-dia" / "bebe-dia" = qtd por pessoa por dia × pessoas × dias da meta (3, 7 ou 14)
//   "pessoa" / "adulto" = qtd por pessoa, não depende dos dias
//   "casa" = metas fixas [3 dias, 1 semana, 2 semanas]
// Adulto = 12 anos ou mais; bebê = até 2 anos. Bases de consumo: guias.js (Ready.gov, BYU).
// validade = item vence? spec = o que anotar em cada compra (capacidade, tamanho, tipo).
window.SEED_ITEMS = [
  // Água
  { nome: "Água potável (garrafas)", categoria: "Água", unidade: "L", escala: "pessoa-dia", qtd: 4, validade: true, dica: "Água da torneira em PET limpa. Trocar a cada 6 meses." },
  { nome: "Hipoclorito de sódio 2,5%", categoria: "Água", unidade: "un", escala: "casa", metas: [1, 1, 2], spec: "volume do frasco", validade: true },
  { nome: "Balde com tampa", categoria: "Água", unidade: "un", escala: "casa", metas: [2, 2, 2], validade: false },
  { nome: "Pano ou coador para filtrar água", categoria: "Água", unidade: "un", escala: "casa", metas: [1, 1, 2], validade: false },

  // Comida
  { nome: "Arroz", categoria: "Comida", unidade: "kg", escala: "pessoa-dia", qtd: 0.08, validade: true },
  { nome: "Feijão", categoria: "Comida", unidade: "kg", escala: "pessoa-dia", qtd: 0.06, validade: true },
  { nome: "Macarrão", categoria: "Comida", unidade: "kg", escala: "pessoa-dia", qtd: 0.05, validade: true },
  { nome: "Sardinha, atum ou carne em lata", categoria: "Comida", unidade: "un", escala: "pessoa-dia", qtd: 0.5, validade: true },
  { nome: "Leite de caixinha", categoria: "Comida", unidade: "L", escala: "pessoa-dia", qtd: 0.25, validade: true },
  { nome: "Aveia", categoria: "Comida", unidade: "kg", escala: "pessoa-dia", qtd: 0.03, validade: true },
  { nome: "Biscoito (maizena / água e sal)", categoria: "Comida", unidade: "pct", escala: "pessoa-dia", qtd: 1 / 3, validade: true },
  { nome: "Fruta em lata ou purê", categoria: "Comida", unidade: "un", escala: "pessoa-dia", qtd: 0.25, validade: true },
  { nome: "Óleo", categoria: "Comida", unidade: "L", escala: "pessoa-dia", qtd: 0.02, validade: true },
  { nome: "Sal", categoria: "Comida", unidade: "kg", escala: "pessoa-dia", qtd: 0.01, validade: true },
  { nome: "Açúcar", categoria: "Comida", unidade: "kg", escala: "pessoa-dia", qtd: 0.04, validade: true },
  { nome: "Café", categoria: "Comida", unidade: "kg", escala: "adulto-dia", qtd: 0.01, validade: true },
  { nome: "Abridor de lata manual", categoria: "Comida", unidade: "un", escala: "casa", metas: [2, 2, 2], validade: false },

  // Bebê
  { nome: "Fraldas", categoria: "Bebê", unidade: "un", escala: "bebe-dia", qtd: 6, spec: "tamanho (RN, P, M, G, XG)", validade: false, dica: "Reserva do tamanho seguinte quando estiver perto de trocar." },
  { nome: "Lenço umedecido", categoria: "Bebê", unidade: "pct", escala: "bebe-dia", qtd: 1 / 7, validade: true },
  { nome: "Pomada para assadura", categoria: "Bebê", unidade: "un", escala: "casa", metas: [1, 1, 1], validade: true },

  // Luz e energia
  { nome: "Lanterna LED", categoria: "Luz e energia", unidade: "un", escala: "pessoa", qtd: 1, spec: "tipo de pilha ou recarregável", validade: false },
  { nome: "Pilhas", categoria: "Luz e energia", unidade: "un", escala: "pessoa", qtd: 4, spec: "tipo (AA, AAA, D, 9 V)", validade: true },
  { nome: "Power bank", categoria: "Luz e energia", unidade: "un", escala: "adulto", qtd: 1, spec: "capacidade (mAh) e saídas", validade: false },
  { nome: "Fósforo ou isqueiro", categoria: "Luz e energia", unidade: "un", escala: "casa", metas: [2, 2, 2], validade: false },
  { nome: "Rádio a pilha", categoria: "Luz e energia", unidade: "un", escala: "casa", metas: [1, 1, 1], spec: "pilha, manivela ou solar", validade: false },
  { nome: "Botijão de gás reserva", categoria: "Luz e energia", unidade: "un", escala: "casa", metas: [0, 0, 1], spec: "tamanho (P13, P45)", validade: false, dica: "Antes de uma mudança, use até acabar." },

  // Saúde e higiene
  { nome: "Antitérmico infantil", categoria: "Saúde e higiene", unidade: "un", escala: "casa", metas: [1, 1, 2], spec: "remédio e concentração", validade: true, dica: "O que o pediatra já indicou." },
  { nome: "Soro de reidratação oral", categoria: "Saúde e higiene", unidade: "un", escala: "casa", metas: [4, 8, 12], validade: true },
  { nome: "Termômetro", categoria: "Saúde e higiene", unidade: "un", escala: "casa", metas: [1, 1, 1], validade: false },
  { nome: "Kit de curativos", categoria: "Saúde e higiene", unidade: "un", escala: "casa", metas: [1, 1, 1], spec: "o que tem no kit", validade: true },
  { nome: "Álcool 70%", categoria: "Saúde e higiene", unidade: "un", escala: "casa", metas: [1, 1, 1], validade: true },
  { nome: "Repelente", categoria: "Saúde e higiene", unidade: "un", escala: "casa", metas: [1, 1, 2], validade: true },
  { nome: "Máscara PFF2", categoria: "Saúde e higiene", unidade: "un", escala: "pessoa", qtd: 2, validade: true },
  { nome: "Papel higiênico", categoria: "Saúde e higiene", unidade: "rolo", escala: "pessoa-dia", qtd: 1 / 3, validade: false },
  { nome: "Sabonete", categoria: "Saúde e higiene", unidade: "un", escala: "pessoa-dia", qtd: 1 / 14, validade: false },
  { nome: "Escova de dentes reserva", categoria: "Saúde e higiene", unidade: "un", escala: "pessoa", qtd: 1, validade: false },
  { nome: "Pasta de dente", categoria: "Saúde e higiene", unidade: "un", escala: "casa", metas: [1, 1, 2], validade: true },
  { nome: "Absorventes", categoria: "Saúde e higiene", unidade: "pct", escala: "casa", metas: [1, 1, 2], spec: "tipo e tamanho", validade: false },
  { nome: "Sacos de lixo resistentes", categoria: "Saúde e higiene", unidade: "rolo", escala: "casa", metas: [1, 1, 2], validade: false },

  // Documentos e dinheiro
  { nome: "Dinheiro em espécie (notas pequenas)", categoria: "Documentos e dinheiro", unidade: "R$", escala: "casa", metas: [100, 200, 300], validade: false },

  // Outros
  { nome: "Apito", categoria: "Outros", unidade: "un", escala: "pessoa", qtd: 1, validade: false },
];

// família base, usada enquanto não houver fichas: 5 pessoas, 2 adultos, 1 bebê
window.BASE_FAMILIA = { pessoas: 5, adultos: 2, bebes: 1 };

window.CATEGORIAS = ["Água", "Comida", "Bebê", "Luz e energia", "Saúde e higiene", "Documentos e dinheiro", "Outros"];
window.UNIDADES = ["kg", "g", "L", "ml", "un", "pct", "rolo", "R$"];
window.DEGRAUS = ["3 dias", "1 semana", "2 semanas"];
window.DIAS = [3, 7, 14];

// Mochila da família. estoque = nome do item do catálogo, para mostrar se há em casa.
window.SEED_MOCHILA = [
  { nome: "Água (2 L por pessoa)", estoque: "Água potável (garrafas)" },
  { nome: "Lanterna", estoque: "Lanterna LED" },
  { nome: "Pilhas extras", estoque: "Pilhas" },
  { nome: "Power bank carregado e cabo", estoque: "Power bank" },
  { nome: "Rádio a pilha", estoque: "Rádio a pilha" },
  { nome: "Remédios de uso contínuo (3 dias)" },
  { nome: "Antitérmico infantil", estoque: "Antitérmico infantil" },
  { nome: "Soro de reidratação oral", estoque: "Soro de reidratação oral" },
  { nome: "Kit de curativos", estoque: "Kit de curativos" },
  { nome: "Fraldas e lenço umedecido", estoque: "Fraldas" },
  { nome: "Biscoito e comida pronta", estoque: "Biscoito (maizena / água e sal)" },
  { nome: "Dinheiro em notas pequenas", estoque: "Dinheiro em espécie (notas pequenas)" },
  { nome: "Cópia dos documentos em saco plástico" },
  { nome: "Cartão de bolso e esta lista impressa" },
  { nome: "Uma muda de roupa por pessoa" },
  { nome: "Capa de chuva ou saco de lixo", estoque: "Sacos de lixo resistentes" },
  { nome: "Apito", estoque: "Apito" },
  { nome: "Máscara PFF2", estoque: "Máscara PFF2" },
  { nome: "Abridor de lata", estoque: "Abridor de lata manual" },
];

window.TIPOS_SANGUE = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];
