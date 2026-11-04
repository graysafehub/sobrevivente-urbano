// Catálogo inicial: o plano escalonado da família (2 adultos + 3 crianças).
// metas = [3 dias, 1 semana, 2 semanas], na unidade do item. validade = item vence?
window.SEED_ITEMS = [
  // Água
  { nome: "Água potável (garrafas)", categoria: "Água", unidade: "L", metas: [60, 140, 280], validade: true, dica: "Água da torneira em PET limpa. Trocar a cada 6 meses." },
  { nome: "Hipoclorito de sódio 2,5%", categoria: "Água", unidade: "un", metas: [1, 1, 2], validade: true },
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
  { nome: "Fraldas", categoria: "Bebê", unidade: "un", metas: [20, 45, 80], validade: false, dica: "Reserva do tamanho seguinte quando estiver perto de trocar." },
  { nome: "Lenço umedecido", categoria: "Bebê", unidade: "pct", metas: [1, 2, 3], validade: true },
  { nome: "Pomada para assadura", categoria: "Bebê", unidade: "un", metas: [1, 1, 1], validade: true },

  // Luz e energia
  { nome: "Lanterna LED", categoria: "Luz e energia", unidade: "un", metas: [2, 2, 3], validade: false },
  { nome: "Pilhas", categoria: "Luz e energia", unidade: "un", metas: [8, 16, 24], validade: true },
  { nome: "Power bank", categoria: "Luz e energia", unidade: "un", metas: [1, 1, 2], validade: false },
  { nome: "Fósforo ou isqueiro", categoria: "Luz e energia", unidade: "un", metas: [1, 1, 1], validade: false },
  { nome: "Rádio a pilha", categoria: "Luz e energia", unidade: "un", metas: [0, 1, 1], validade: false },
  { nome: "Botijão de gás reserva", categoria: "Luz e energia", unidade: "un", metas: [0, 0, 1], validade: false, dica: "Antes de uma mudança, use até acabar." },

  // Saúde e higiene
  { nome: "Antitérmico infantil", categoria: "Saúde e higiene", unidade: "un", metas: [1, 1, 2], validade: true, dica: "O que o pediatra já indicou." },
  { nome: "Soro de reidratação oral", categoria: "Saúde e higiene", unidade: "un", metas: [4, 8, 12], validade: true },
  { nome: "Termômetro", categoria: "Saúde e higiene", unidade: "un", metas: [1, 1, 1], validade: false },
  { nome: "Kit de curativos", categoria: "Saúde e higiene", unidade: "un", metas: [1, 1, 1], validade: true },
  { nome: "Álcool 70%", categoria: "Saúde e higiene", unidade: "un", metas: [1, 1, 1], validade: true },
  { nome: "Papel higiênico", categoria: "Saúde e higiene", unidade: "rolo", metas: [4, 12, 24], validade: false },
  { nome: "Sabonete", categoria: "Saúde e higiene", unidade: "un", metas: [2, 4, 6], validade: false },
  { nome: "Absorventes", categoria: "Saúde e higiene", unidade: "pct", metas: [1, 1, 2], validade: false },
  { nome: "Sacos de lixo resistentes", categoria: "Saúde e higiene", unidade: "rolo", metas: [0, 1, 2], validade: false },

  // Documentos e dinheiro
  { nome: "Dinheiro em espécie (notas pequenas)", categoria: "Documentos e dinheiro", unidade: "R$", metas: [100, 200, 300], validade: false },
];

window.CATEGORIAS = ["Água", "Comida", "Bebê", "Luz e energia", "Saúde e higiene", "Documentos e dinheiro", "Outros"];
window.UNIDADES = ["kg", "g", "L", "ml", "un", "pct", "rolo", "R$"];
window.DEGRAUS = ["3 dias", "1 semana", "2 semanas"];
