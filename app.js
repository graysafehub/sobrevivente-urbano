// GraySafe Hub (projeto Sobrevivente Urbano) — estoque de insumos da família, 100% offline.
// Dados no localStorage do aparelho; backup manual em arquivo JSON.

const KEY = "sobrevivente-urbano-v1";
const BACKUP_DIAS = 30;  // lembrar backup depois de 30 dias

let state;

// ---------- dados ----------

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function seedState() {
  const s = {
    versao: 4,
    items: SEED_ITEMS.map(s => ({ id: uid(), base: s.nome, ...s })),
    catalogo: SEED_ITEMS.map(s => s.nome),
    lotes: [],
    movs: [],
    codigos: {},
    config: { degrau: 0, pessoas: 5, avisoDias: 60, ultimoBackup: null },
  };
  s.familia = seedFamilia(s.items);
  return s;
}

function seedFamilia(items) {
  return {
    endereco: "",
    encontro: { principal: "", secundario: "" },
    pessoas: [],
    contatos: [],
    mochila: SEED_MOCHILA.map(m => ({ id: uid(), nome: m.nome, itemId: items.find(i => i.nome === m.estoque)?.id || null, ok: false })),
  };
}

// dados de versões antigas (e de backups antigos) ganham os campos novos
function migrar(s) {
  s.config.avisoDias ??= 60;
  for (const it of s.items) {
    const base = SEED_ITEMS.find(x => x.nome === it.nome);
    if (it.spec === undefined) it.spec = base?.spec || "";
  }
  s.familia ??= seedFamilia(s.items);
  s.codigos ??= {};
  if ((s.versao || 1) < 4) migrarBasePorPessoa(s);
  s.versao = 4;
  for (const it of s.items) {
    // aviso maior que 1 ano era a validade do produto digitada no campo errado
    if (it.avisoDias > 365) { it.vidaMeses ??= Math.round(it.avisoDias / 30.4); it.avisoDias = null; }
  }
  if (s.config.avisoDias > 365) s.config.avisoDias = 60;
  sincronizarCatalogo(s);
  return s;
}

// cada item do catálogo entra uma vez; item renomeado continua ligado a ele (campo base), com o guia.
// Um item criado à mão com nome parecido ("Repelente de insetos") é ligado em vez de duplicar.
// Item do catálogo que o usuário excluiu não volta: o nome fica em s.catalogo.
function sincronizarCatalogo(s) {
  const norm = t => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  s.catalogo ??= [];
  for (const it of s.items) if (!it.base && SEED_ITEMS.some(x => x.nome === it.nome)) it.base = it.nome;
  for (const base of SEED_ITEMS) {
    if (s.catalogo.includes(base.nome)) continue;
    s.catalogo.push(base.nome);
    if (s.items.some(i => i.base === base.nome)) continue;
    const parecido = s.items.find(i => !i.base && norm(i.nome).startsWith(norm(base.nome)));
    if (parecido) { parecido.base = base.nome; continue; }
    s.items.push({ id: uid(), base: base.nome, ...base });
  }
  // item criado à mão igual a um do catálogo (mesmo começo de nome, categoria, unidade e cálculo):
  // fica o do catálogo, com o que está em casa, o histórico e os dados digitados no outro
  for (const cat of s.items.filter(i => i.base)) {
    for (const dup of s.items.filter(i => !i.base && norm(i.nome).startsWith(norm(cat.base)) && i.categoria === cat.categoria && i.unidade === cat.unidade && (i.escala || "casa") === (cat.escala || "casa"))) {
      juntarItens(s, dup.id, cat.id);
      break;
    }
  }
  for (const m of s.familia.mochila) {
    if (m.itemId && s.items.some(i => i.id === m.itemId)) continue;
    const ligado = SEED_MOCHILA.find(x => x.nome === m.nome)?.estoque;
    if (ligado) m.itemId = s.items.find(i => i.base === ligado || i.nome === ligado)?.id || null;
  }
}

// v4: itens do catálogo passam a ter base por pessoa; os criados pelo usuário viram metas por casa,
// com os números que já valiam para a família de hoje. Itens novos do catálogo entram na lista.
function migrarBasePorPessoa(s) {
  const f = s.familia.pessoas;
  const pessoas = f.length || s.config.pessoas;
  const bebes = f.length ? f.filter(p => { const n = idade(p.nascimento); return n !== null && n < 3; }).length : 1;
  for (const it of s.items) {
    const base = SEED_ITEMS.find(x => x.nome === it.nome);
    if (base) {
      it.escala = base.escala;
      it.qtd = base.qtd ?? null;
      it.metas = base.metas || [0, 0, 0];
    } else {
      const fator = it.escala === "pessoa" ? pessoas / 5 : it.escala === "bebe" ? bebes : 1;
      it.metas = it.metas.map(m => arredMeta((m || 0) * fator, it.unidade));
      it.escala = "casa";
      it.qtd = null;
    }
  }
  const agua = s.items.find(i => i.nome === "Água potável (garrafas)");
  if (agua && s.config.litrosDia && s.config.litrosDia !== 4) agua.qtd = s.config.litrosDia;
  delete s.config.litrosDia;
  sincronizarCatalogo(s);
  const nomes = s.familia.mochila.map(m => m.nome);
  for (const m of SEED_MOCHILA) {
    if (!nomes.includes(m.nome)) s.familia.mochila.push({ id: uid(), nome: m.nome, itemId: s.items.find(i => i.nome === m.estoque)?.id || null, ok: false });
  }
}

// junta o item de origem no de destino: lotes, histórico, códigos e mochila passam para o destino
function juntarItens(s, deId, paraId) {
  const de = s.items.find(i => i.id === deId), para = s.items.find(i => i.id === paraId);
  if (!de || !para || de === para) return;
  for (const l of s.lotes) if (l.itemId === deId) l.itemId = paraId;
  for (const m of s.movs) if (m.itemId === deId) m.itemId = paraId;
  for (const c of Object.values(s.codigos)) if (c.itemId === deId) c.itemId = paraId;
  for (const m of s.familia.mochila) if (m.itemId === deId) m.itemId = paraId;
  para.base ??= de.base;
  for (const k of ["precoRef", "vidaMeses", "avisoDias", "minimo"]) para[k] ??= de[k];
  if (!para.spec) para.spec = de.spec || "";
  if (!para.dica) para.dica = de.dica || "";
  s.items = s.items.filter(i => i.id !== deId);
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      state = migrar(JSON.parse(raw));
      save();
      return;
    }
  } catch (e) {}
  state = seedState();
  save();
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { toast("Não foi possível salvar. Faça um backup agora."); }
}

const item = id => state.items.find(i => i.id === id);
const pessoa = id => state.familia.pessoas.find(p => p.id === id);
const contato = id => state.familia.contatos.find(c => c.id === id);
const guiaDe = it => GUIAS[it?.base] || GUIAS[it?.nome];
const itemPorNome = n => state.items.find(i => i.base === n) || state.items.find(i => i.nome === n);

// validade sugerida na entrada: hoje + validade típica do item
function validadeSugerida(it) {
  if (!it?.validade || !(it.vidaMeses > 0)) return "";
  const d = new Date();
  d.setMonth(d.getMonth() + Math.round(it.vidaMeses));
  return d.toISOString().slice(0, 10);
}

// ---------- metas pela família ----------
// com fichas cadastradas, a família é contada por elas; sem fichas, vale o número em Sistema
function nPessoas() {
  return state.familia.pessoas.length || state.config.pessoas;
}
function nBebes() {
  const f = state.familia.pessoas;
  if (!f.length) return BASE_FAMILIA.bebes;
  return f.filter(p => { const n = idade(p.nascimento); return n !== null && n < 3; }).length;
}
// adulto = 12 anos ou mais; ficha sem nascimento conta como adulto
function nAdultos() {
  const f = state.familia.pessoas;
  if (!f.length) return Math.min(BASE_FAMILIA.adultos, state.config.pessoas);
  return f.filter(p => { const n = idade(p.nascimento); return n === null || n >= 12; }).length;
}
const ESCALAS = {
  "pessoa-dia": "por pessoa, por dia",
  "adulto-dia": "por adulto (12+), por dia",
  "bebe-dia": "por bebê (até 2 anos), por dia",
  "pessoa": "por pessoa",
  "adulto": "por adulto (12+)",
  "casa": "por casa (meta de cada degrau)",
};
const porDia = it => it.escala?.endsWith("-dia");
function multiplicador(it) {
  const tipo = (it.escala || "casa").replace("-dia", "");
  return { pessoa: nPessoas(), adulto: nAdultos(), bebe: nBebes() }[tipo] ?? 1;
}
// quanto a casa consome por dia (só itens de consumo diário)
function consumoDia(it) {
  return porDia(it) ? (it.qtd || 0) * multiplicador(it) : null;
}
// arredonda para cima: unidades inteiras (sobra de até 0,1 não arredonda), dinheiro de 10 em 10,
// peso e volume de 0,1 em 0,1
function arredMeta(v, un) {
  if (!v) return 0;
  if (["un", "pct", "rolo"].includes(un)) return Math.max(1, Math.ceil(v - 0.1));
  if (un === "R$") return Math.ceil(v / 10 - 1e-9) * 10;
  return Math.ceil(v * 10 - 1e-9) / 10;
}
function metaDe(it, d) {
  if (!it.escala || it.escala === "casa") return arredMeta(it.metas?.[d] || 0, it.unidade);
  const v = (it.qtd || 0) * multiplicador(it) * (porDia(it) ? DIAS[d] : 1);
  return arredMeta(v, it.unidade);
}
// texto da base: "0,08 kg por pessoa, por dia"
function textoBase(it) {
  if (!it.escala || it.escala === "casa") return "meta fixa por casa";
  const q = Math.round((it.qtd || 0) * 1000) / 1000;
  return `${fmtQtd(q, it.unidade)} ${ESCALAS[it.escala]}`;
}

// ---------- datas e cálculos ----------

function hoje() {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d;
}
function diasAte(iso) {
  if (!iso) return Infinity;
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round((new Date(y, m - 1, d) - hoje()) / 86400000);
}
function fmtData(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function isoHoje() {
  const d = hoje();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function idade(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const h = hoje();
  return h.getFullYear() - y - (h.getMonth() + 1 < m || (h.getMonth() + 1 === m && h.getDate() < d) ? 1 : 0);
}
function fmtIdade(iso) {
  const n = idade(iso);
  return n === null ? "" : n === 1 ? "1 ano" : `${n} anos`;
}
function horaAgora() {
  return new Date().toTimeString().slice(0, 8);
}
function fmtQtd(n, un) {
  const v = Math.round(n * 100) / 100;
  const s = v.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  return un === "R$" ? `R$ ${s}` : `${s} ${un}`;
}

function lotesDe(itemId) {
  return state.lotes
    .filter(l => l.itemId === itemId && l.qtd > 0)
    .sort((a, b) => (a.validade || "9999") < (b.validade || "9999") ? -1 : 1);
}
// quantidade que conta para a meta: só o que não venceu
function qtdValida(itemId) {
  return lotesDe(itemId).filter(l => diasAte(l.validade) >= 0).reduce((s, l) => s + l.qtd, 0);
}
function qtdTotal(itemId) {
  return lotesDe(itemId).reduce((s, l) => s + l.qtd, 0);
}
// ---------- preço ----------
// cada lote guarda o preço unitário pago; o item tem um preço de referência (o digitado em Editar
// ou, sem ele, o último pago). Dinheiro vale o próprio valor.
function precoRef(it) {
  if (!it) return null;
  if (it.unidade === "R$") return 1;
  if (it.precoRef != null) return it.precoRef;
  return state.lotes.filter(l => l.itemId === it.id && l.precoUn != null).at(-1)?.precoUn
    ?? state.movs.filter(m => m.itemId === it.id && m.precoUn != null).at(-1)?.precoUn ?? null;
}
const precoLote = (l, it) => l.precoUn ?? precoRef(it);
// valor do que está em casa; semPreco = itens com estoque e nenhum preço conhecido
function valorEstoque() {
  let total = 0;
  const semPreco = new Set();
  for (const l of state.lotes) {
    const it = item(l.itemId);
    const p = precoLote(l, it);
    if (p == null) semPreco.add(l.itemId); else total += l.qtd * p;
  }
  return { total, semPreco: semPreco.size };
}
function fmtReais(v) {
  return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// especificações diferentes que há em casa (ex.: "10.000 mAh, 20.000 mAh")
function specsDe(itemId) {
  return [...new Set(lotesDe(itemId).map(l => l.spec).filter(Boolean))];
}
// a última especificação usada, para sugerir na próxima entrada
function ultimaSpec(itemId) {
  return state.lotes.filter(l => l.itemId === itemId && l.spec).at(-1)?.spec
    || state.movs.filter(m => m.itemId === itemId && m.spec).at(-1)?.spec || "";
}

// alertas: cada item pode ter os seus; vazio = padrão
const avisoDe = it => it?.avisoDias ?? state.config.avisoDias;
const temMinimo = it => it.minimo !== null && it.minimo !== undefined;
const vencendo = (l, it) => { const d = diasAte(l.validade); return d >= 0 && d <= avisoDe(it); };

// verde | amarelo | vermelho, com o motivo
// sem mínimo próprio: abaixo da meta é vermelho
// com mínimo: abaixo do mínimo é vermelho, entre o mínimo e a meta é amarelo
function situacao(it) {
  const lotes = lotesDe(it.id);
  const meta = metaDe(it, state.config.degrau);
  const qtd = qtdValida(it.id);
  if (lotes.some(l => diasAte(l.validade) < 0)) return { cor: "vermelho", motivo: "tem lote vencido" };
  if (temMinimo(it) && qtd < it.minimo) return { cor: "vermelho", motivo: "abaixo do mínimo" };
  if (!temMinimo(it) && qtd < meta) return { cor: "vermelho", motivo: "abaixo da meta" };
  if (lotes.some(l => vencendo(l, it))) return { cor: "amarelo", motivo: "vence em breve" };
  if (qtd < meta) return { cor: "amarelo", motivo: "abaixo da meta" };
  if (meta === 0 && lotes.length === 0) return { cor: "neutro", motivo: "fora deste degrau" };
  return { cor: "verde", motivo: "ok" };
}

function progressoDegrau(d) {
  const alvo = state.items.filter(i => metaDe(i, d) > 0);
  const ok = alvo.filter(i => qtdValida(i.id) >= metaDe(i, d)).length;
  return { ok, total: alvo.length };
}

// saída: tira primeiro do lote que vence antes (rodízio)
function darSaida(itemId, qtd) {
  let resta = qtd;
  for (const l of lotesDe(itemId)) {
    if (resta <= 0) break;
    const tira = Math.min(l.qtd, resta);
    l.qtd = Math.round((l.qtd - tira) * 1000) / 1000;
    resta = Math.round((resta - tira) * 1000) / 1000;
  }
  state.lotes = state.lotes.filter(l => l.qtd > 0);
  return qtd - resta;
}

// ---------- utilidades de tela ----------

const $view = document.getElementById("view");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

let toastTimer;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2600);
}

function badgeValidade(iso, it) {
  if (!iso) return `<span class="badge neutro">sem validade</span>`;
  const d = diasAte(iso);
  if (d < 0) return `<span class="badge vermelho">venceu ${fmtData(iso)}</span>`;
  if (d <= avisoDe(it)) return `<span class="badge amarelo">vence ${fmtData(iso)} · ${d} d</span>`;
  return `<span class="badge verde">vence ${fmtData(iso)}</span>`;
}

function itemOptions(selId) {
  return CATEGORIAS.map(cat => {
    const its = state.items.filter(i => i.categoria === cat).sort((a, b) => a.nome.localeCompare(b.nome));
    if (!its.length) return "";
    return `<optgroup label="${esc(cat)}">${its.map(i =>
      `<option value="${i.id}" ${i.id === selId ? "selected" : ""}>${esc(i.nome)} (${esc(i.unidade)})</option>`).join("")}</optgroup>`;
  }).join("");
}

// ---------- telas ----------

// dias de autonomia por categoria: água pelo consumo real; o resto estimado
// pela meta de 2 semanas (a meta de 14 dias = 14 dias de consumo)
const SUPPLY = [
  { cat: "Água", nome: "Água" },
  { cat: "Comida", nome: "Ração" },
  { cat: "Luz e energia", nome: "Energia" },
  { cat: "Saúde e higiene", nome: "Saúde" },
  { cat: "Bebê", nome: "Bebê" },
];
function diasCategoria(cat) {
  const c = state.config;
  // com itens de consumo diário, a categoria é medida por eles (estoque ÷ consumo da casa por dia);
  // sem eles (energia), pela proporção da meta de 2 semanas
  const doDia = state.items.filter(i => i.categoria === cat && consumoDia(i) > 0);
  const its = doDia.length ? doDia : state.items.filter(i => i.categoria === cat && metaDe(i, 2) > 0);
  if (!its.length) return null;
  const ds = its.map(i => Math.min(porDia(i) ? qtdValida(i.id) / consumoDia(i) : qtdValida(i.id) / metaDe(i, 2) * 14, 14));
  return Math.floor(ds.reduce((s, d) => s + d, 0) / ds.length);
}

function hhmm(m) {
  const [, mm, dd] = m.data.split("-");
  return `${dd}/${mm}${m.hora ? " " + m.hora.slice(0, 5) : ""}`;
}

function viewPainel() {
  const c = state.config;
  const alvoDias = [3, 7, 14][c.degrau];

  const vencidos = state.lotes.filter(l => diasAte(l.validade) < 0);
  const aVencer = state.lotes.filter(l => vencendo(l, item(l.itemId)))
    .sort((a, b) => a.validade < b.validade ? -1 : 1);
  const acabando = state.items.filter(i => temMinimo(i) ? qtdValida(i.id) < i.minimo : qtdValida(i.id) < metaDe(i, c.degrau));

  const diasBackup = c.ultimoBackup ? -diasAte(c.ultimoBackup) : null;
  const avisoBackup = diasBackup === null ? "Nenhum backup feito."
    : diasBackup > BACKUP_DIAS ? `Último backup há ${diasBackup} dias.` : "";

  const mochila = state.familia.mochila;
  const mochilaOk = mochila.filter(m => m.ok).length;

  const log = state.movs.slice(-8).reverse();
  const sinal = { entrada: ["ENTRADA", "pos", "+"], consumo: ["CONSUMO", "neg", "−"], "doação": ["DOAÇÃO", "neg", "−"], perda: ["PERDA", "del", "−"], descarte: ["DESCARTE", "del", "−"] };

  return `
  <section class="stack">
    <div class="head">
      <h1><span class="mod">00</span> // Status</h1>
      <label class="inline">Meta
        <select id="cfgDegrau">${DEGRAUS.map((d, i) => `<option value="${i}" ${i === c.degrau ? "selected" : ""}>${d}</option>`).join("")}</select>
      </label>
    </div>

    <div class="card">
      <h2><span class="mod">01</span> · Supply grid · dias de autonomia</h2>
      <div class="supply">
        ${SUPPLY.map(s => {
          const d = diasCategoria(s.cat);
          if (d === null) return "";
          const cor = d < 3 ? "vermelho" : d < alvoDias ? "amarelo" : "verde";
          const on = Math.min(d, 14);
          return `<a class="sup ${cor}" href="#estoque" style="text-decoration:none;color:inherit">
            <span class="nm">${s.nome}</span>
            <span class="d">${String(d).padStart(2, "0")}<small>D</small></span>
            <span class="segs" aria-label="${d} dias">${Array.from({ length: 14 }, (_, k) => `<i class="${k < on ? "on" : ""}"></i>`).join("")}</span>
          </a>`;
        }).join("")}
        <div class="sup" aria-hidden="true"><span></span><span></span>
          <span class="scale"><span style="left:0">0</span><span style="left:${3 / 14 * 100}%">3</span><span style="left:50%">7</span><span style="right:0">14</span></span>
        </div>
      </div>
      <p class="sub">${nPessoas()} pessoas. Água, comida e higiene pelo consumo diário de cada item; demais itens pela meta de 2 semanas.</p>
    </div>

    <div class="grid3">
      ${DEGRAUS.map((d, i) => {
        const p = progressoDegrau(i);
        const pct = p.total ? Math.round(p.ok / p.total * 100) : 0;
        return `<div class="tile ${i === c.degrau ? "atual" : ""}">
          <span class="lbl">${d}</span>
          <b>${String(pct).padStart(2, "0")}%</b>
          <span class="sub">${p.ok}/${p.total} itens</span>
          <span class="bar"><i style="width:${pct}%"></i></span>
        </div>`;
      }).join("")}
    </div>

    ${tileValor()}

    ${avisoBackup ? `<a class="alert amarelo" href="#mais">[ BACKUP ] ${avisoBackup} Toque para fazer agora.</a>` : ""}
    ${!state.familia.pessoas.length || !state.familia.contatos.length ? `<a class="alert amarelo" href="#familia">[ FAMÍLIA ] Fichas e contatos de emergência não preenchidos. Toque para preencher.</a>` : ""}

    <div class="card">
      <h2><span class="mod">02</span> · Alertas</h2>
      <ul class="plain">
        <li><a href="#estoque/vermelho"><span class="tag ${vencidos.length ? "vermelho" : "verde"}">${vencidos.length ? "CRÍTICO" : "OK"}</span>${vencidos.length} ${vencidos.length === 1 ? "lote vencido" : "lotes vencidos"}</a></li>
        <li><a href="#estoque/vermelho"><span class="tag ${acabando.length ? "vermelho" : "verde"}">${acabando.length ? "CRÍTICO" : "OK"}</span>${acabando.length} ${acabando.length === 1 ? "item acabando" : "itens acabando"}</a></li>
        <li><a href="#estoque/amarelo"><span class="tag ${aVencer.length ? "amarelo" : "verde"}">${aVencer.length ? "ATENÇÃO" : "OK"}</span>${aVencer.length} ${aVencer.length === 1 ? "lote perto" : "lotes perto"} de vencer</a></li>
        <li><a href="#familia"><span class="tag ${mochilaOk === mochila.length ? "verde" : "amarelo"}">${mochilaOk === mochila.length ? "OK" : "ATENÇÃO"}</span>Mochila: ${mochilaOk}/${mochila.length} itens prontos</a></li>
      </ul>
    </div>

    ${aVencer.length ? `<div class="card">
      <h2>Consumir primeiro</h2>
      <ul class="rows">${aVencer.slice(0, 6).map(l => {
        const it = item(l.itemId);
        return `<li><a href="#item/${l.itemId}"><span class="grow">${esc(it?.nome)}</span><span class="right">${fmtQtd(l.qtd, it?.unidade)} ${badgeValidade(l.validade, it)}</span></a></li>`;
      }).join("")}</ul>
    </div>` : ""}

    <div class="card flush">
      <h2><span class="mod">03</span> · Guias de crise</h2>
      <ul class="rows">${CRISES.map(c => `<li><a href="#crise/${c.id}"><span class="grow nm">${esc(c.titulo)}</span><span aria-hidden="true">›</span></a></li>`).join("")}</ul>
    </div>

    <div class="card">
      <h2><span class="mod">04</span> · Registro</h2>
      ${log.length ? `<ul class="log">${log.map(m => {
        const it = item(m.itemId);
        const [rot, cls, s] = sinal[m.tipo] || [m.tipo.toUpperCase(), "neg", "−"];
        return `<li><time>[${hhmm(m)}]</time> <span class="ev"><span class="${cls}">${rot} ${s}${fmtQtd(m.qtd, it?.unidade || "")}</span> ${esc((it?.nome || "item excluído").toUpperCase())}</span></li>`;
      }).join("")}</ul>` : `<p class="empty">Nenhum registro. Use Entrada para registrar a primeira compra.</p>`}
    </div>
  </section>`;
}

function tileValor() {
  const v = valorEstoque();
  const f = faltaComprar(state.config.degrau);
  return `<div class="grid2">
    <a class="tile" href="#estoque"><span class="lbl">Valor do estoque</span><b class="sm">${fmtReais(v.total)}</b>
      <span class="sub">${v.semPreco ? `${v.semPreco} ${v.semPreco === 1 ? "item" : "itens"} sem preço` : "pelo preço pago"}</span></a>
    <a class="tile" href="#compras"><span class="lbl">Falta para ${DEGRAUS[state.config.degrau]}</span><b class="sm">${f.custo ? "≈ " + fmtReais(f.custo) : "—"}</b>
      <span class="sub">${f.semPreco ? `${f.semPreco} ${f.semPreco === 1 ? "item" : "itens"} sem preço` : f.itens.length ? "pelo último preço" : "meta completa"}</span></a>
  </div>`;
}

function viewEstoque(filtro) {
  const lista = CATEGORIAS.map(cat => {
    let its = state.items.filter(i => i.categoria === cat);
    if (filtro) its = its.filter(i => situacao(i).cor === filtro);
    if (!its.length) return "";
    return `<div class="card flush">
      <h2>${esc(cat)}</h2>
      <ul class="rows">${its.sort((a, b) => a.nome.localeCompare(b.nome)).map(i => {
        const s = situacao(i);
        const meta = metaDe(i, state.config.degrau);
        const prox = lotesDe(i.id)[0];
        const specs = specsDe(i.id);
        return `<li><a href="#item/${i.id}">
          <span class="dot ${s.cor}" title="${s.motivo}"></span>
          <span class="grow"><span class="nm">${esc(i.nome)}</span>${specs.length ? `<span class="sub">${esc(specs.join(", "))}</span>` : ""}${prox?.validade ? `<span class="sub">próx. validade ${fmtData(prox.validade)}</span>` : ""}</span>
          <span class="qty">${fmtQtd(qtdValida(i.id), i.unidade)}<span class="sub"> / ${meta ? fmtQtd(meta, i.unidade) : "—"}</span></span>
        </a></li>`;
      }).join("")}</ul>
    </div>`;
  }).join("");

  const chip = (f, txt) => `<a class="chip ${filtro === f ? "on" : ""}" href="#estoque${f ? "/" + f : ""}">${txt}</a>`;
  return `
  <section class="stack">
    <div class="head"><h1>Estoque</h1><a class="btn small" href="#novo">Novo item</a></div>
    <div class="chips">${chip("", "Todos")}${chip("vermelho", "Problema")}${chip("amarelo", "Vence logo")}${chip("verde", "Ok")}</div>
    <p class="sub">Quantidade válida / meta de ${DEGRAUS[state.config.degrau]}</p>
    ${lista || `<p class="empty">Nenhum item nesse filtro.</p>`}
  </section>`;
}

function viewItem(id) {
  const it = item(id);
  if (!it) return `<p class="empty">Item não encontrado.</p>`;
  const s = situacao(it);
  const lotes = lotesDe(id);
  const movs = state.movs.filter(m => m.itemId === id).slice(-15).reverse();
  return `
  <section class="stack">
    <a class="back" href="#estoque">‹ Estoque</a>
    <div class="head"><h1>${esc(it.nome)}</h1><span class="badge ${s.cor}">${s.motivo}</span></div>
    ${it.dica ? `<p class="sub">${esc(it.dica)}</p>` : ""}
    ${guiaHtml(it)}
    <p class="sub">Base: ${textoBase(it)}${porDia(it) ? ` · a casa consome ${fmtQtd(Math.round(consumoDia(it) * 100) / 100, it.unidade)} por dia` : ""}</p>
    <p class="sub">Alertas: ${it.validade ? `${it.vidaMeses ? `validade típica ${it.vidaMeses} ${it.vidaMeses === 1 ? "mês" : "meses"} · ` : ""}avisa ${avisoDe(it)} dias antes de vencer · ` : ""}${temMinimo(it) ? `avisa abaixo de ${fmtQtd(it.minimo, it.unidade)}` : "avisa abaixo da meta"}</p>

    <div class="grid3">
      ${DEGRAUS.map((d, i) => `<div class="tile ${i === state.config.degrau ? "atual" : ""}"><span class="lbl">Meta ${d}</span><b class="sm">${metaDe(it, i) ? fmtQtd(metaDe(it, i), it.unidade) : "—"}</b></div>`).join("")}
    </div>

    <div class="card">
      <div class="head"><h2>Em casa: ${fmtQtd(qtdTotal(id), it.unidade)}</h2>${valorItem(it)}</div>
      ${lotes.length ? `<ul class="rows">${lotes.map(l => `
        <li><div class="lote">
          <span class="grow"><b>${fmtQtd(l.qtd, it.unidade)}</b>${l.spec ? ` <span class="spec">${esc(l.spec)}</span>` : ""}${l.marca ? `<span class="sub"> · ${esc(l.marca)}</span>` : ""}${l.local ? `<span class="sub"> · ${esc(l.local)}</span>` : ""}<br>${badgeValidade(l.validade, it)}</span>
          <button class="btn small ghost" data-descartar="${l.id}">Descartar</button>
        </div></li>`).join("")}</ul>` : `<p class="empty">Nada em casa ainda.</p>`}
    </div>

    <div class="actions">
      <a class="btn" href="#entrada/${id}">Entrada</a>
      <a class="btn ghost" href="#saida/${id}" ${lotes.length ? "" : 'aria-disabled="true"'}>Saída</a>
      <a class="btn ghost" href="#editar/${id}">Editar</a>
    </div>

    ${codigosHtml(it)}

    <div class="card">
      <h2>Histórico</h2>
      ${movs.length ? `<ul class="rows">${movs.map(m => `<li><div class="lote">
        <span class="grow">${fmtData(m.data)}${m.hora ? " " + m.hora.slice(0, 5) : ""} · ${m.tipo}${m.marca ? ` · ${esc(m.marca)}` : ""}${m.spec ? ` · ${esc(m.spec)}` : ""}${m.precoUn != null && it.unidade !== "R$" ? ` · ${fmtReais(m.precoUn * m.qtd)}` : ""}${m.nota ? ` · ${esc(m.nota)}` : ""}</span>
        <span class="qty ${m.tipo === "entrada" ? "pos" : "neg"}">${m.tipo === "entrada" ? "+" : "−"}${fmtQtd(m.qtd, it.unidade)}</span>
      </div></li>`).join("")}</ul>` : `<p class="empty">Sem movimentações.</p>`}
    </div>
  </section>`;
}

// campo de especificação da entrada: o rótulo vem do item (ex.: "Capacidade (mAh) e saídas")
function specLabel(it) {
  const t = it?.spec ? it.spec[0].toUpperCase() + it.spec.slice(1) : "Especificação";
  return `${esc(t)} <span class="opt">(${it?.spec ? "recomendado" : "opcional"})</span>`;
}
function specPlaceholder(it) {
  return it?.spec ? "" : "Ex.: tamanho, capacidade, marca";
}

function valorItem(it) {
  if (it.unidade === "R$") return "";
  const lotes = lotesDe(it.id);
  const ref = precoRef(it);
  const comPreco = lotes.filter(l => precoLote(l, it) != null);
  const total = comPreco.reduce((s, l) => s + l.qtd * precoLote(l, it), 0);
  if (!lotes.length) return ref != null ? `<span class="sub">${fmtReais(ref)}/${esc(it.unidade)}</span>` : "";
  return `<span class="sub">${comPreco.length ? fmtReais(total) : "sem preço"}${ref != null ? ` · ref. ${fmtReais(ref)}/${esc(it.unidade)}` : ""}</span>`;
}

function guiaHtml(it) {
  const g = guiaDe(it);
  if (!g) return "";
  const parte = (t, txt) => txt ? `<div><span class="lbl">${t}</span><p>${esc(txt)}</p></div>` : "";
  return `<div class="card guia">
    <h2>Guia de compra</h2>
    ${parte("Como escolher", g.escolher)}${parte("Quanto comprar", g.quanto)}${parte("Como guardar", g.armazenar)}${parte("Como preparar para guardar", g.preparar)}
    ${g.fontes?.length ? `<div><span class="lbl">Fontes</span><ul class="fontes">${g.fontes.map(f => FONTES[f]).filter(Boolean).map(f =>
      `<li><a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.nome)}</a></li>`).join("")}</ul></div>`
      : `<p class="sub">Orientação prática, sem fonte oficial específica.</p>`}
  </div>`;
}

function codigosHtml(it) {
  const cods = Object.entries(state.codigos).filter(([, c]) => c.itemId === it.id);
  if (!cods.length) return "";
  return `<div class="card">
    <h2>Códigos de barras</h2>
    <ul class="rows">${cods.map(([cod, c]) => `<li><div class="lote">
      <span class="grow"><span class="nm">${esc(c.marca || "sem marca")}</span><span class="sub">${esc(cod)}${c.spec ? " · " + esc(c.spec) : ""}</span></span>
      <button class="btn small ghost" data-cod-del="${esc(cod)}" type="button">Desligar</button>
    </div></li>`).join("")}</ul>
    <p class="sub">Mesmo produto e marca, mesmo código. Desligue um código se ele foi ligado ao item errado.</p>
  </div>`;
}

function viewEntrada(id) {
  const it = id ? item(id) : null;
  return `
  <section class="stack">
    <h1>Entrada</h1>
    <form id="fEntrada" class="card form">
      <button class="btn ghost" id="bScan" type="button">▥ Ler código de barras</button>
      <input id="eCod" type="hidden">
      <p class="sub" id="eCodInfo" hidden></p>
      <label>Item<select id="eItem" required><option value="">Escolha…</option>${itemOptions(id)}</select></label>
      <a class="sub link" href="#novo">Não está na lista? Cadastrar novo item</a>
      <div class="row2">
        <label>Quantidade<input id="eQtd" type="number" inputmode="decimal" step="any" min="0.01" required></label>
        <label>Unidade<input id="eUn" value="${esc(it?.unidade || "")}" disabled></label>
      </div>
      <label id="eSpecWrap">${specLabel(it)}<input id="eSpec" value="${esc(it ? ultimaSpec(it.id) : "")}" placeholder="${esc(specPlaceholder(it))}"></label>
      <label id="eValWrap" ${it && !it.validade ? "hidden" : ""}>Validade<input id="eVal" type="date" value="${validadeSugerida(it)}"></label>
      <p class="sub" id="eValInfo" ${validadeSugerida(it) ? "" : "hidden"}>Sugerida pela validade típica do item. Confira a data na embalagem.</p>
      <label>Marca <span class="opt">(opcional)</span><input id="eMarca" placeholder="Ex.: Tio João"></label>
      <label>Preço pago, total <span class="opt">(opcional)</span><input id="ePreco" type="number" inputmode="decimal" step="0.01" min="0" placeholder="R$"></label>
      <p class="sub" id="ePrecoInfo">${it && precoRef(it) != null && it.unidade !== "R$" ? `Último preço: ${fmtReais(precoRef(it))}/${esc(it.unidade)}` : ""}</p>
      <label>Onde guardou <span class="opt">(opcional)</span><input id="eLocal" placeholder="Ex.: armário da cozinha"></label>
      <label>Observação <span class="opt">(opcional)</span><input id="eNota" placeholder="Ex.: mercado, promoção"></label>
      <button class="btn" type="submit">Registrar entrada</button>
    </form>
  </section>`;
}

function viewSaida(id) {
  const it = id ? item(id) : null;
  return `
  <section class="stack">
    <h1>Saída</h1>
    <form id="fSaida" class="card form">
      <label>Item<select id="sItem" required><option value="">Escolha…</option>${itemOptions(id)}</select></label>
      <p class="sub" id="sDisp">${it ? `Em casa: ${fmtQtd(qtdTotal(id), it.unidade)}. Sai primeiro o que vence antes.` : ""}</p>
      <div class="row2">
        <label>Quantidade<input id="sQtd" type="number" inputmode="decimal" step="any" min="0.01" required></label>
        <label>Motivo<select id="sMotivo"><option>consumo</option><option>doação</option><option>perda</option></select></label>
      </div>
      <button class="btn" type="submit">Registrar saída</button>
    </form>
  </section>`;
}

function viewEditar(id) {
  const it = id ? item(id) : { nome: "", categoria: "Comida", unidade: "un", metas: [0, 0, 0], escala: "casa", qtd: null, validade: true, dica: "" };
  if (!it) return `<p class="empty">Item não encontrado.</p>`;
  return `
  <section class="stack">
    <a class="back" href="${id ? "#item/" + id : "#estoque"}">‹ Voltar</a>
    <h1>${id ? "Editar item" : "Novo item"}</h1>
    <form id="fItem" class="card form" data-id="${id || ""}">
      <label>Nome<input id="iNome" value="${esc(it.nome)}" required></label>
      <div class="row2">
        <label>Categoria<select id="iCat">${CATEGORIAS.map(c => `<option ${c === it.categoria ? "selected" : ""}>${c}</option>`).join("")}</select></label>
        <label>Unidade<select id="iUn">${UNIDADES.map(u => `<option ${u === it.unidade ? "selected" : ""}>${u}</option>`).join("")}</select></label>
      </div>
      <fieldset><legend>Meta</legend>
        <label>Como calcular<select id="iEsc">${Object.entries(ESCALAS).map(([k, t]) => `<option value="${k}" ${k === (it.escala || "casa") ? "selected" : ""}>${t}</option>`).join("")}</select></label>
        <label id="iQtdWrap" ${(it.escala || "casa") === "casa" ? "hidden" : ""}>Quantidade<input id="iQtd" type="number" inputmode="decimal" step="any" min="0" value="${it.qtd != null ? Math.round(it.qtd * 1000) / 1000 : ""}"></label>
        <div class="row3" id="iMetasWrap" ${(it.escala || "casa") === "casa" ? "" : "hidden"}>${DEGRAUS.map((d, i) => `<label>${d}<input id="iM${i}" type="number" inputmode="decimal" step="any" min="0" value="${it.metas?.[i] || 0}"></label>`).join("")}</div>
        <p class="sub">Na unidade do item. Com fichas, conta pessoas, adultos (12 anos ou mais) e bebês (até 2 anos) da Família. Hoje: ${nPessoas()} pessoas, ${nAdultos()} adultos, ${nBebes()} ${nBebes() === 1 ? "bebê" : "bebês"}.</p>
      </fieldset>
      <label class="check"><input id="iVal" type="checkbox" ${it.validade ? "checked" : ""}> Tem data de validade</label>
      <label>Validade típica, em meses <span class="opt">(opcional)</span><input id="iVida" type="number" inputmode="numeric" min="0" step="1" placeholder="Ex.: 36 para 3 anos" value="${it.vidaMeses ?? ""}"></label>
      <p class="sub">Quanto o produto costuma durar depois de comprado. A Entrada já sugere a data de validade com isso.</p>
      <fieldset><legend>Alertas deste item</legend>
        <div class="row2">
          <label>Avisar com quantos dias de antecedência<input id="iAviso" type="number" inputmode="numeric" min="0" max="365" placeholder="padrão: ${state.config.avisoDias}" value="${it.avisoDias ?? ""}"></label>
          <label>Avisar quando ficar abaixo de<input id="iMin" type="number" inputmode="decimal" step="any" min="0" placeholder="padrão: a meta" value="${it.minimo ?? ""}"></label>
        </div>
        <p class="sub">Deixe em branco para usar o padrão. O aviso é quantos dias antes do vencimento o item fica amarelo (ex.: 60), não a validade do produto. Com um mínimo, o item fica amarelo abaixo da meta e vermelho abaixo do mínimo.</p>
      </fieldset>
      ${it.unidade === "R$" ? "" : `<label>Preço de referência por ${esc(it.unidade)} <span class="opt">(opcional)</span><input id="iPreco" type="number" inputmode="decimal" step="0.01" min="0" value="${it.precoRef ?? ""}" placeholder="${id && precoRef(it) != null ? "último pago: " + precoRef(it).toLocaleString("pt-BR") : "R$"}"></label>
      <p class="sub">Vale para o que está em casa sem preço registrado e para estimar a lista de compras. Em branco, usa o último preço pago.</p>`}
      <label>O que anotar em cada compra <span class="opt">(opcional)</span><input id="iSpec" value="${esc(it.spec || "")}" placeholder="Ex.: capacidade (mAh), tamanho, voltagem"></label>
      <label>Dica <span class="opt">(opcional)</span><input id="iDica" value="${esc(it.dica || "")}"></label>
      <button class="btn" type="submit">Salvar</button>
    </form>
    ${id ? `<div class="card form" id="juntarArea"><h2>Item repetido?</h2>
      <label>Juntar este item com<select id="jPara"><option value="">Escolha…</option>${state.items.filter(i => i.id !== id && i.unidade === it.unidade).map(i => `<option value="${i.id}">${esc(i.nome)}</option>`).join("")}</select></label>
      <p class="sub">O que está em casa, o histórico e os códigos deste item passam para o escolhido, e este some da lista.</p>
      <button class="btn ghost" id="bJuntar" type="button">Juntar</button></div>` : ""}
    ${id ? `<div id="delArea"><button class="btn ghost danger" id="delItem" type="button">Excluir item</button></div>` : ""}
  </section>`;
}

// o que falta para a meta, com o custo estimado pelo preço de referência
function faltaComprar(d) {
  const itens = state.items.map(i => ({ i, f: metaDe(i, d) - qtdValida(i.id), p: precoRef(i) })).filter(x => x.f > 0);
  return {
    itens,
    custo: itens.reduce((s, x) => s + (x.p != null ? x.f * x.p : 0), 0),
    semPreco: itens.filter(x => x.p == null).length,
  };
}

function viewCompras() {
  const d = state.config.degrau;
  const tudo = faltaComprar(d);
  const grupos = CATEGORIAS.map(cat => {
    const falta = tudo.itens.filter(x => x.i.categoria === cat);
    if (!falta.length) return "";
    return `<div class="card flush"><h2>${esc(cat)}</h2><ul class="rows">${falta.map(x =>
      `<li><div class="lote">
        <a class="grow plain" href="#item/${x.i.id}"><span class="nm">${esc(x.i.nome)}</span>${guiaDe(x.i) ? `<span class="sub">ver como escolher ›</span>` : ""}</a>
        <span class="qty">${fmtQtd(x.f, x.i.unidade)}${x.p != null && x.i.unidade !== "R$" ? `<span class="sub"><br>≈ ${fmtReais(x.f * x.p)}</span>` : ""}</span>
        <a class="btn small" href="#entrada/${x.i.id}" aria-label="Registrar compra de ${esc(x.i.nome)}">+</a>
      </div></li>`).join("")}</ul></div>`;
  }).join("");
  const proximo = d < 2 ? `<p class="sub">Quando completar, mude a meta para ${DEGRAUS[d + 1]} no Painel.</p>` : "";
  return `
  <section class="stack">
    <h1>Lista de compras</h1>
    <p class="sub">O que falta para a meta de ${DEGRAUS[d]}. Toque no item para ver como escolher e guardar; + registra a compra.</p>
    ${tudo.itens.length ? `<div class="card"><div class="head"><h2>Custo estimado</h2><b>${fmtReais(tudo.custo)}</b></div>
      <p class="sub">Pelo último preço pago ou de referência.${tudo.semPreco ? ` ${tudo.semPreco} ${tudo.semPreco === 1 ? "item ainda não tem" : "itens ainda não têm"} preço e ${tudo.semPreco === 1 ? "fica" : "ficam"} fora da conta.` : ""}</p></div>` : ""}
    ${grupos || `<div class="card"><b>Meta de ${DEGRAUS[d]} completa.</b>${proximo}</div>`}
  </section>`;
}

function viewMais() {
  const c = state.config;
  return `
  <section class="stack">
    <h1>Mais</h1>

    <div class="card form">
      <h2>Backup</h2>
      <p class="sub">${c.ultimoBackup ? `Último backup: ${fmtData(c.ultimoBackup)}.` : "Nenhum backup feito ainda."} Salve o arquivo no Google Drive ou mande para você mesmo no WhatsApp.</p>
      <button class="btn" id="bExport" type="button">Baixar backup</button>
      <label class="btn ghost file">Restaurar de um arquivo<input id="bImport" type="file" accept=".json,application/json"></label>
    </div>

    <div class="card form">
      <h2>Versão em papel</h2>
      <p class="sub">Imprima uma vez por mês e guarde na mochila. Funciona mesmo sem bateria.</p>
      <a class="btn ghost" href="#imprimir">Abrir versão para imprimir</a>
      <a class="btn ghost" href="#crise/todos">Imprimir os guias de crise</a>
    </div>

    <form class="card form" id="fCfg">
      <h2>Família e alertas</h2>
      <div class="row2">
        <label>Pessoas na casa<input id="cPessoas" type="number" min="1" value="${nPessoas()}" ${state.familia.pessoas.length ? "disabled" : ""}></label>
      </div>
      ${state.familia.pessoas.length ? `<p class="sub">Pessoas contadas pelas fichas em Família.</p>` : ""}
      <label>Aviso padrão de validade (dias antes)<input id="cAviso" type="number" min="0" value="${c.avisoDias}"></label>
      <p class="sub">Vale para os itens sem aviso próprio. Cada item pode ter o seu em Estoque › item › Editar.</p>
      <button class="btn ghost" type="submit">Salvar</button>
    </form>

    <div class="card form">
      <h2>Armazenamento</h2>
      <p class="sub" id="persistInfo">Verificando…</p>
      <div id="resetArea"><button class="btn ghost danger" id="bReset" type="button">Apagar tudo e recomeçar</button></div>
    </div>
  </section>`;
}

function impressoFamilia() {
  const f = state.familia;
  const fichas = f.pessoas.length ? `<h2>Família</h2>
    <table><thead><tr><th>Nome</th><th>Idade</th><th>Sangue</th><th>Alergias</th><th>Remédios</th><th>Saúde</th><th>Médico</th></tr></thead>
    <tbody>${f.pessoas.map(p => `<tr><td>${esc(p.nome)}</td><td>${fmtIdade(p.nascimento) || "—"}</td><td>${esc(p.sangue) || "—"}</td><td>${esc(p.alergias) || "—"}</td><td>${esc(p.remedios) || "—"}</td><td>${esc(p.condicoes) || "—"}</td><td>${esc(p.medico) || "—"}</td></tr>`).join("")}</tbody></table>` : "";
  const contatos = f.contatos.length ? `<h2>Contatos de emergência</h2>
    <p>${f.contatos.map(c => `${esc(c.nome)}${c.relacao ? ` (${esc(c.relacao)})` : ""}${c.fora ? " [fora da cidade]" : ""}: <b>${esc(c.tel)}</b>`).join(" · ")}</p>` : "";
  const locais = f.endereco || f.encontro.principal ? `<h2>Casa e pontos de encontro</h2>
    <p>${f.endereco ? `Casa: ${esc(f.endereco)}<br>` : ""}${f.encontro.principal ? `Principal: ${esc(f.encontro.principal)}<br>` : ""}${f.encontro.secundario ? `Secundário: ${esc(f.encontro.secundario)}` : ""}</p>` : "";
  const mochila = `<h2>Mochila</h2>
    <p>${f.mochila.map(m => `${m.ok ? "[x]" : "[ ]"} ${esc(m.nome)}`).join("<br>")}</p>`;
  return fichas + contatos + locais + mochila;
}

function viewImprimir() {
  const d = state.config.degrau;
  return `
  <section class="print">
    <div class="noprint actions"><a class="btn ghost" href="#mais">‹ Voltar</a><button class="btn" id="bPrint" type="button">Imprimir</button></div>
    <h1>GraySafe Hub · Inventário</h1>
    <p>Gerado em ${fmtData(isoHoje())} · meta atual: ${DEGRAUS[d]} · ${nPessoas()} pessoas</p>
    <table>
      <thead><tr><th>Item</th><th>Em casa</th><th>Meta</th><th>Lotes</th><th>Valor</th></tr></thead>
      <tbody>${CATEGORIAS.map(cat => {
        const its = state.items.filter(i => i.categoria === cat);
        if (!its.length) return "";
        return `<tr class="cat"><td colspan="5">${esc(cat)}</td></tr>` + its.map(i => `<tr>
          <td>${esc(i.nome)}</td>
          <td>${fmtQtd(qtdTotal(i.id), i.unidade)}</td>
          <td>${metaDe(i, d) ? fmtQtd(metaDe(i, d), i.unidade) : "—"}</td>
          <td>${lotesDe(i.id).filter(l => l.validade || l.spec).map(l => `${fmtQtd(l.qtd, i.unidade)}${l.spec ? ` ${esc(l.spec)}` : ""}${l.validade ? ` até ${fmtData(l.validade)}` : ""}`).join("; ") || "—"}</td>
          <td>${(() => { const ls = lotesDe(i.id).filter(l => precoLote(l, i) != null); return ls.length ? fmtReais(ls.reduce((t, l) => t + l.qtd * precoLote(l, i), 0)) : "—"; })()}</td>
        </tr>`).join("");
      }).join("")}</tbody>
    </table>
    <p>Valor do estoque: <b>${fmtReais(valorEstoque().total)}</b>${valorEstoque().semPreco ? ` (${valorEstoque().semPreco} itens sem preço)` : ""}</p>
    ${impressoFamilia()}
    <h2>Telefones</h2>
    <p>Defesa Civil 199 · SAMU 192 · Bombeiros 193 · Alerta da Defesa Civil: SMS com o CEP para 40199</p>
    <h2>Água</h2>
    <p>Hipoclorito de sódio 2,5%: siga a dose do rótulo (em geral 2 gotas por litro, esperar 30 minutos).</p>
  </section>`;
}

// ---------- família ----------

function mochilaStatus(m) {
  const it = m.itemId && item(m.itemId);
  if (!it) return "";
  return qtdValida(it.id) > 0
    ? `<span class="badge verde">em casa</span>`
    : `<span class="badge vermelho">sem estoque</span>`;
}

// remédios de uso contínuo de quem tem ficha, para lembrar na mochila
function remediosFamilia() {
  return state.familia.pessoas.filter(p => p.remedios).map(p => `${p.remedios} (${p.nome})`);
}

function viewFamilia() {
  const f = state.familia;
  const pronto = f.mochila.filter(m => m.ok).length;
  const remedios = remediosFamilia();
  const naCasa = state.config.pessoas;
  return `
  <section class="stack">
    <div class="head"><h1>Família</h1><a class="btn small ghost" href="#cartao">Cartão de bolso</a></div>
    <p class="sub">Fica só neste aparelho e sai na versão para imprimir. Sem números de documento.</p>

    <div class="card">
      <div class="head"><h2><span class="mod">01</span> · Fichas</h2><a class="btn small" href="#pessoa">Adicionar</a></div>
      ${f.pessoas.length ? `<ul class="rows">${f.pessoas.map(p => `<li><a href="#pessoa/${p.id}">
        <span class="grow"><span class="nm">${esc(p.nome)}</span><span class="sub">${[fmtIdade(p.nascimento), p.alergias && "alergia: " + p.alergias, p.remedios && "remédio: " + p.remedios].filter(Boolean).map(esc).join(" · ")}</span></span>
        ${p.sangue ? `<span class="badge">${esc(p.sangue)}</span>` : ""}
      </a></li>`).join("")}</ul>` : `<p class="empty">Nenhuma ficha. Comece por quem tem alergia ou remédio de uso contínuo.</p>`}
      <p class="sub">${f.pessoas.length
        ? `As metas do estoque são calculadas para estas ${f.pessoas.length} ${f.pessoas.length === 1 ? "pessoa" : "pessoas"}: ${nAdultos()} com 12 anos ou mais${nBebes() ? `, ${nBebes()} ${nBebes() === 1 ? "bebê" : "bebês"} até 2 anos` : ""}. Cadastre todos da casa.`
        : `Enquanto não houver fichas, as metas usam ${naCasa} pessoas (Sistema).`}</p>
    </div>

    <div class="card">
      <div class="head"><h2><span class="mod">02</span> · Contatos de emergência</h2><a class="btn small" href="#contato">Adicionar</a></div>
      ${f.contatos.length ? `<ul class="rows">${f.contatos.map(c => `<li><div class="lote">
        <a class="grow plain" href="#contato/${c.id}"><span class="nm">${esc(c.nome)}${c.fora ? ` <span class="badge amarelo">fora da cidade</span>` : ""}</span><span class="sub">${esc(c.relacao)}</span></a>
        <a class="btn small ghost" href="tel:${esc(c.tel.replace(/[^\d+]/g, ""))}">${esc(c.tel)}</a>
      </div></li>`).join("")}</ul>` : `<p class="empty">Nenhum contato. Inclua um parente de referência fora da cidade.</p>`}
      ${f.contatos.length && !f.contatos.some(c => c.fora) ? `<p class="sub">Falta um contato fora da cidade: numa crise local, as linhas daqui ficam congestionadas.</p>` : ""}
    </div>

    <form class="card form" id="fLocais">
      <h2><span class="mod">03</span> · Casa e pontos de encontro</h2>
      <label>Endereço de casa<input id="fEnd" value="${esc(f.endereco)}" placeholder="Rua, número, bairro, cidade"></label>
      <label>Ponto de encontro principal <span class="opt">(perto de casa)</span><input id="fEnc1" value="${esc(f.encontro.principal)}" placeholder="Ex.: portão da escola"></label>
      <label>Ponto de encontro secundário <span class="opt">(fora do bairro)</span><input id="fEnc2" value="${esc(f.encontro.secundario)}" placeholder="Ex.: casa da avó"></label>
      <button class="btn ghost" type="submit">Salvar</button>
    </form>

    <div class="card">
      <div class="head"><h2><span class="mod">04</span> · Mochila</h2><span class="sub">${pronto}/${f.mochila.length} prontos</span></div>
      <span class="bar"><i style="width:${f.mochila.length ? Math.round(pronto / f.mochila.length * 100) : 0}%"></i></span>
      <ul class="rows">${f.mochila.map(m => `<li><div class="lote">
        <label class="check grow"><input type="checkbox" data-mochila="${m.id}" ${m.ok ? "checked" : ""}><span>${esc(m.nome)}</span></label>
        ${mochilaStatus(m)}
        <button class="btn small ghost" data-mochila-del="${m.id}" type="button" aria-label="Remover ${esc(m.nome)}">×</button>
      </div></li>`).join("")}</ul>
      ${remedios.length ? `<p class="sub">Remédios de uso contínuo: ${esc(remedios.join("; "))}</p>` : ""}
      <form id="fMochila" class="form">
        <label>Adicionar à mochila<input id="mNome" placeholder="Ex.: carregador de parede"></label>
        <label>Ligar ao estoque <span class="opt">(opcional)</span><select id="mItem"><option value="">Sem ligação</option>${itemOptions(null)}</select></label>
        <button class="btn small ghost" type="submit">Adicionar</button>
      </form>
    </div>
  </section>`;
}

function viewPessoa(id) {
  const p = id ? pessoa(id) : { nome: "", nascimento: "", sangue: "", alergias: "", remedios: "", condicoes: "", medico: "", obs: "" };
  if (!p) return `<p class="empty">Ficha não encontrada.</p>`;
  return `
  <section class="stack">
    <a class="back" href="#familia">‹ Família</a>
    <h1>${id ? "Ficha" : "Nova ficha"}</h1>
    <form id="fPessoa" class="card form" data-id="${id || ""}">
      <label>Nome<input id="pNome" value="${esc(p.nome)}" required></label>
      <div class="row2">
        <label>Nascimento<input id="pNasc" type="date" value="${esc(p.nascimento)}"></label>
        <label>Tipo sanguíneo<select id="pSangue"><option value="">Não sei</option>${TIPOS_SANGUE.map(t => `<option ${t === p.sangue ? "selected" : ""}>${t}</option>`).join("")}</select></label>
      </div>
      <label>Alergias <span class="opt">(remédio, alimento, picada)</span><input id="pAlerg" value="${esc(p.alergias)}" placeholder="Nenhuma conhecida"></label>
      <label>Remédios de uso contínuo <span class="opt">(nome, dose, horário)</span><input id="pRem" value="${esc(p.remedios)}"></label>
      <label>Condições de saúde <span class="opt">(asma, diabetes, epilepsia…)</span><input id="pCond" value="${esc(p.condicoes)}"></label>
      <label>Médico ou pediatra <span class="opt">(nome e telefone)</span><input id="pMed" value="${esc(p.medico)}"></label>
      <label>Observações <span class="opt">(opcional)</span><input id="pObs" value="${esc(p.obs)}"></label>
      <button class="btn" type="submit">Salvar</button>
    </form>
    ${id ? `<div id="delArea"><button class="btn ghost danger" id="delReg" type="button">Excluir ficha</button></div>` : ""}
  </section>`;
}

function viewContato(id) {
  const c = id ? contato(id) : { nome: "", relacao: "", tel: "", fora: false };
  if (!c) return `<p class="empty">Contato não encontrado.</p>`;
  return `
  <section class="stack">
    <a class="back" href="#familia">‹ Família</a>
    <h1>${id ? "Contato" : "Novo contato"}</h1>
    <form id="fContato" class="card form" data-id="${id || ""}">
      <label>Nome<input id="kNome" value="${esc(c.nome)}" required></label>
      <div class="row2">
        <label>Relação<input id="kRel" value="${esc(c.relacao)}" placeholder="Ex.: avó, vizinho"></label>
        <label>Telefone<input id="kTel" type="tel" inputmode="tel" value="${esc(c.tel)}" required></label>
      </div>
      <label class="check"><input id="kFora" type="checkbox" ${c.fora ? "checked" : ""}> Mora fora da cidade (parente de referência)</label>
      <button class="btn" type="submit">Salvar</button>
    </form>
    ${id ? `<div id="delArea"><button class="btn ghost danger" id="delReg" type="button">Excluir contato</button></div>` : ""}
  </section>`;
}

// cartão para a criança levar: impresso, recortado, duas cópias
function viewCartao(id) {
  const f = state.familia;
  const p = pessoa(id) || f.pessoas.find(x => idade(x.nascimento) !== null && idade(x.nascimento) < 18) || f.pessoas[0];
  const falta = [!f.contatos.length && "contatos", !f.endereco && "endereço", !f.encontro.principal && "ponto de encontro"].filter(Boolean);
  const linha = "______________________";
  const cartao = `<div class="cartao">
    <b class="ct-t">${p ? esc(p.nome) : linha}</b>
    ${p && (p.sangue || p.alergias) ? `<span>${[p.sangue && "Sangue " + p.sangue, p.alergias && "Alergia: " + p.alergias].filter(Boolean).map(esc).join(" · ")}</span>` : ""}
    <span class="ct-h">Se eu me perder, ligue:</span>
    ${f.contatos.slice(0, 4).map(c => `<span>${esc(c.nome)}${c.relacao ? ` (${esc(c.relacao)})` : ""}: <b>${esc(c.tel)}</b></span>`).join("") || `<span>${linha}</span>`}
    <span class="ct-h">Moro em:</span><span>${esc(f.endereco) || linha}</span>
    <span class="ct-h">Ponto de encontro:</span><span>${esc(f.encontro.principal) || linha}${f.encontro.secundario ? ` · se não der: ${esc(f.encontro.secundario)}` : ""}</span>
    <span class="ct-f">Polícia 190 · SAMU 192 · Bombeiros 193</span>
  </div>`;
  return `
  <section class="print">
    <div class="noprint stack">
      <div class="actions"><a class="btn ghost" href="#familia">‹ Voltar</a><button class="btn" id="bPrint" type="button">Imprimir</button></div>
      ${f.pessoas.length ? `<label class="inline">Cartão de<select id="cartaoDe">${f.pessoas.map(x => `<option value="${x.id}" ${x === p ? "selected" : ""}>${esc(x.nome)}</option>`).join("")}</select></label>` : `<p class="sub">Cadastre a ficha da criança em Família para o nome sair no cartão.</p>`}
      ${falta.length ? `<p class="alert amarelo">Falta preencher em Família: ${falta.join(", ")}.</p>` : ""}
      <p class="sub">Saem duas cópias: uma na mochila da escola, outra no bolso. Recorte e cubra com fita larga.</p>
    </div>
    <div class="cartoes">${cartao}${cartao}</div>
  </section>`;
}

// ---------- guias de crise ----------

function criseHtml(c) {
  const its = c.estoque.map(itemPorNome).filter(Boolean);
  const kids = c.criancas ? state.familia.pessoas.filter(p => { const n = idade(p.nascimento); return n !== null && n < 12; }) : [];
  return `<article class="crise stack">
    <h1>${esc(c.titulo)}</h1>
    <p class="sub">${esc(c.resumo)}</p>
    ${its.length ? `<div class="card flush"><h2>No seu estoque</h2><ul class="rows">${its.map(i => {
      const s = situacao(i);
      return `<li><a href="#item/${i.id}"><span class="dot ${s.cor}"></span><span class="grow nm">${esc(i.nome)}</span>
        <span class="qty">${fmtQtd(qtdValida(i.id), i.unidade)}<span class="sub"> / ${fmtQtd(metaDe(i, state.config.degrau), i.unidade)}</span></span></a></li>`;
    }).join("")}</ul></div>` : ""}
    ${kids.length ? `<div class="card"><h2>Crianças da casa</h2><ul class="plain">${kids.map(p => `<li><b>${esc(p.nome)}</b> · ${fmtIdade(p.nascimento)}${p.alergias ? ` · <span class="spec">alergia: ${esc(p.alergias)}</span>` : ""}${p.remedios ? ` · remédio: ${esc(p.remedios)}` : ""}${p.medico ? ` · ${esc(p.medico)}` : ""}</li>`).join("")}</ul>
      <p class="sub">Dose do antitérmico: a que o pediatra indicou pelo peso, anotada na caixa.</p></div>` : ""}
    ${c.secoes.map(s => `<section class="card ${s.alerta ? "alerta" : ""}">
      <h2>${esc(s.titulo)}</h2>
      <ul class="passos">${s.passos.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
    </section>`).join("")}
    <div class="card"><h2>Fontes</h2><ul class="fontes">${c.fontes.map(f => FONTES[f]).filter(Boolean).map(f =>
      `<li><a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.nome)}</a></li>`).join("")}</ul></div>
  </article>`;
}

function viewCrises() {
  return `
  <section class="stack">
    <h1>Guias de crise</h1>
    <p class="sub">Consulta rápida, funciona sem internet. Emergência: SAMU 192 · Bombeiros 193 · Defesa Civil 199 · Polícia 190.</p>
    <div class="card flush"><ul class="rows">${CRISES.map(c => `<li><a href="#crise/${c.id}">
      <span class="grow"><span class="nm">${esc(c.titulo)}</span><span class="sub">${esc(c.resumo)}</span></span><span aria-hidden="true">›</span>
    </a></li>`).join("")}</ul></div>
    <a class="btn ghost" href="#crise/todos">Imprimir todos os guias</a>
  </section>`;
}

function viewCrise(id) {
  const lista = id === "todos" ? CRISES : CRISES.filter(c => c.id === id);
  if (!lista.length) return `<p class="empty">Guia não encontrado.</p>`;
  return `
  <section class="stack">
    <div class="noprint actions"><a class="btn ghost" href="#crises">‹ Guias</a><button class="btn" id="bPrint" type="button">Imprimir</button></div>
    ${lista.map(criseHtml).join(`<hr class="quebra">`)}
  </section>`;
}

// ---------- roteador ----------

function render() {
  fecharLeitor();
  const [rota, arg] = (location.hash.slice(1) || "painel").split("/");
  const telas = {
    painel: () => viewPainel(),
    estoque: () => viewEstoque(arg),
    item: () => viewItem(arg),
    entrada: () => viewEntrada(arg),
    saida: () => viewSaida(arg),
    editar: () => viewEditar(arg),
    novo: () => viewEditar(null),
    compras: () => viewCompras(),
    mais: () => viewMais(),
    imprimir: () => viewImprimir(),
    crises: () => viewCrises(),
    crise: () => viewCrise(arg),
    familia: () => viewFamilia(),
    pessoa: () => viewPessoa(arg),
    contato: () => viewContato(arg),
    cartao: () => viewCartao(arg),
  };
  $view.innerHTML = (telas[rota] || telas.painel)();
  document.body.classList.toggle("printing", ["imprimir", "cartao", "crise"].includes(rota));
  const ativa = { item: "estoque", editar: "estoque", novo: "estoque", saida: "estoque", imprimir: "mais", crises: "painel", crise: "painel", pessoa: "familia", contato: "familia", cartao: "familia" }[rota] || rota;
  document.querySelectorAll(".tabbar a").forEach(a => a.classList.toggle("on", a.dataset.route === ativa));
  window.scrollTo(0, 0);
  if (rota === "mais") mostrarPersistencia();
}

async function mostrarPersistencia() {
  const el = document.getElementById("persistInfo");
  if (!el) return;
  let txt = "Os dados ficam só neste aparelho.";
  try {
    if (navigator.storage?.persist) {
      const ok = await navigator.storage.persisted() || await navigator.storage.persist();
      txt += ok ? " O navegador garantiu que não vai apagá-los." : " Instale o app na tela inicial para o navegador não apagar os dados.";
    }
  } catch (e) {}
  el.textContent = txt;
}

// ---------- ações ----------

const num = id => parseFloat(String(document.getElementById(id).value).replace(",", "."));
const campoOpcional = id => { const v = num(id); return Number.isFinite(v) && v >= 0 ? v : null; };

document.addEventListener("change", e => {
  const t = e.target;
  if (t.id === "cfgDegrau") { state.config.degrau = +t.value; save(); render(); }
  if (t.id === "eItem") {
    const it = item(t.value);
    // trocar o item à mão desfaz a leitura do código
    if (e.isTrusted) { document.getElementById("eCod").value = ""; document.getElementById("eCodInfo").hidden = true; }
    document.getElementById("eUn").value = it?.unidade || "";
    document.getElementById("eValWrap").hidden = it ? !it.validade : false;
    document.getElementById("eVal").value = validadeSugerida(it);
    document.getElementById("eValInfo").hidden = !validadeSugerida(it);
    const pi = document.getElementById("ePrecoInfo");
    pi.textContent = it && precoRef(it) != null && it.unidade !== "R$" ? `Último preço: ${fmtReais(precoRef(it))}/${it.unidade}` : "";
    const w = document.getElementById("eSpecWrap");
    w.innerHTML = `${specLabel(it)}<input id="eSpec" placeholder="${esc(specPlaceholder(it))}">`;
    w.querySelector("input").value = it ? ultimaSpec(it.id) : "";
  }
  if (t.id === "sItem") {
    const it = item(t.value);
    document.getElementById("sDisp").textContent = it ? `Em casa: ${fmtQtd(qtdTotal(it.id), it.unidade)}. Sai primeiro o que vence antes.` : "";
  }
  if (t.id === "bImport" && t.files[0]) importar(t.files[0]);
  if (t.id === "cartaoDe") location.hash = "#cartao/" + t.value;
  if (t.id === "iEsc") {
    document.getElementById("iQtdWrap").hidden = t.value === "casa";
    document.getElementById("iMetasWrap").hidden = t.value !== "casa";
  }
  if (t.dataset.mochila) {
    const m = state.familia.mochila.find(x => x.id === t.dataset.mochila);
    if (m) { m.ok = t.checked; save(); render(); }
  }
});

document.addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target;

  if (f.id === "fEntrada") {
    const it = item(document.getElementById("eItem").value);
    const qtd = num("eQtd");
    if (!it || !(qtd > 0)) return toast("Escolha o item e a quantidade.");
    const validade = it.validade ? document.getElementById("eVal").value || null : null;
    if (it.validade && !validade) return toast("Informe a validade.");
    const spec = document.getElementById("eSpec").value.trim();
    const marca = document.getElementById("eMarca").value.trim();
    const cod = document.getElementById("eCod").value;
    if (cod && state.codigos[cod]) Object.assign(state.codigos[cod], { marca: marca || state.codigos[cod].marca, spec: spec || state.codigos[cod].spec });
    const pago = num("ePreco");
    const precoUn = it.unidade === "R$" ? 1 : pago > 0 ? Math.round(pago / qtd * 10000) / 10000 : null;
    state.lotes.push({ id: uid(), itemId: it.id, qtd, validade, spec, marca, codigo: cod || null, precoUn, local: document.getElementById("eLocal").value.trim(), criado: isoHoje() });
    state.movs.push({ id: uid(), itemId: it.id, tipo: "entrada", qtd, spec, marca, precoUn, data: isoHoje(), hora: horaAgora(), nota: document.getElementById("eNota").value.trim() });
    save(); toast(`Entrada registrada: ${fmtQtd(qtd, it.unidade)} de ${it.nome}`);
    location.hash = "#item/" + it.id;
  }

  if (f.id === "fSaida") {
    const it = item(document.getElementById("sItem").value);
    const qtd = num("sQtd");
    if (!it || !(qtd > 0)) return toast("Escolha o item e a quantidade.");
    const disp = qtdTotal(it.id);
    if (qtd > disp) return toast(`Só há ${fmtQtd(disp, it.unidade)} em casa.`);
    const saiu = darSaida(it.id, qtd);
    state.movs.push({ id: uid(), itemId: it.id, tipo: document.getElementById("sMotivo").value, qtd: saiu, data: isoHoje(), hora: horaAgora() });
    save(); toast(`Saída registrada: ${fmtQtd(saiu, it.unidade)}`);
    location.hash = "#item/" + it.id;
  }

  if (f.id === "fItem") {
    const escala = document.getElementById("iEsc").value;
    const dados = {
      nome: document.getElementById("iNome").value.trim(),
      categoria: document.getElementById("iCat").value,
      unidade: document.getElementById("iUn").value,
      metas: [0, 1, 2].map(i => num("iM" + i) || 0),
      escala,
      qtd: escala === "casa" ? null : num("iQtd") || 0,
      validade: document.getElementById("iVal").checked,
      spec: document.getElementById("iSpec").value.trim(),
      dica: document.getElementById("iDica").value.trim(),
      avisoDias: campoOpcional("iAviso"),
      vidaMeses: campoOpcional("iVida"),
      minimo: campoOpcional("iMin"),
      precoRef: document.getElementById("iPreco") ? campoOpcional("iPreco") : null,
    };
    if (!dados.nome) return toast("Dê um nome ao item.");
    if (dados.avisoDias > 365) return toast("O aviso vai até 365 dias. A validade do produto vai em Validade típica.");
    let id = f.dataset.id;
    if (id) Object.assign(item(id), dados);
    else { id = uid(); state.items.push({ id, ...dados }); }
    save(); toast("Item salvo");
    location.hash = "#item/" + id;
  }

  if (f.id === "fPessoa") {
    const v = id => document.getElementById(id).value.trim();
    const dados = { nome: v("pNome"), nascimento: v("pNasc"), sangue: v("pSangue"), alergias: v("pAlerg"), remedios: v("pRem"), condicoes: v("pCond"), medico: v("pMed"), obs: v("pObs") };
    if (!dados.nome) return toast("Informe o nome.");
    if (f.dataset.id) Object.assign(pessoa(f.dataset.id), dados);
    else state.familia.pessoas.push({ id: uid(), ...dados });
    save(); toast("Ficha salva"); location.hash = "#familia";
  }

  if (f.id === "fContato") {
    const v = id => document.getElementById(id).value.trim();
    const dados = { nome: v("kNome"), relacao: v("kRel"), tel: v("kTel"), fora: document.getElementById("kFora").checked };
    if (!dados.nome || !dados.tel) return toast("Informe nome e telefone.");
    if (f.dataset.id) Object.assign(contato(f.dataset.id), dados);
    else state.familia.contatos.push({ id: uid(), ...dados });
    save(); toast("Contato salvo"); location.hash = "#familia";
  }

  if (f.id === "fLocais") {
    const v = id => document.getElementById(id).value.trim();
    state.familia.endereco = v("fEnd");
    state.familia.encontro = { principal: v("fEnc1"), secundario: v("fEnc2") };
    save(); toast("Pontos de encontro salvos");
  }

  if (f.id === "fMochila") {
    const nome = document.getElementById("mNome").value.trim();
    if (!nome) return toast("Escreva o que vai na mochila.");
    state.familia.mochila.push({ id: uid(), nome, itemId: document.getElementById("mItem").value || null, ok: false });
    save(); render();
  }

  if (f.id === "fCodigo") {
    const cod = document.getElementById("scanManual").value.replace(/\D/g, "");
    if (cod.length < 6) return toast("Digite os números do código de barras.");
    codigoLido(cod);
  }

  if (f.id === "fCfg") {
    if (!state.familia.pessoas.length) state.config.pessoas = Math.max(1, Math.round(num("cPessoas")) || 5);
    const aviso = campoOpcional("cAviso") ?? 60;
    if (aviso > 365) return toast("O aviso vai até 365 dias antes do vencimento.");
    state.config.avisoDias = aviso;
    save(); toast("Configuração salva");
  }
});

document.addEventListener("click", e => {
  const t = e.target.closest("button, a");
  if (!t) return;

  if (t.getAttribute("aria-disabled") === "true") { e.preventDefault(); return; }

  if (t.dataset.descartar) {
    const l = state.lotes.find(x => x.id === t.dataset.descartar);
    if (!l) return;
    if (t.dataset.confirm !== "1") { t.dataset.confirm = "1"; t.textContent = "Confirmar descarte"; t.classList.add("danger"); return; }
    state.movs.push({ id: uid(), itemId: l.itemId, tipo: "descarte", qtd: l.qtd, data: isoHoje(), hora: horaAgora(), nota: l.validade ? `validade ${fmtData(l.validade)}` : "" });
    state.lotes = state.lotes.filter(x => x.id !== l.id);
    save(); toast("Lote descartado"); render();
  }

  if (t.id === "delItem") {
    document.getElementById("delArea").innerHTML = `<div class="confirm"><span>Excluir o item e todo o histórico dele?</span>
      <button class="btn small danger" id="delYes" type="button">Excluir</button><button class="btn small ghost" id="delNo" type="button">Cancelar</button></div>`;
  }
  if (t.id === "delReg") {
    document.getElementById("delArea").innerHTML = `<div class="confirm"><span>Excluir de vez?</span>
      <button class="btn small danger" id="delYes" type="button">Excluir</button><button class="btn small ghost" id="delNo" type="button">Cancelar</button></div>`;
  }
  if (t.dataset.mochilaDel) {
    state.familia.mochila = state.familia.mochila.filter(m => m.id !== t.dataset.mochilaDel);
    save(); render();
  }
  if (t.id === "bJuntar") {
    const para = item(document.getElementById("jPara").value);
    if (!para) return toast("Escolha com qual item juntar.");
    document.getElementById("juntarArea").insertAdjacentHTML("beforeend", `<div class="confirm"><span>Juntar em ${esc(para.nome)}?</span>
      <button class="btn small" id="juntarSim" type="button" data-para="${para.id}">Juntar</button><button class="btn small ghost" id="delNo" type="button">Cancelar</button></div>`);
  }
  if (t.id === "juntarSim") {
    juntarItens(state, location.hash.slice(1).split("/")[1], t.dataset.para);
    save(); toast("Itens juntados"); location.hash = "#item/" + t.dataset.para;
  }
  if (t.id === "delNo") render();
  const [rotaDel, idDel] = location.hash.slice(1).split("/");
  if (t.id === "delYes" && rotaDel === "pessoa") {
    state.familia.pessoas = state.familia.pessoas.filter(p => p.id !== idDel);
    save(); toast("Ficha excluída"); location.hash = "#familia";
  } else if (t.id === "delYes" && rotaDel === "contato") {
    state.familia.contatos = state.familia.contatos.filter(c => c.id !== idDel);
    save(); toast("Contato excluído"); location.hash = "#familia";
  } else if (t.id === "delYes") {
    const id = idDel;
    state.items = state.items.filter(i => i.id !== id);
    state.lotes = state.lotes.filter(l => l.itemId !== id);
    state.movs = state.movs.filter(m => m.itemId !== id);
    state.familia.mochila.forEach(m => { if (m.itemId === id) m.itemId = null; });
    for (const [cod, c] of Object.entries(state.codigos)) if (c.itemId === id) delete state.codigos[cod];
    save(); toast("Item excluído"); location.hash = "#estoque";
  }

  if (t.id === "bReset") {
    document.getElementById("resetArea").innerHTML = `<div class="confirm"><span>Apagar todo o estoque e voltar ao catálogo inicial? Faça um backup antes.</span>
      <button class="btn small danger" id="resetYes" type="button">Apagar tudo</button><button class="btn small ghost" id="resetNo" type="button">Cancelar</button></div>`;
  }
  if (t.id === "resetNo") render();
  if (t.id === "resetYes") { state = seedState(); save(); toast("Tudo apagado"); location.hash = "#painel"; render(); }

  if (t.id === "bExport") exportar();
  if (t.id === "bScan") abrirLeitor();
  if (t.id === "scanFechar") fecharLeitor();
  if (t.dataset.vincular) vincularCodigo(t.dataset.vincular);
  if (t.dataset.codDel) {
    delete state.codigos[t.dataset.codDel];
    save(); toast("Código desligado do item"); render();
  }
  if (t.id === "bPrint") window.print();
});

// ---------- código de barras ----------
// usa o leitor nativo do Chrome (BarcodeDetector), que funciona sem internet.
// código conhecido preenche a entrada; código novo pede para dizer de qual item é.

let leitor = null;  // { stream, timer }

async function abrirLeitor() {
  fecharLeitor();
  const ov = document.createElement("div");
  ov.className = "scanner";
  ov.innerHTML = `
    <h1>Código de barras</h1>
    <div class="scan-box"><video id="scanVideo" playsinline muted></video><span class="scan-mira"></span></div>
    <p class="sub" id="scanMsg">Abrindo a câmera…</p>
    <form id="fCodigo" class="row-cod"><input id="scanManual" inputmode="numeric" placeholder="ou digite os números" aria-label="Código de barras"><button class="btn small" type="submit">OK</button></form>
    <button class="btn ghost" id="scanFechar" type="button">Cancelar</button>`;
  document.body.appendChild(ov);
  const msg = t => { const el = document.getElementById("scanMsg"); if (el) el.textContent = t; };
  if (!("BarcodeDetector" in window) || !navigator.mediaDevices?.getUserMedia) {
    document.querySelector(".scan-box").hidden = true;
    return msg("Este navegador não lê códigos pela câmera. Digite os números que ficam embaixo das barras.");
  }
  try {
    const formatos = (await BarcodeDetector.getSupportedFormats()).filter(f => ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"].includes(f));
    const det = new BarcodeDetector({ formats: formatos });
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    leitor = { stream, timer: null };
    const v = document.getElementById("scanVideo");
    if (!v) return fecharLeitor();
    v.srcObject = stream;
    await v.play();
    msg("Aponte para as barras e segure firme.");
    const ler = async () => {
      if (!leitor) return;
      try {
        const r = await det.detect(v);
        if (r.length) return codigoLido(r[0].rawValue);
      } catch (e) {}
      leitor.timer = setTimeout(ler, 200);
    };
    ler();
  } catch (e) {
    document.querySelector(".scan-box").hidden = true;
    msg("Sem acesso à câmera. Permita a câmera para o app ou digite os números do código.");
  }
}

function fecharLeitor() {
  if (leitor) {
    clearTimeout(leitor.timer);
    leitor.stream.getTracks().forEach(t => t.stop());
    leitor = null;
  }
  document.querySelectorAll(".scanner").forEach(el => el.remove());
}

function codigoLido(cod) {
  fecharLeitor();
  if (state.codigos[cod] && item(state.codigos[cod].itemId)) return aplicarCodigo(cod);
  // código novo: escolher o item
  const ov = document.createElement("div");
  ov.className = "scanner";
  ov.dataset.cod = cod;
  ov.innerHTML = `
    <div class="head"><h1>Código novo</h1><button class="btn small ghost" id="scanFechar" type="button">Cancelar</button></div>
    <p class="sub">${esc(cod)}. De qual item é? Fica gravado: na próxima vez o app já sabe.</p>
    <label class="form-lbl">Marca <span class="opt">(opcional)</span><input id="vMarca" placeholder="Ex.: Tio João"></label>
    <input id="vBusca" type="search" placeholder="Buscar item" aria-label="Buscar item">
    <ul class="rows vlist">${CATEGORIAS.map(cat => state.items.filter(i => i.categoria === cat).sort((a, b) => a.nome.localeCompare(b.nome)).map(i =>
      `<li data-busca="${esc((i.nome + " " + cat).toLowerCase())}"><button class="vrow" data-vincular="${i.id}" type="button"><span class="nm">${esc(i.nome)}</span><span class="sub">${esc(cat)}</span></button></li>`).join("")).join("")}</ul>
    <a class="sub link" href="#novo">Não está na lista? Cadastrar novo item</a>`;
  document.body.appendChild(ov);
  document.getElementById("vMarca").focus();
}

function vincularCodigo(itemId) {
  const ov = document.querySelector(".scanner[data-cod]");
  if (!ov) return;
  const cod = ov.dataset.cod;
  state.codigos[cod] = { itemId, marca: document.getElementById("vMarca").value.trim(), spec: "" };
  save();
  fecharLeitor();
  aplicarCodigo(cod);
}

function aplicarCodigo(cod) {
  const c = state.codigos[cod];
  const it = item(c.itemId);
  const sel = document.getElementById("eItem");
  if (!sel) { location.hash = "#entrada/" + it.id; return; }
  sel.value = it.id;
  sel.dispatchEvent(new Event("change", { bubbles: true }));
  document.getElementById("eCod").value = cod;
  if (c.spec) document.getElementById("eSpec").value = c.spec;
  document.getElementById("eMarca").value = c.marca || "";
  const info = document.getElementById("eCodInfo");
  info.textContent = `Código ${cod} · ${it.nome}${c.marca ? " · " + c.marca : ""}`;
  info.hidden = false;
  toast(`Reconhecido: ${it.nome}`);
  document.getElementById("eQtd").focus();
}

document.addEventListener("input", e => {
  if (e.target.id !== "vBusca") return;
  const q = e.target.value.trim().toLowerCase();
  document.querySelectorAll(".vlist li").forEach(li => (li.hidden = q && !li.dataset.busca.includes(q)));
});

function exportar() {
  state.config.ultimoBackup = isoHoje();
  save();
  const blob = new Blob([JSON.stringify(state, null, 1)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `graysafe-backup-${isoHoje()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast("Backup baixado");
  render();
}

function importar(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const s = JSON.parse(r.result);
      if (!Array.isArray(s.items) || !Array.isArray(s.lotes) || !s.config) throw 0;
      state = migrar(s); save(); toast("Backup restaurado"); location.hash = "#painel"; render();
    } catch (e) { toast("Esse arquivo não é um backup do GraySafe Hub."); }
  };
  r.readAsText(file);
}

function atualizarRede() {
  document.getElementById("netStatus").hidden = navigator.onLine;
}

function relogio() {
  document.getElementById("clock").textContent = horaAgora();
}
setInterval(relogio, 1000);
relogio();

load();
window.addEventListener("hashchange", render);
window.addEventListener("online", atualizarRede);
window.addEventListener("offline", atualizarRede);
atualizarRede();
render();
