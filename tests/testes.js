// Testes das contas que não podem errar: metas, junção de dois celulares, consumo medido,
// coordenadas, avaliação de preço e migração de dados antigos.
// Rodar: node tests/testes.js  (sem instalar nada; carrega os arquivos do app com uma tela de mentira)

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const raiz = path.join(__dirname, "..");
const scripts = [...fs.readFileSync(path.join(raiz, "index.html"), "utf8").matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);

// tela de mentira: o suficiente para os arquivos carregarem e o render rodar sem navegador
function elemento() {
  return new Proxy({ value: "", textContent: "", innerHTML: "", hidden: false, dataset: {}, classList: { toggle() {}, add() {} } }, {
    get: (o, k) => k in o ? o[k] : (k === "querySelectorAll" ? () => [] : k === "querySelector" ? () => null : () => {}),
    set: (o, k, v) => { o[k] = v; return true; },
  });
}
const guardado = {};
const ctx = {
  console, setTimeout, clearTimeout, setInterval: () => 0, URL, Blob: class {}, File: class {}, FileReader: class {},
  AbortSignal: { timeout: () => undefined },
  document: { getElementById: () => elemento(), querySelectorAll: () => [], querySelector: () => null, addEventListener() {}, body: elemento(), createElement: elemento },
  location: { hash: "" },
  navigator: { onLine: false },
  localStorage: { getItem: k => guardado[k] ?? null, setItem: (k, v) => { guardado[k] = String(v); }, removeItem: k => { delete guardado[k]; } },
  scrollTo() {}, addEventListener() {}, fetch: async () => { throw new Error("sem rede nos testes"); },
};
ctx.window = ctx;
vm.createContext(ctx);
const codigo = scripts.map(s => fs.readFileSync(path.join(raiz, s), "utf8")).join("\n;\n");

// os testes rodam no mesmo escopo dos arquivos do app (const e function de lá ficam visíveis)
const testes = String.raw`
let falhas = 0, ok = 0;
function igual(nome, obtido, esperado) {
  const a = JSON.stringify(obtido), b = JSON.stringify(esperado);
  if (a === b) ok++; else { falhas++; console.log("FALHOU: " + nome + "\n  obtido:   " + a + "\n  esperado: " + b); }
}
const familia = () => [
  { id: "a1", nome: "Adulto 1", nascimento: "1985-01-01" }, { id: "a2", nome: "Adulto 2", nascimento: "1987-01-01" },
  { id: "c1", nome: "Criança 10", nascimento: "2016-03-01" }, { id: "c2", nome: "Criança 4", nascimento: "2022-06-01" },
  { id: "b1", nome: "Bebê", nascimento: hojeMenos(400) },
];
function hojeMenos(n) { const d = hoje(); d.setDate(d.getDate() - n); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
const porNome = (s, n) => s.items.find(i => i.nome === n);

// ---------- metas ----------
state = seedState(); state.familia.pessoas = familia();
igual("família contada", [nPessoas(), nAdultos(), nBebes()], [5, 2, 1]);
igual("nomes das metas", [0, 1, 2, 3, 4, 5, 6].map(nomeDegrau), ["3 dias", "1 semana", "2 semanas", "1 mês", "1 mês e meio", "2 meses", "2 meses e meio"]);
igual("dias das metas", [0, 1, 2, 3, 4, 5].map(diasDe), [3, 7, 14, 30, 45, 60]);
igual("arroz por pessoa por dia", [0, 1, 2, 3, 4].map(d => metaDe(porNome(state, "Arroz"), d)), [1.2, 2.8, 5.6, 12, 18]);
igual("água 4 L por pessoa", [0, 1, 2].map(d => metaDe(porNome(state, "Água potável (garrafas)"), d)), [60, 140, 280]);
igual("fraldas por bebê", [0, 1, 2].map(d => metaDe(porNome(state, "Fraldas"), d)), [18, 42, 84]);
igual("power bank por adulto", metaDe(porNome(state, "Power bank"), 4), 2);
igual("rádio (equipamento) não cresce", [0, 2, 3, 5].map(d => metaDe(porNome(state, "Rádio a pilha"), d)), [1, 1, 1, 1]);
igual("hipoclorito cresce de 1 em 1", [0, 1, 2, 3, 4].map(d => metaDe(porNome(state, "Hipoclorito de sódio 2,5%"), d)), [1, 1, 2, 3, 4]);
igual("dinheiro cresce de 100 em 100", [2, 3, 4].map(d => metaDe(porNome(state, "Dinheiro em espécie (notas pequenas)"), d)), [300, 400, 500]);
igual("arredonda para cima", [arredMeta(1.05, "un"), arredMeta(1.11, "un"), arredMeta(0.33, "kg"), arredMeta(101, "R$")], [1, 2, 0.4, 110]);
state.config.degrau = 0; igual("níveis à vista na meta de 3 dias", nDegraus(), 3);
state.config.degrau = 1; igual("na meta de 1 semana abre 1 mês", nDegraus(), 4);
state.config.degrau = 2; igual("na meta de 2 semanas abre 1 mês e meio", [nDegraus(), janelaDegraus()], [5, [1, 2, 3]]);

// ---------- consumo medido ----------
state = seedState();
const arroz = porNome(state, "Arroz");
state.movs.push({ id: "e", itemId: arroz.id, tipo: "entrada", qtd: 10, data: hojeMenos(30) });
for (const n of [25, 18, 11, 4]) state.movs.push({ id: "c" + n, itemId: arroz.id, tipo: "consumo", qtd: 1, data: hojeMenos(n) });
state.movs.push({ id: "p", itemId: arroz.id, tipo: "perda", qtd: 2, data: hojeMenos(5) });
const med = consumoMedido(arroz);
igual("consumo medido ignora perda", [med.ok, med.dias, med.saidas, med.total, Math.round(med.porDia * 1000)], [true, 30, 4, 4, 133]);
arroz.usarMedido = true;
igual("meta pelo consumo medido", metaDe(arroz, 2), 1.9);
const cafe = porNome(state, "Café");
state.movs.push({ id: "cf", itemId: cafe.id, tipo: "consumo", qtd: 0.2, data: hojeMenos(2) });
igual("poucos dias não mede", consumoMedido(cafe).ok, false);

// ---------- junção de dois celulares ----------
{
  const clone = o => JSON.parse(JSON.stringify(o));
  let A = seedState(); const idArroz = porNome(A, "Arroz").id;
  A.lotes.push({ id: "L1", itemId: idArroz, qtd: 10, qtdInicial: 10 });
  A.movs.push({ id: "e1", itemId: idArroz, tipo: "entrada", qtd: 10, data: "2026-11-01" });
  let B = migrar(clone(A));
  state = A; let bx = []; darSaida(idArroz, 2, bx); A.movs.push({ id: "sA", itemId: idArroz, tipo: "consumo", qtd: 2, baixas: bx, data: "2026-11-02" });
  const idApito = porNome(A, "Apito").id; A.excluidos.items[idApito] = null; A.items = A.items.filter(i => i.id !== idApito);
  A.manutencao.agua = "2026-10-01";
  state = B; bx = []; darSaida(idArroz, 3, bx); B.movs.push({ id: "sB", itemId: idArroz, tipo: "consumo", qtd: 3, baixas: bx, data: "2026-11-03" });
  B.familia.contatos.push({ id: "k1", nome: "Tia", tel: "(61) 99999-0000", fora: true });
  B.manutencao.agua = "2026-11-03";
  state = A; juntarEstado(A, migrar(clone(B)));
  igual("saídas dos dois somam no lote", A.lotes.find(l => l.id === "L1").qtd, 5);
  igual("contato do outro entra", A.familia.contatos.map(c => c.nome), ["Tia"]);
  igual("manutenção fica com a data mais nova", A.manutencao.agua, "2026-11-03");
  state = B; juntarEstado(B, migrar(clone(A)));
  igual("exclusão passa para o outro", !!porNome(B, "Apito"), false);
  igual("os dois ficam iguais", B.lotes.find(l => l.id === "L1").qtd, 5);
  const r = juntarEstado(B, migrar(clone(A)));
  igual("juntar de novo não duplica", [r.lotes, r.movs, r.itens, B.movs.length], [0, 0, 0, A.movs.length]);
}

// ---------- coordenadas ----------
igual("números com vírgula", lerCoordenadas("-15.79390, -47.88280"), { lat: -15.7939, lon: -47.8828 });
igual("link do lugar no Maps", lerCoordenadas("https://www.google.com/maps/place/X/@-15.79,-47.88,17z/data=!3d-15.7939!4d-47.8828"), { lat: -15.7939, lon: -47.8828 });
igual("vírgula decimal", lerCoordenadas("-15,7939 -47,8828"), { lat: -15.7939, lon: -47.8828 });
igual("link curto não serve", lerCoordenadas("https://maps.app.goo.gl/abc"), null);
igual("distância e rumo", [fmtDist(distancia({ lat: -15.7939, lon: -47.8828 }, { lat: -15.78, lon: -47.87 })), fmtRumo(rumo({ lat: -15.7939, lon: -47.8828 }, { lat: -15.78, lon: -47.87 }))], ["2,1 km", "NE"]);

// ---------- preço ----------
state = seedState();
const arr = porNome(state, "Arroz");
const nota = v => ["caro", "bom preço", "na média", "acima"].find(t => avaliarPreco(arr, v).includes(t));
igual("preço base do arroz", precoBase(arr), 5);
igual("faixas do preço pago", [4.5, 5.2, 6, 7].map(nota), ["bom preço", "na média", "acima", "caro"]);
igual("preço pago passa a valer", (state.lotes.push({ id: "x", itemId: arr.id, qtd: 1, precoUn: 6.2 }), precoRef(arr)), 6.2);

// ---------- migração de dados antigos ----------
{
  const s = seedState();
  s.items = s.items.filter(i => i.nome !== "Repelente").map(({ base, ...i }) => i);
  delete s.catalogo;
  s.items.push({ id: "r1", nome: "Repelente de insetos", categoria: "Saúde e higiene", unidade: "un", escala: "casa", metas: [1, 1, 2], validade: true, avisoDias: 1095 });
  const m = migrar(s);
  const reps = m.items.filter(i => /repelente/i.test(i.nome));
  igual("item feito à mão parecido não duplica", reps.length, 1);
  igual("aviso de 1095 dias vira validade típica", [reps[0].vidaMeses, reps[0].avisoDias], [36, null]);
  igual("todos os itens do catálogo presentes", SEED_ITEMS.every(b => m.items.some(i => i.base === b.nome)), true);
}

// ---------- plano de comunicação ----------
state = seedState(); state.familia.pessoas = familia();
state.familia.plano.pessoas.c1 = { buscaPor: "a2" };
igual("criança espera quem busca", /quem vai buscar é Adulto 2/.test(passosPlano(pessoa("c1"))[0]), true);

console.log(ok + " testes passaram" + (falhas ? ", " + falhas + " falharam" : ""));
if (falhas) process.exitCode = 1;
`;

ctx.process = process;
vm.runInContext(codigo + "\n;\n" + testes, ctx, { filename: "app+testes" });
