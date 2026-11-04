// Sobrevivente Urbano — estoque de insumos da família, 100% offline.
// Dados no localStorage do aparelho; backup manual em arquivo JSON.

const KEY = "sobrevivente-urbano-v1";
const BACKUP_DIAS = 30;  // lembrar backup depois de 30 dias

let state;

// ---------- dados ----------

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function seedState() {
  return {
    versao: 1,
    items: SEED_ITEMS.map(s => ({ id: uid(), ...s })),
    lotes: [],
    movs: [],
    config: { degrau: 0, pessoas: 5, litrosDia: 4, avisoDias: 60, ultimoBackup: null },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      state = JSON.parse(raw);
      state.config.avisoDias ??= 60;
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

// alertas: cada item pode ter os seus; vazio = padrão
const avisoDe = it => it?.avisoDias ?? state.config.avisoDias;
const temMinimo = it => it.minimo !== null && it.minimo !== undefined;
const vencendo = (l, it) => { const d = diasAte(l.validade); return d >= 0 && d <= avisoDe(it); };

// verde | amarelo | vermelho, com o motivo
// sem mínimo próprio: abaixo da meta é vermelho
// com mínimo: abaixo do mínimo é vermelho, entre o mínimo e a meta é amarelo
function situacao(it) {
  const lotes = lotesDe(it.id);
  const meta = it.metas[state.config.degrau] || 0;
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
  const alvo = state.items.filter(i => (i.metas[d] || 0) > 0);
  const ok = alvo.filter(i => qtdValida(i.id) >= i.metas[d]).length;
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

function viewPainel() {
  const c = state.config;
  const agua = state.items.find(i => i.nome.startsWith("Água potável"));
  const litros = agua ? qtdValida(agua.id) : 0;
  const diasAgua = Math.floor(litros / (c.pessoas * c.litrosDia));

  const vencidos = state.lotes.filter(l => diasAte(l.validade) < 0);
  const aVencer = state.lotes.filter(l => vencendo(l, item(l.itemId)))
    .sort((a, b) => a.validade < b.validade ? -1 : 1);
  const acabando = state.items.filter(i => temMinimo(i) ? qtdValida(i.id) < i.minimo : qtdValida(i.id) < (i.metas[c.degrau] || 0));

  const diasBackup = c.ultimoBackup ? -diasAte(c.ultimoBackup) : null;
  const avisoBackup = diasBackup === null ? "Você ainda não fez nenhum backup."
    : diasBackup > BACKUP_DIAS ? `Último backup há ${diasBackup} dias.` : "";

  return `
  <section class="stack">
    <div class="head">
      <h1>Painel</h1>
      <label class="inline">Meta atual
        <select id="cfgDegrau">${DEGRAUS.map((d, i) => `<option value="${i}" ${i === c.degrau ? "selected" : ""}>${d}</option>`).join("")}</select>
      </label>
    </div>

    <div class="grid3">
      ${DEGRAUS.map((d, i) => {
        const p = progressoDegrau(i);
        const pct = p.total ? Math.round(p.ok / p.total * 100) : 0;
        return `<div class="tile ${i === c.degrau ? "atual" : ""}">
          <span class="lbl">${d}</span>
          <b>${pct}%</b>
          <span class="sub">${p.ok} de ${p.total} itens</span>
          <span class="bar"><i style="width:${pct}%"></i></span>
        </div>`;
      }).join("")}
    </div>

    <div class="card agua">
      <div><span class="lbl">Água para ${c.pessoas} pessoas</span><b>${diasAgua} ${diasAgua === 1 ? "dia" : "dias"}</b></div>
      <span class="sub">${fmtQtd(litros, "L")} válidos · ${c.pessoas * c.litrosDia} L por dia</span>
    </div>

    ${avisoBackup ? `<a class="alert amarelo" href="#mais">${avisoBackup} Toque para fazer agora.</a>` : ""}

    <div class="card">
      <h2>Atenção</h2>
      <ul class="plain">
        <li><a href="#estoque/vermelho">${vencidos.length} ${vencidos.length === 1 ? "lote vencido" : "lotes vencidos"}</a></li>
        <li><a href="#estoque/vermelho">${acabando.length} ${acabando.length === 1 ? "item acabando" : "itens acabando"} (abaixo do mínimo ou da meta)</a></li>
        <li><a href="#estoque/amarelo">${aVencer.length} ${aVencer.length === 1 ? "lote perto" : "lotes perto"} de vencer</a></li>
      </ul>
    </div>

    ${aVencer.length ? `<div class="card">
      <h2>Consumir primeiro</h2>
      <ul class="rows">${aVencer.slice(0, 6).map(l => {
        const it = item(l.itemId);
        return `<li><a href="#item/${l.itemId}"><span>${esc(it?.nome)}</span><span class="right">${fmtQtd(l.qtd, it?.unidade)} ${badgeValidade(l.validade, it)}</span></a></li>`;
      }).join("")}</ul>
    </div>` : ""}
  </section>`;
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
        const meta = i.metas[state.config.degrau] || 0;
        const prox = lotesDe(i.id)[0];
        return `<li><a href="#item/${i.id}">
          <span class="dot ${s.cor}" title="${s.motivo}"></span>
          <span class="grow"><span class="nm">${esc(i.nome)}</span>${prox?.validade ? `<span class="sub">próx. validade ${fmtData(prox.validade)}</span>` : ""}</span>
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
    <p class="sub">Alertas: ${it.validade ? `avisa ${avisoDe(it)} dias antes de vencer · ` : ""}${temMinimo(it) ? `avisa abaixo de ${fmtQtd(it.minimo, it.unidade)}` : "avisa abaixo da meta"}</p>

    <div class="grid3">
      ${DEGRAUS.map((d, i) => `<div class="tile ${i === state.config.degrau ? "atual" : ""}"><span class="lbl">Meta ${d}</span><b class="sm">${it.metas[i] ? fmtQtd(it.metas[i], it.unidade) : "—"}</b></div>`).join("")}
    </div>

    <div class="card">
      <div class="head"><h2>Em casa: ${fmtQtd(qtdTotal(id), it.unidade)}</h2></div>
      ${lotes.length ? `<ul class="rows">${lotes.map(l => `
        <li><div class="lote">
          <span class="grow"><b>${fmtQtd(l.qtd, it.unidade)}</b>${l.local ? `<span class="sub"> · ${esc(l.local)}</span>` : ""}<br>${badgeValidade(l.validade, it)}</span>
          <button class="btn small ghost" data-descartar="${l.id}">Descartar</button>
        </div></li>`).join("")}</ul>` : `<p class="empty">Nada em casa ainda.</p>`}
    </div>

    <div class="actions">
      <a class="btn" href="#entrada/${id}">Entrada</a>
      <a class="btn ghost" href="#saida/${id}" ${lotes.length ? "" : 'aria-disabled="true"'}>Saída</a>
      <a class="btn ghost" href="#editar/${id}">Editar</a>
    </div>

    <div class="card">
      <h2>Histórico</h2>
      ${movs.length ? `<ul class="rows">${movs.map(m => `<li><div class="lote">
        <span class="grow">${fmtData(m.data)} · ${m.tipo}${m.nota ? ` · ${esc(m.nota)}` : ""}</span>
        <span class="qty ${m.tipo === "entrada" ? "pos" : "neg"}">${m.tipo === "entrada" ? "+" : "−"}${fmtQtd(m.qtd, it.unidade)}</span>
      </div></li>`).join("")}</ul>` : `<p class="empty">Sem movimentações.</p>`}
    </div>
  </section>`;
}

function viewEntrada(id) {
  const it = id ? item(id) : null;
  return `
  <section class="stack">
    <h1>Entrada</h1>
    <form id="fEntrada" class="card form">
      <label>Item<select id="eItem" required><option value="">Escolha…</option>${itemOptions(id)}</select></label>
      <a class="sub link" href="#novo">Não está na lista? Cadastrar novo item</a>
      <div class="row2">
        <label>Quantidade<input id="eQtd" type="number" inputmode="decimal" step="any" min="0.01" required></label>
        <label>Unidade<input id="eUn" value="${esc(it?.unidade || "")}" disabled></label>
      </div>
      <label id="eValWrap" ${it && !it.validade ? "hidden" : ""}>Validade<input id="eVal" type="date"></label>
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
  const it = id ? item(id) : { nome: "", categoria: "Comida", unidade: "un", metas: [0, 0, 0], validade: true, dica: "" };
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
      <fieldset><legend>Metas</legend>
        <div class="row3">${DEGRAUS.map((d, i) => `<label>${d}<input id="iM${i}" type="number" inputmode="decimal" step="any" min="0" value="${it.metas[i] || 0}"></label>`).join("")}</div>
      </fieldset>
      <label class="check"><input id="iVal" type="checkbox" ${it.validade ? "checked" : ""}> Tem data de validade</label>
      <fieldset><legend>Alertas deste item</legend>
        <div class="row2">
          <label>Avisar quantos dias antes de vencer<input id="iAviso" type="number" inputmode="numeric" min="0" placeholder="padrão: ${state.config.avisoDias}" value="${it.avisoDias ?? ""}"></label>
          <label>Avisar quando ficar abaixo de<input id="iMin" type="number" inputmode="decimal" step="any" min="0" placeholder="padrão: a meta" value="${it.minimo ?? ""}"></label>
        </div>
        <p class="sub">Deixe em branco para usar o padrão. Com um mínimo, o item fica amarelo abaixo da meta e vermelho abaixo do mínimo.</p>
      </fieldset>
      <label>Dica <span class="opt">(opcional)</span><input id="iDica" value="${esc(it.dica || "")}"></label>
      <button class="btn" type="submit">Salvar</button>
    </form>
    ${id ? `<div id="delArea"><button class="btn ghost danger" id="delItem" type="button">Excluir item</button></div>` : ""}
  </section>`;
}

function viewCompras() {
  const d = state.config.degrau;
  const grupos = CATEGORIAS.map(cat => {
    const falta = state.items.filter(i => i.categoria === cat)
      .map(i => ({ i, f: (i.metas[d] || 0) - qtdValida(i.id) }))
      .filter(x => x.f > 0);
    if (!falta.length) return "";
    return `<div class="card flush"><h2>${esc(cat)}</h2><ul class="rows">${falta.map(x =>
      `<li><a href="#entrada/${x.i.id}"><span class="grow">${esc(x.i.nome)}</span><span class="qty">${fmtQtd(x.f, x.i.unidade)}</span></a></li>`).join("")}</ul></div>`;
  }).join("");
  const proximo = d < 2 ? `<p class="sub">Quando completar, mude a meta para ${DEGRAUS[d + 1]} no Painel.</p>` : "";
  return `
  <section class="stack">
    <h1>Lista de compras</h1>
    <p class="sub">O que falta para a meta de ${DEGRAUS[d]}. Toque no item para registrar a compra.</p>
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
    </div>

    <form class="card form" id="fCfg">
      <h2>Família e alertas</h2>
      <div class="row2">
        <label>Pessoas na casa<input id="cPessoas" type="number" min="1" value="${c.pessoas}"></label>
        <label>Litros de água por pessoa/dia<input id="cLitros" type="number" min="1" step="0.5" value="${c.litrosDia}"></label>
      </div>
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

function viewImprimir() {
  const d = state.config.degrau;
  return `
  <section class="print">
    <div class="noprint actions"><a class="btn ghost" href="#mais">‹ Voltar</a><button class="btn" id="bPrint" type="button">Imprimir</button></div>
    <h1>Sobrevivente Urbano · Inventário</h1>
    <p>Gerado em ${fmtData(isoHoje())} · meta atual: ${DEGRAUS[d]} · ${state.config.pessoas} pessoas</p>
    <table>
      <thead><tr><th>Item</th><th>Em casa</th><th>Meta</th><th>Validades</th></tr></thead>
      <tbody>${CATEGORIAS.map(cat => {
        const its = state.items.filter(i => i.categoria === cat);
        if (!its.length) return "";
        return `<tr class="cat"><td colspan="4">${esc(cat)}</td></tr>` + its.map(i => `<tr>
          <td>${esc(i.nome)}</td>
          <td>${fmtQtd(qtdTotal(i.id), i.unidade)}</td>
          <td>${i.metas[d] ? fmtQtd(i.metas[d], i.unidade) : "—"}</td>
          <td>${lotesDe(i.id).filter(l => l.validade).map(l => `${fmtQtd(l.qtd, i.unidade)} até ${fmtData(l.validade)}`).join("; ") || "—"}</td>
        </tr>`).join("");
      }).join("")}</tbody>
    </table>
    <h2>Telefones</h2>
    <p>Defesa Civil 199 · SAMU 192 · Bombeiros 193 · Alerta da Defesa Civil: SMS com o CEP para 40199</p>
    <h2>Água</h2>
    <p>Hipoclorito de sódio 2,5%: siga a dose do rótulo (em geral 2 gotas por litro, esperar 30 minutos).</p>
  </section>`;
}

// ---------- roteador ----------

function render() {
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
  };
  $view.innerHTML = (telas[rota] || telas.painel)();
  document.body.classList.toggle("printing", rota === "imprimir");
  const ativa = { item: "estoque", editar: "estoque", novo: "estoque", saida: "estoque", imprimir: "mais" }[rota] || rota;
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
    document.getElementById("eUn").value = it?.unidade || "";
    document.getElementById("eValWrap").hidden = it ? !it.validade : false;
  }
  if (t.id === "sItem") {
    const it = item(t.value);
    document.getElementById("sDisp").textContent = it ? `Em casa: ${fmtQtd(qtdTotal(it.id), it.unidade)}. Sai primeiro o que vence antes.` : "";
  }
  if (t.id === "bImport" && t.files[0]) importar(t.files[0]);
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
    state.lotes.push({ id: uid(), itemId: it.id, qtd, validade, local: document.getElementById("eLocal").value.trim(), criado: isoHoje() });
    state.movs.push({ id: uid(), itemId: it.id, tipo: "entrada", qtd, data: isoHoje(), nota: document.getElementById("eNota").value.trim() });
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
    state.movs.push({ id: uid(), itemId: it.id, tipo: document.getElementById("sMotivo").value, qtd: saiu, data: isoHoje() });
    save(); toast(`Saída registrada: ${fmtQtd(saiu, it.unidade)}`);
    location.hash = "#item/" + it.id;
  }

  if (f.id === "fItem") {
    const dados = {
      nome: document.getElementById("iNome").value.trim(),
      categoria: document.getElementById("iCat").value,
      unidade: document.getElementById("iUn").value,
      metas: [0, 1, 2].map(i => num("iM" + i) || 0),
      validade: document.getElementById("iVal").checked,
      dica: document.getElementById("iDica").value.trim(),
      avisoDias: campoOpcional("iAviso"),
      minimo: campoOpcional("iMin"),
    };
    if (!dados.nome) return toast("Dê um nome ao item.");
    let id = f.dataset.id;
    if (id) Object.assign(item(id), dados);
    else { id = uid(); state.items.push({ id, ...dados }); }
    save(); toast("Item salvo");
    location.hash = "#item/" + id;
  }

  if (f.id === "fCfg") {
    state.config.pessoas = Math.max(1, Math.round(num("cPessoas")) || 5);
    state.config.litrosDia = Math.max(1, num("cLitros") || 4);
    state.config.avisoDias = campoOpcional("cAviso") ?? 60;
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
    state.movs.push({ id: uid(), itemId: l.itemId, tipo: "descarte", qtd: l.qtd, data: isoHoje(), nota: l.validade ? `validade ${fmtData(l.validade)}` : "" });
    state.lotes = state.lotes.filter(x => x.id !== l.id);
    save(); toast("Lote descartado"); render();
  }

  if (t.id === "delItem") {
    document.getElementById("delArea").innerHTML = `<div class="confirm"><span>Excluir o item e todo o histórico dele?</span>
      <button class="btn small danger" id="delYes" type="button">Excluir</button><button class="btn small ghost" id="delNo" type="button">Cancelar</button></div>`;
  }
  if (t.id === "delNo") render();
  if (t.id === "delYes") {
    const id = location.hash.split("/")[1];
    state.items = state.items.filter(i => i.id !== id);
    state.lotes = state.lotes.filter(l => l.itemId !== id);
    state.movs = state.movs.filter(m => m.itemId !== id);
    save(); toast("Item excluído"); location.hash = "#estoque";
  }

  if (t.id === "bReset") {
    document.getElementById("resetArea").innerHTML = `<div class="confirm"><span>Apagar todo o estoque e voltar ao catálogo inicial? Faça um backup antes.</span>
      <button class="btn small danger" id="resetYes" type="button">Apagar tudo</button><button class="btn small ghost" id="resetNo" type="button">Cancelar</button></div>`;
  }
  if (t.id === "resetNo") render();
  if (t.id === "resetYes") { state = seedState(); save(); toast("Tudo apagado"); location.hash = "#painel"; render(); }

  if (t.id === "bExport") exportar();
  if (t.id === "bPrint") window.print();
});

function exportar() {
  state.config.ultimoBackup = isoHoje();
  save();
  const blob = new Blob([JSON.stringify(state, null, 1)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `sobrevivente-urbano-backup-${isoHoje()}.json`;
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
      state = s; save(); toast("Backup restaurado"); location.hash = "#painel"; render();
    } catch (e) { toast("Esse arquivo não é um backup do Sobrevivente Urbano."); }
  };
  r.readAsText(file);
}

function atualizarRede() {
  document.getElementById("netStatus").hidden = navigator.onLine;
}

load();
window.addEventListener("hashchange", render);
window.addEventListener("online", atualizarRede);
window.addEventListener("offline", atualizarRede);
atualizarRede();
render();
