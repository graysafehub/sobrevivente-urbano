// Avisos (fase 4): avisos meteorológicos do INMET e previsão do município, lidos quando há internet.
// O último que foi lido fica guardado para consultar offline, com a hora da leitura.
// Avisos: a lista nacional é baixada inteira e filtrada aqui (pelo município e pela posição de casa),
// então a localização não é enviada. Previsão: só o código IBGE do município vai ao INMET.

const INMET_AVISOS = "https://apiprevmet3.inmet.gov.br/avisos/ativos";
const INMET_PREVISAO = "https://apiprevmet3.inmet.gov.br/previsao/";
const IBGE_MUNICIPIOS = uf => `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`;
const ATUALIZAR_MIN = 30;   // lê de novo sozinho depois de 30 minutos, se houver internet
const VELHO_H = 12;         // depois de 12 horas sem leitura, o app avisa que está velho

window.UFS = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"];

// severidade do INMET → cor do app
const SEVERIDADE = { "Perigo Potencial": "amarelo", "Perigo": "laranja", "Grande Perigo": "vermelho" };
const ORDEM_SEV = { vermelho: 0, laranja: 1, amarelo: 2 };
// evento do INMET → guia de crise que ajuda
function guiaDoEvento(ev) {
  const e = (ev || "").toLowerCase();
  if (/chuv|tempestade|vendaval|granizo|ventos/.test(e)) return "chuva";
  return null;
}

// ---------- geometria ----------

// ponto dentro do polígono (GeoJSON usa [lon, lat]); considera os buracos
function dentroDoAnel(lon, lat, anel) {
  let dentro = false;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const [xi, yi] = anel[i], [xj, yj] = anel[j];
    if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}
function dentroDoPoligono(p, geo) {
  if (!geo || !p) return false;
  const polis = geo.type === "Polygon" ? [geo.coordinates] : geo.type === "MultiPolygon" ? geo.coordinates : [];
  return polis.some(([fora, ...buracos]) => dentroDoAnel(p.lon, p.lat, fora) && !buracos.some(b => dentroDoAnel(p.lon, p.lat, b)));
}

// ---------- leitura ----------

let lendoAvisos = false;

function reduzirAviso(a, hoje) {
  return {
    id: a.id, evento: a.descricao, severidade: a.severidade, cor: SEVERIDADE[a.severidade] || "amarelo",
    inicio: a.inicio, fim: a.fim, hoje,
    riscos: (a.riscos || []).map(s => s.trim()).filter(Boolean),
    instrucoes: (a.instrucoes || []).map(s => s.trim()).filter(Boolean),
    link: `https://avisos.inmet.gov.br/${a.id}`,
  };
}

function reduzirPrevisao(j, cod) {
  const dias = j?.[cod];
  if (!dias) return null;
  const parte = p => p && { resumo: p.resumo, max: p.temp_max, min: p.temp_min, umidMin: p.umidade_min, umidMax: p.umidade_max, vento: `${(p.int_vento || "").toLowerCase()}${p.dir_vento ? ` (${p.dir_vento})` : ""}` };
  return Object.entries(dias).map(([data, v]) => v.manha
    ? { data, semana: v.manha.dia_semana, manha: parte(v.manha), tarde: parte(v.tarde), noite: parte(v.noite) }
    : { data, semana: v.dia_semana, dia: parte(v) });
}

async function atualizarAvisos() {
  const a = state.avisos;
  if (lendoAvisos || !navigator.onLine) return false;
  lendoAvisos = true;
  try {
    const casa = casaZ();
    const ponto = temPos(casa) ? casa : null;
    const cod = a.municipio ? String(a.municipio.id) : null;
    if (!cod && !ponto) throw new Error("sem local");
    const j = await (await fetch(INMET_AVISOS, { cache: "no-store", signal: AbortSignal.timeout(25000) })).json();
    const todos = [...(j.hoje || []).map(x => [x, true]), ...(j.futuro || []).map(x => [x, false])];
    const meus = todos.filter(([x]) => {
      const porCod = cod && String(x.geocodes || "").split(",").includes(cod);
      let geo = null;
      try { geo = typeof x.poligono === "string" ? JSON.parse(x.poligono) : x.poligono; } catch (e) {}
      return porCod || dentroDoPoligono(ponto, geo);
    });
    // hora de recebimento: a primeira vez que o app viu o aviso; uma nova leitura não muda
    const recebidos = Object.fromEntries((a.itens || []).map(x => [x.id, x.recebidoEm || a.lidoEm]));
    const agora = new Date().toISOString();
    a.itens = meus.map(([x, h]) => ({ ...reduzirAviso(x, h), recebidoEm: recebidos[x.id] || agora })).sort((p, q) => ORDEM_SEV[p.cor] - ORDEM_SEV[q.cor] || (p.inicio < q.inicio ? -1 : 1));
    if (cod) {
      try {
        const pj = await (await fetch(INMET_PREVISAO + cod, { cache: "no-store", signal: AbortSignal.timeout(25000) })).json();
        a.previsao = reduzirPrevisao(pj, cod) || a.previsao;
      } catch (e) { /* previsão é extra: os avisos já valem */ }
    }
    a.lidoEm = new Date().toISOString();
    a.erro = "";
    save();
    return true;
  } catch (e) {
    a.erro = e.message === "sem local" ? "" : "Não foi possível ler o INMET agora. Fica valendo a última leitura.";
    save();
    return false;
  } finally {
    lendoAvisos = false;
  }
}

// chamado pelo render: no Hub e na tela de avisos, lê de novo se a leitura tiver mais de 30 minutos
function avisosAoRenderizar(rota) {
  if (!["painel", "avisos"].includes(rota)) return;
  const a = state.avisos;
  if (!a.municipio && !temPos(casaZ())) return;
  const idade = a.lidoEm ? (Date.now() - new Date(a.lidoEm)) / 60000 : Infinity;
  if (idade < ATUALIZAR_MIN || !navigator.onLine || lendoAvisos) return;
  atualizarAvisos().then(ok => {
    const r = (location.hash.slice(1) || "painel").split("/")[0];
    if (ok && ["painel", "avisos"].includes(r)) render();
  });
}

// ---------- telas ----------

function fmtLido(iso) {
  if (!iso) return "INMET ainda não verificado";
  const d = new Date(iso);
  const min = Math.round((Date.now() - d) / 60000);
  const quando = min < 1 ? "agora" : min < 60 ? `há ${min} min` : min < 1440 ? `há ${Math.floor(min / 60)} h` : `há ${Math.floor(min / 1440)} d`;
  return `INMET verificado ${d.toLocaleDateString("pt-BR")} ${d.toTimeString().slice(0, 5)} (${quando})`;
}
const leituraVelha = a => !a.lidoEm || (Date.now() - new Date(a.lidoEm)) / 3600000 > VELHO_H;
// "2026-11-04 09:00" → "04/11 09:00"
const fmtQuando = s => { const [d, h] = String(s || "").split(" "); const [y, m, dd] = (d || "").split("-"); return dd ? `${dd}/${m} ${h || ""}`.trim() : s; };
// "2026-11-04 23:59" (hora de Brasília) → Date
const dataInmet = t => new Date(String(t || "").replace(" ", "T") + ":00-03:00");
// sem internet, a última leitura continua na tela, mas o que já acabou sai
const avisosValidos = a => (a.itens || []).filter(x => !(dataInmet(x.fim) < new Date()));
const nomeLocal = a => a.municipio ? `${a.municipio.nome} (${a.municipio.uf})` : "a casa";

// "05/11 09:51"
const fmtRecebido = iso => { const d = new Date(iso); return `${d.toLocaleDateString("pt-BR").slice(0, 5)} ${d.toTimeString().slice(0, 5)}`; };

function avisoHtml(x, completo, aberto) {
  const g = guiaDoEvento(x.evento);
  return `<div class="aviso ${x.cor}">
    <div class="head"><b>${esc(x.evento)}</b><span class="badge ${x.cor}">${esc(x.severidade)}</span></div>
    ${x.recebidoEm ? `<p class="sub recebido">Recebido ${esc(fmtRecebido(x.recebidoEm))}</p>` : ""}
    <p class="sub">${dataInmet(x.inicio) <= new Date() ? "Em vigor" : "Previsto"} · de ${esc(fmtQuando(x.inicio))} até ${esc(fmtQuando(x.fim))}</p>
    ${completo ? `<details ${aberto ? "open" : ""}><summary>Riscos e o que fazer</summary>${x.riscos.map(r => `<p>${esc(r)}</p>`).join("")}
      ${x.instrucoes.length ? `<ul class="passos">${x.instrucoes.map(i => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}</details>
      <div class="actions">${g ? `<a class="btn small" href="#crise/${g}">Guia: ${esc(CRISES.find(c => c.id === g)?.titulo || "")}</a>` : ""}<a class="btn small ghost" href="${esc(x.link)}" target="_blank" rel="noopener">Ver no INMET</a></div>` : ""}
  </div>`;
}

function cardAvisosHub() {
  const a = state.avisos;
  if (!a.municipio && !temPos(casaZ())) {
    return `<a class="alert amarelo" href="#avisos">[ AVISOS ] Escolha o seu município para receber os avisos do INMET.</a>`;
  }
  const itens = avisosValidos(a);
  return `<div class="card ${itens.some(x => x.cor === "vermelho") ? "alerta-vermelho" : ""}">
    <div class="head"><h2><span class="mod">▲</span> · Avisos do tempo · INMET</h2><a class="btn small ghost" href="#avisos">Abrir</a></div>
    ${itens.length ? itens.slice(0, 3).map(x => `<a class="plain" href="#avisos">${avisoHtml(x, false)}</a>`).join("") : `<p class="empty">Nenhum aviso para ${esc(nomeLocal(a))}.</p>`}
    <p class="sub ${leituraVelha(a) ? "alerta-txt" : ""}">${esc(fmtLido(a.lidoEm))}${a.erro ? ` · ${esc(a.erro)}` : ""}</p>
  </div>`;
}

function previsaoHtml(p) {
  if (!p?.length) return "";
  const linha = (rot, x) => x ? `<div class="prev-parte"><span class="lbl">${rot}</span><span>${esc(x.resumo)}</span></div>` : "";
  return `<div class="card flush"><h2><span class="mod">02</span> · Previsão · ${esc(nomeLocal(state.avisos))}</h2>
    <ul class="rows previsao">${p.map(d => {
      const base = d.dia || d.tarde || d.manha;
      return `<li><div class="lote prev">
        <span class="grow"><span class="nm">${esc(d.semana || "")} ${esc(d.data.slice(0, 5))}</span>
          ${d.dia ? `<span class="sub">${esc(d.dia.resumo)}</span>` : linha("manhã", d.manha) + linha("tarde", d.tarde) + linha("noite", d.noite)}
          <span class="sub">umidade ${base.umidMin}–${base.umidMax}% · ventos ${esc(base.vento)}</span></span>
        <span class="qty">${base.max}°<span class="sub"> / ${base.min}°</span></span>
      </div></li>`;
    }).join("")}</ul></div>`;
}

function viewAvisos() {
  const a = state.avisos;
  const casa = casaZ();
  const itens = avisosValidos(a);
  return `
  <section class="stack">
    <a class="back" href="#painel">‹ Hub</a>
    <div class="head"><h1>Avisos</h1><button class="btn small" id="bAvisos" type="button" ${navigator.onLine ? "" : "disabled"}>${lendoAvisos ? "Lendo…" : "Atualizar agora"}</button></div>
    <p class="sub ${leituraVelha(a) ? "alerta-txt" : ""}">${esc(fmtLido(a.lidoEm))}${navigator.onLine ? "" : " · sem internet: mostrando a última leitura"}${a.erro ? ` · ${esc(a.erro)}` : ""}</p>

    <div class="card">
      <h2><span class="mod">01</span> · Avisos meteorológicos · INMET</h2>
      ${a.municipio || temPos(casa) ? (itens.length ? itens.map((x, i) => avisoHtml(x, true, i === 0)).join("") : `<p class="empty">${a.lidoEm ? `Nenhum aviso ativo ou previsto para ${esc(nomeLocal(a))}.` : "Ainda não lido. Toque em Atualizar agora com internet."}</p>`)
        : `<p class="empty">Escolha o município abaixo${temPos(casa) ? "" : " ou grave a posição de casa em Zonas"}.</p>`}
      <p class="sub">Conta o aviso que cita o seu município${temPos(casa) ? " ou cuja área cobre a posição de casa (Zonas)" : ""}. Amarelo = perigo potencial, laranja = perigo, vermelho = grande perigo.</p>
    </div>

    ${previsaoHtml(a.previsao)}

    <form class="card form" id="fMunicipio">
      <h2>Município</h2>
      <div class="row2">
        <label>Estado<select id="aUf"><option value="">—</option>${UFS.map(u => `<option ${u === a.municipio?.uf ? "selected" : ""}>${u}</option>`).join("")}</select></label>
        <label>Município<select id="aMun">${a.municipio ? `<option value="${a.municipio.id}">${esc(a.municipio.nome)}</option>` : `<option value="">escolha o estado</option>`}</select></label>
      </div>
      <button class="btn ghost" type="submit">Salvar município</button>
      <p class="sub">A lista de municípios vem do IBGE e precisa de internet. Para a previsão, o app envia ao INMET só o código do município; os avisos vêm numa lista do país inteiro e são filtrados aqui, sem enviar a sua localização.</p>
    </form>

    <div class="card">
      <h2>Defesa Civil</h2>
      <p>Os alertas da Defesa Civil (risco de deslizamento, enchente, evacuação) não podem ser lidos por este app: o sistema deles não libera a leitura por outros sites. Para recebê-los:</p>
      <ul class="passos">
        <li>Mande um SMS com o seu CEP para <b>40199</b>. É grátis e vale para cada CEP que quiser (casa, escola, trabalho).</li>
        <li>No Android, deixe ligados os alertas de emergência: Configurações › Segurança e emergência › Alertas de emergência sem fio (o caminho muda um pouco conforme a marca).</li>
        <li>Na falta de luz ou de sinal, o rádio a pilha é a fonte que sobra.</li>
      </ul>
      <p class="sub">Fontes: INMET, avisos meteorológicos (avisos.inmet.gov.br) e previsão por município; IBGE, lista de municípios; Defesa Civil Nacional, alerta por SMS 40199.</p>
    </div>
  </section>`;
}

// ---------- ações ----------

document.addEventListener("change", async e => {
  if (e.target.id !== "aUf") return;
  const sel = document.getElementById("aMun");
  const uf = e.target.value;
  if (!uf) return;
  sel.innerHTML = `<option value="">carregando…</option>`;
  try {
    const lista = await (await fetch(IBGE_MUNICIPIOS(uf), { signal: AbortSignal.timeout(20000) })).json();
    lista.sort((p, q) => p.nome.localeCompare(q.nome, "pt-BR"));
    sel.innerHTML = `<option value="">escolha…</option>` + lista.map(m => `<option value="${m.id}">${esc(m.nome)}</option>`).join("");
  } catch (err) {
    sel.innerHTML = `<option value="">sem internet: tente de novo</option>`;
  }
});

document.addEventListener("submit", e => {
  if (e.target.id !== "fMunicipio") return;
  e.preventDefault();
  const uf = document.getElementById("aUf").value;
  const sel = document.getElementById("aMun");
  const id = +sel.value;
  if (!uf || !id) return toast("Escolha o estado e o município.");
  const nome = sel.options[sel.selectedIndex].textContent;
  state.avisos.municipio = { id, nome, uf };
  state.avisos.itens = []; state.avisos.previsao = null; state.avisos.lidoEm = null;
  save(); toast(`Município: ${nome} (${uf})`);
  render();
});

document.addEventListener("click", async e => {
  if (e.target.closest("button")?.id !== "bAvisos") return;
  if (!navigator.onLine) return toast("Sem internet agora.");
  e.target.textContent = "Lendo…";
  const ok = await atualizarAvisos();
  toast(ok ? "Avisos atualizados" : state.avisos.erro || "Escolha o município primeiro.");
  render();
});
