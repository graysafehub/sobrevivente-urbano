// Catálogo inicial: o plano escalonado da família (2 adultos + 3 crianças).
// metas = [3 dias, 1 semana, 2 semanas], na unidade do item. validade = item vence?
// spec = o que anotar em cada compra (capacidade, tamanho, tipo); vira um campo na Entrada.
window.SEED_ITEMS = [
  // Água
  { nome: "Água potável (garrafas)", categoria: "Água", unidade: "L", metas: [60, 140, 280], validade: true, dica: "Água da torneira em PET limpa. Trocar a cada 6 meses." },
  { nome: "Hipoclorito de sódio 2,5%", categoria: "Água", unidade: "un", metas: [1, 1, 2], spec: "volume do frasco", validade: true },
  { nome: "Balde com tampa", categoria: "Água", unidade: "un", metas: [0, 2, 2], validade: false },

  // Comida
  { nome: "Arroz", categoria: "Comida", unidade: "kg", metas: [1, 3, 6], validade: true },
  { nome: "Feijão", categoria: "Comida", unidade: "kg", metas: [1, 2, 4], validade: true },
  { nome: "Macarrão", categoria: "Comida", unidade: "kg", metas: [1, 2, 4], validade: true },
  { nome: "Sardinha, atum ou carne em lata", categoria: "Comida", unidade: "un", metas: [4, 8, 16], validade: true },
  { nome: "Leite de caixinha", categoria: "Comida", unidade: "L", metas: [4, 8, 16], validade: true },
  { nome: "Aveia", categoria: "Comida", unidade: "kg", metas: [0.5, 1, 2], validade: true },
  { nome: "Biscoito (maizena / água e sal)", categoria: "Comida", unidade: "pct", metas: [3, 6, 12], validade: true },
  { nome: "Fruta em lata ou purê", categoria: "Comida", unidade: "un", metas: [2, 4, 8], validade: true },
  { nome: "Óleo", categoria: "Comida", unidade: "L", metas: [1, 1, 2], validade: true },
  { nome: "Sal", categoria: "Comida", unidade: "kg", metas: [0, 1, 2], validade: true },
  { nome: "Açúcar", categoria: "Comida", unidade: "kg", metas: [0, 1, 2], validade: true },
  { nome: "Café", categoria: "Comida", unidade: "kg", metas: [0, 0.5, 1], validade: true },

  // Bebê
  { nome: "Fraldas", categoria: "Bebê", unidade: "un", metas: [20, 45, 80], spec: "tamanho (RN, P, M, G, XG)", validade: false, dica: "Reserva do tamanho seguinte quando estiver perto de trocar." },
  { nome: "Lenço umedecido", categoria: "Bebê", unidade: "pct", metas: [1, 2, 3], validade: true },
  { nome: "Pomada para assadura", categoria: "Bebê", unidade: "un", metas: [1, 1, 1], validade: true },

  // Luz e energia
  { nome: "Lanterna LED", categoria: "Luz e energia", unidade: "un", metas: [2, 2, 3], spec: "tipo de pilha ou recarregável", validade: false },
  { nome: "Pilhas", categoria: "Luz e energia", unidade: "un", metas: [8, 16, 24], spec: "tipo (AA, AAA, D, 9 V)", validade: true },
  { nome: "Power bank", categoria: "Luz e energia", unidade: "un", metas: [1, 1, 2], spec: "capacidade (mAh) e saídas", validade: false },
  { nome: "Fósforo ou isqueiro", categoria: "Luz e energia", unidade: "un", metas: [1, 1, 1], validade: false },
  { nome: "Rádio a pilha", categoria: "Luz e energia", unidade: "un", metas: [0, 1, 1], spec: "pilha, manivela ou solar", validade: false },
  { nome: "Botijão de gás reserva", categoria: "Luz e energia", unidade: "un", metas: [0, 0, 1], spec: "tamanho (P13, P45)", validade: false, dica: "Antes de uma mudança, use até acabar." },

  // Saúde e higiene
  { nome: "Antitérmico infantil", categoria: "Saúde e higiene", unidade: "un", metas: [1, 1, 2], spec: "remédio e concentração", validade: true, dica: "O que o pediatra já indicou." },
  { nome: "Soro de reidratação oral", categoria: "Saúde e higiene", unidade: "un", metas: [4, 8, 12], validade: true },
  { nome: "Termômetro", categoria: "Saúde e higiene", unidade: "un", metas: [1, 1, 1], validade: false },
  { nome: "Kit de curativos", categoria: "Saúde e higiene", unidade: "un", metas: [1, 1, 1], spec: "o que tem no kit", validade: true },
  { nome: "Álcool 70%", categoria: "Saúde e higiene", unidade: "un", metas: [1, 1, 1], validade: true },
  { nome: "Papel higiênico", categoria: "Saúde e higiene", unidade: "rolo", metas: [4, 12, 24], validade: false },
  { nome: "Sabonete", categoria: "Saúde e higiene", unidade: "un", metas: [2, 4, 6], validade: false },
  { nome: "Absorventes", categoria: "Saúde e higiene", unidade: "pct", metas: [1, 1, 2], spec: "tipo e tamanho", validade: false },
  { nome: "Sacos de lixo resistentes", categoria: "Saúde e higiene", unidade: "rolo", metas: [0, 1, 2], validade: false },

  // Documentos e dinheiro
  { nome: "Dinheiro em espécie (notas pequenas)", categoria: "Documentos e dinheiro", unidade: "R$", metas: [100, 200, 300], validade: false },
];

// As metas acima são para a família base. No app, elas crescem com as fichas da família:
// "pessoa" = proporcional ao número de pessoas, "bebe" = ao número de bebês (até 2 anos), "fixo" = não muda.
window.BASE_FAMILIA = { pessoas: 5, bebes: 1 };
const ESCALA_BEBE = ["Fraldas", "Lenço umedecido", "Pomada para assadura"];
const ESCALA_FIXA = [
  "Hipoclorito de sódio 2,5%", "Balde com tampa", "Lanterna LED", "Pilhas", "Power bank", "Fósforo ou isqueiro",
  "Rádio a pilha", "Botijão de gás reserva", "Antitérmico infantil", "Termômetro", "Kit de curativos", "Álcool 70%",
  "Absorventes", "Sacos de lixo resistentes", "Dinheiro em espécie (notas pequenas)",
];
for (const i of window.SEED_ITEMS) {
  i.escala = ESCALA_BEBE.includes(i.nome) ? "bebe" : ESCALA_FIXA.includes(i.nome) ? "fixo" : "pessoa";
}

window.CATEGORIAS = ["Água", "Comida", "Bebê", "Luz e energia", "Saúde e higiene", "Documentos e dinheiro", "Outros"];
window.UNIDADES = ["kg", "g", "L", "ml", "un", "pct", "rolo", "R$"];
window.DEGRAUS = ["3 dias", "1 semana", "2 semanas"];

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
  { nome: "Apito" },
];

window.TIPOS_SANGUE = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];
