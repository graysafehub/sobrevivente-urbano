// Catálogo inicial. Cada item diz como a meta é calculada (escala) e a quantidade base (qtd), na unidade do item:
//   "pessoa-dia" / "adulto-dia" / "bebe-dia" = qtd por pessoa por dia × pessoas × dias da meta (3, 7 ou 14)
//   "pessoa" / "adulto" = qtd por pessoa, não depende dos dias
//   "casa" = metas fixas [3 dias, 1 semana, 2 semanas]
// Adulto = 12 anos ou mais; bebê = até 2 anos. Bases de consumo: guias.js (Ready.gov, BYU).
// validade = item vence? vidaMeses = quanto costuma durar (sugere a data na entrada). spec = o que anotar em cada compra (capacidade, tamanho, tipo).
window.SEED_ITEMS = [
  // Água
  { nome: "Água potável (garrafas)", categoria: "Água", unidade: "L", escala: "pessoa-dia", qtd: 4, validade: true, vidaMeses: 6, dica: "Água da torneira em PET limpa. Trocar a cada 6 meses." },
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
  { nome: "Absorvedor de oxigênio", categoria: "Comida", unidade: "pct", escala: "casa", metas: [0, 1, 1], spec: "capacidade (cc) e unidades no pacote", validade: true, vidaMeses: 6, dica: "Só para quem passa arroz, feijão ou macarrão para garrafa PET." },
  { nome: "Copos, pratos e talheres descartáveis", categoria: "Comida", unidade: "pct", escala: "casa", metas: [1, 1, 2], validade: false },
  { nome: "Abridor de lata manual", categoria: "Comida", unidade: "un", escala: "casa", metas: [2, 2, 2], validade: false },

  // Bebê
  { nome: "Fraldas", categoria: "Bebê", unidade: "un", escala: "bebe-dia", qtd: 6, spec: "tamanho (RN, P, M, G, XG)", validade: false, dica: "Reserva do tamanho seguinte quando estiver perto de trocar." },
  { nome: "Lenço umedecido", categoria: "Bebê", unidade: "pct", escala: "bebe-dia", qtd: 1 / 7, validade: true },
  { nome: "Fórmula infantil", categoria: "Bebê", unidade: "un", escala: "bebe-dia", qtd: 1 / 7, spec: "marca e fase (1, 2, 3)", validade: true, dica: "Só se o bebê toma fórmula; a que o pediatra indicou." },
  { nome: "Pomada para assadura", categoria: "Bebê", unidade: "un", escala: "casa", metas: [1, 1, 1], validade: true },

  // Luz e energia
  { nome: "Lanterna LED", categoria: "Luz e energia", unidade: "un", escala: "pessoa", qtd: 1, spec: "tipo de pilha ou recarregável", validade: false },
  { nome: "Pilhas", categoria: "Luz e energia", unidade: "un", escala: "pessoa", qtd: 4, spec: "tipo (AA, AAA, D, 9 V)", validade: true },
  { nome: "Power bank", categoria: "Luz e energia", unidade: "un", escala: "adulto", qtd: 1, spec: "capacidade (mAh) e saídas", validade: false },
  { nome: "Carregador e cabo de celular", categoria: "Luz e energia", unidade: "un", escala: "adulto", qtd: 1, spec: "conector (USB-C, Lightning)", validade: false },
  { nome: "Fósforo ou isqueiro", categoria: "Luz e energia", unidade: "un", escala: "casa", metas: [2, 2, 2], validade: false },
  { nome: "Rádio a pilha", categoria: "Luz e energia", unidade: "un", escala: "casa", metas: [1, 1, 1], spec: "pilha, manivela ou solar", validade: false },
  { nome: "Botijão de gás reserva", categoria: "Luz e energia", unidade: "un", escala: "casa", metas: [0, 0, 1], spec: "tamanho (P13, P45)", validade: false, dica: "Antes de uma mudança, use até acabar." },

  // Saúde e higiene
  { nome: "Antitérmico infantil", categoria: "Saúde e higiene", unidade: "un", escala: "casa", metas: [1, 1, 2], spec: "remédio e concentração", validade: true, dica: "O que o pediatra já indicou." },
  { nome: "Analgésico adulto", categoria: "Saúde e higiene", unidade: "un", escala: "casa", metas: [1, 1, 1], spec: "remédio e concentração", validade: true, dica: "O que a família já usa e tolera." },
  { nome: "Soro de reidratação oral", categoria: "Saúde e higiene", unidade: "un", escala: "casa", metas: [4, 8, 12], validade: true },
  { nome: "Termômetro", categoria: "Saúde e higiene", unidade: "un", escala: "casa", metas: [1, 1, 1], validade: false },
  { nome: "Kit de curativos", categoria: "Saúde e higiene", unidade: "un", escala: "casa", metas: [1, 1, 1], spec: "o que tem no kit", validade: true },
  { nome: "Álcool 70%", categoria: "Saúde e higiene", unidade: "un", escala: "casa", metas: [1, 1, 1], validade: true },
  { nome: "Repelente", categoria: "Saúde e higiene", unidade: "un", escala: "casa", metas: [1, 1, 2], validade: true },
  { nome: "Máscara PFF2", categoria: "Saúde e higiene", unidade: "un", escala: "pessoa", qtd: 2, validade: true },
  { nome: "Lenço umedecido para higiene", categoria: "Saúde e higiene", unidade: "pct", escala: "pessoa-dia", qtd: 1 / 14, validade: true, vidaMeses: 12 },
  { nome: "Papel higiênico", categoria: "Saúde e higiene", unidade: "rolo", escala: "pessoa-dia", qtd: 1 / 3, validade: false },
  { nome: "Sabonete", categoria: "Saúde e higiene", unidade: "un", escala: "pessoa-dia", qtd: 1 / 14, validade: false },
  { nome: "Escova de dentes reserva", categoria: "Saúde e higiene", unidade: "un", escala: "pessoa", qtd: 1, validade: false },
  { nome: "Pasta de dente", categoria: "Saúde e higiene", unidade: "un", escala: "casa", metas: [1, 1, 2], validade: true },
  { nome: "Absorventes", categoria: "Saúde e higiene", unidade: "pct", escala: "casa", metas: [1, 1, 2], spec: "tipo e tamanho", validade: false },
  { nome: "Água sanitária (sem perfume)", categoria: "Saúde e higiene", unidade: "un", escala: "casa", metas: [1, 1, 2], spec: "volume do frasco", validade: true },
  { nome: "Luvas de borracha (par)", categoria: "Saúde e higiene", unidade: "un", escala: "adulto", qtd: 1, validade: false },
  { nome: "Botas de borracha (par)", categoria: "Saúde e higiene", unidade: "un", escala: "adulto", qtd: 1, spec: "número", validade: false },
  { nome: "Sacos de lixo resistentes", categoria: "Saúde e higiene", unidade: "rolo", escala: "casa", metas: [1, 1, 2], validade: false },

  // Documentos e dinheiro
  { nome: "Dinheiro em espécie (notas pequenas)", categoria: "Documentos e dinheiro", unidade: "R$", escala: "casa", metas: [100, 200, 300], validade: false },
  { nome: "Cópias dos documentos", categoria: "Documentos e dinheiro", unidade: "un", escala: "casa", metas: [1, 1, 1], validade: false, dica: "Só no papel: o app não guarda números de documento." },

  // Outros
  { nome: "Cobertor ou manta", categoria: "Outros", unidade: "un", escala: "pessoa", qtd: 1, validade: false },
  { nome: "Lona plástica e fita adesiva", categoria: "Outros", unidade: "un", escala: "casa", metas: [1, 1, 1], spec: "tamanho da lona", validade: false },
  { nome: "Alicate ou chave inglesa", categoria: "Outros", unidade: "un", escala: "casa", metas: [1, 1, 1], validade: false },
  { nome: "Apito", categoria: "Outros", unidade: "un", escala: "pessoa", qtd: 1, validade: false },
];

// família base, usada enquanto não houver fichas: 5 pessoas, 2 adultos, 1 bebê
window.BASE_FAMILIA = { pessoas: 5, adultos: 2, bebes: 1 };

// preço base por unidade do item (R$), de uma pesquisa básica de varejo em nov/2026: média de mercado,
// farmácia e lojas online, sem cidade definida. Serve para estimar a lista e comparar na hora da compra;
// o que você paga de verdade passa a valer no lugar dele.
window.PRECO_BASE_DATA = "nov/2026";
window.PRECO_BASE = {
  "Água potável (garrafas)": 1.9, "Hipoclorito de sódio 2,5%": 5, "Balde com tampa": 30, "Pano ou coador para filtrar água": 10,
  "Arroz": 5, "Feijão": 7, "Macarrão": 9, "Sardinha, atum ou carne em lata": 6, "Leite de caixinha": 5, "Aveia": 14,
  "Biscoito (maizena / água e sal)": 5, "Fruta em lata ou purê": 10, "Óleo": 8.9, "Sal": 3, "Açúcar": 4.5, "Café": 50,
  "Absorvedor de oxigênio": 40, "Copos, pratos e talheres descartáveis": 15, "Abridor de lata manual": 15,
  "Fraldas": 1, "Lenço umedecido": 10, "Fórmula infantil": 85, "Pomada para assadura": 20,
  "Lanterna LED": 25, "Pilhas": 5, "Power bank": 90, "Carregador e cabo de celular": 40, "Fósforo ou isqueiro": 5,
  "Rádio a pilha": 60, "Botijão de gás reserva": 115,
  "Antitérmico infantil": 15, "Analgésico adulto": 12, "Soro de reidratação oral": 3, "Termômetro": 25, "Kit de curativos": 40,
  "Álcool 70%": 12, "Repelente": 15, "Máscara PFF2": 2, "Lenço umedecido para higiene": 10, "Papel higiênico": 1.6,
  "Sabonete": 2.5, "Escova de dentes reserva": 5, "Pasta de dente": 6, "Absorventes": 8, "Água sanitária (sem perfume)": 8,
  "Luvas de borracha (par)": 12, "Botas de borracha (par)": 60, "Sacos de lixo resistentes": 15,
  "Cópias dos documentos": 10, "Cobertor ou manta": 40, "Lona plástica e fita adesiva": 55, "Alicate ou chave inglesa": 30, "Apito": 5,
};

window.CATEGORIAS = ["Água", "Comida", "Bebê", "Luz e energia", "Saúde e higiene", "Documentos e dinheiro", "Outros"];
window.UNIDADES = ["kg", "g", "L", "ml", "un", "pct", "rolo", "R$"];
// metas: 3 dias, 1 semana e 2 semanas; depois 1 mês e, de 15 em 15 dias, 1 mês e meio, 2 meses…
// DEGRAUS são as três de base (itens por casa têm a meta digitada para cada uma).
window.DEGRAUS = ["3 dias", "1 semana", "2 semanas"];
window.diasDe = d => d < 3 ? [3, 7, 14][d] : 30 + 15 * (d - 3);
window.nomeDegrau = d => {
  if (d < 3) return DEGRAUS[d];
  const n = diasDe(d), m = Math.floor(n / 30);
  return `${m} ${m === 1 ? "mês" : "meses"}${n % 30 ? " e meio" : ""}`;
};

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
  { nome: "Cópia dos documentos em saco plástico", estoque: "Cópias dos documentos" },
  { nome: "Cobertor ou manta térmica", estoque: "Cobertor ou manta" },
  { nome: "Cabo do celular", estoque: "Carregador e cabo de celular" },
  { nome: "Cartão de bolso e esta lista impressa" },
  { nome: "Uma muda de roupa por pessoa" },
  { nome: "Capa de chuva ou saco de lixo", estoque: "Sacos de lixo resistentes" },
  { nome: "Apito", estoque: "Apito" },
  { nome: "Máscara PFF2", estoque: "Máscara PFF2" },
  { nome: "Abridor de lata", estoque: "Abridor de lata manual" },
];

window.TIPOS_SANGUE = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];
