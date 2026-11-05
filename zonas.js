// Zonas (fase 3): lugares com coordenadas, rotas em texto com link para o Google Maps
// e radar dos lugares em volta de casa, desenhado no app (funciona sem internet).
// O GPS só é usado com a tela aberta: para gravar um lugar ou para mostrar "você" no radar.

window.GRUPOS_LUGAR = {
  casa: { nome: "Casa", forma: "casa" },
  encontro: { nome: "Encontro e abrigo", forma: "triangulo" },
  saude: { nome: "Saúde", forma: "cruz" },
  abastecimento: { nome: "Abastecimento", forma: "quadrado" },
  rotina: { nome: "Escola e trabalho", forma: "losango" },
  outro: { nome: "Outros", forma: "circulo" },
};

window.TIPOS_LUGAR = {
  casa: { nome: "Casa", grupo: "casa" },
  encontro1: { nome: "Ponto de encontro principal", grupo: "encontro" },
  encontro2: { nome: "Ponto de encontro secundário", grupo: "encontro" },
  parente: { nome: "Casa de parente", grupo: "encontro" },
  abrigo: { nome: "Abrigo", grupo: "encontro" },
  hospital: { nome: "Hospital", grupo: "saude" },
  upa: { nome: "UPA ou pronto-socorro", grupo: "saude" },
  ubs: { nome: "UBS ou posto de saúde", grupo: "saude" },
  farmacia: { nome: "Farmácia", grupo: "saude" },
  posto: { nome: "Posto de combustível", grupo: "abastecimento" },
  mercado: { nome: "Mercado", grupo: "abastecimento" },
  gas: { nome: "Revenda de gás", grupo: "abastecimento" },
  agua: { nome: "Ponto de água", grupo: "abastecimento" },
  escola: { nome: "Escola", grupo: "rotina" },
  trabalho: { nome: "Trabalho", grupo: "rotina" },
  outro: { nome: "Outro", grupo: "outro" },
};

const lugar = id => state.zonas.lugares.find(l => l.id === id);
const rotaZ = id => state.zonas.rotas.find(r => r.id === id);
const casaZ = () => state.zonas.lugares.find(l => l.tipo === "casa");
const temPos = l => l && Number.isFinite(l.lat) && Number.isFinite(l.lon);
const grupoDe = l => TIPOS_LUGAR[l.tipo]?.grupo || "outro";

// ---------- coordenadas ----------

// aceita "-15.7939, -47.8828" e links do Google Maps (@lat,lon · !3dlat!4dlon · q=lat,lon)
function lerCoordenadas(txt) {
  const t = String(txt || "").trim();
  const n = "(-?\\d{1,3}(?:\\.\\d+)?)";
  const padroes = [
    new RegExp(`!3d${n}!4d${n}`),
    new RegExp(`[?&](?:q|query|ll|destination|daddr)=${n},\\s*${n}`),
    new RegExp(`@${n},${n}`),
    new RegExp(`^${n}\\s*[,;\\s]\\s*${n}$`),
  ];
  for (const p of padroes) {
    const m = t.match(p);
    if (!m) continue;
    const lat = +m[1], lon = +m[2];
    if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) return { lat, lon };
  }
  // vírgula decimal: "-15,7939 -47,8828"
  const br = t.match(/^(-?\d{1,3},\d+)\s+(-?\d{1,3},\d+)$/);
  if (br) return { lat: +br[1].replace(",", "."), lon: +br[2].replace(",", ".") };
  return null;
}

const rad = g => g * Math.PI / 180;
// distância em metros (haversine)
function distancia(a, b) {
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}
// rumo em graus a partir do norte, no sentido horário
function rumo(a, b) {
  const y = Math.sin(rad(b.lon - a.lon)) * Math.cos(rad(b.lat));
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon));
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
const PONTOS = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];
const fmtRumo = g => PONTOS[Math.round(g / 45) % 8];
function fmtDist(m) {
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toLocaleString("pt-BR", { maximumFractionDigits: m < 10000 ? 1 : 0 })} km`;
}
// a pé, 4,5 km/h, em linha reta: o caminho real é mais longo
const fmtAPe = m => { const min = Math.round(m / 75); return min < 60 ? `${Math.max(1, min)} min` : `${Math.floor(min / 60)} h ${min % 60} min`; };
const fmtCoord = l => `${l.lat.toFixed(5)}, ${l.lon.toFixed(5)}`;
const linkLugar = l => `https://www.google.com/maps/search/?api=1&query=${l.lat},${l.lon}`;
function linkRota(r) {
  const de = lugar(r.de), para = lugar(r.para);
  if (!temPos(de) || !temPos(para)) return null;
  return `https://www.google.com/maps/dir/?api=1&origin=${de.lat},${de.lon}&destination=${para.lat},${para.lon}&travelmode=${r.modo === "carro" ? "driving" : "walking"}`;
}
// texto "1,2 km NE de casa"
function deCasa(l) {
  const c = casaZ();
  if (!temPos(l) || !temPos(c) || l === c) return "";
  return `${fmtDist(distancia(c, l))} ${fmtRumo(rumo(c, l))} de casa`;
}

// ---------- GPS ----------

const gps = { ligado: false, pos: null, precisao: null, watch: null, erro: "" };

function erroGps(e) {
  return e.code === 1 ? "Localização negada. Libere nas permissões do Chrome para este site."
    : e.code === 3 ? "O GPS demorou demais. Tente perto de uma janela ou ao ar livre."
    : "Não foi possível obter a posição.";
}

function ligarGps() {
  if (!navigator.geolocation) { gps.erro = "Este aparelho não tem localização."; return; }
  gps.ligado = true; gps.erro = "";
  gps.watch = navigator.geolocation.watchPosition(p => {
    gps.pos = { lat: p.coords.latitude, lon: p.coords.longitude };
    gps.precisao = p.coords.accuracy;
    gps.erro = "";
    atualizarRadar();
  }, e => { gps.erro = erroGps(e); atualizarRadar(); }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 30000 });
}
function desligarGps() {
  if (gps.watch !== null) navigator.geolocation.clearWatch(gps.watch);
  gps.watch = null; gps.ligado = false;
}

// chamado pelo render: o GPS só fica ligado com o radar na tela
function zonasAoRenderizar(rota) {
  if (rota !== "zonas" && gps.watch !== null) { navigator.geolocation.clearWatch(gps.watch); gps.watch = null; }
  if (rota === "zonas" && gps.ligado && gps.watch === null) ligarGps();
}

// ---------- radar ----------

// distância de borda "redonda" acima de m
function bordaRadar(m) {
  const passos = [200, 500, 1000, 2000, 3000, 5000, 10000, 20000, 50000, 100000];
  return passos.find(p => p >= m * 1.08) || Math.ceil(m / 100000) * 100000;
}

function marcador(forma, x, y, cls) {
  const s = 7;
  const f = {
    casa: `<rect x="${x - s}" y="${y - s}" width="${2 * s}" height="${2 * s}" class="${cls}"/><path d="M${x - s} ${y - s}L${x} ${y - 2 * s}L${x + s} ${y - s}Z" class="${cls}"/>`,
    triangulo: `<path d="M${x} ${y - s - 1}L${x + s + 1} ${y + s}L${x - s - 1} ${y + s}Z" class="${cls}"/>`,
    cruz: `<path d="M${x - 2.5} ${y - s}h5v${s - 2.5}h${s - 2.5}v5h-${s - 2.5}v${s - 2.5}h-5v-${s - 2.5}h-${s - 2.5}v-5h${s - 2.5}Z" class="${cls}"/>`,
    quadrado: `<rect x="${x - s + 1}" y="${y - s + 1}" width="${2 * s - 2}" height="${2 * s - 2}" class="${cls}"/>`,
    losango: `<path d="M${x} ${y - s - 1}L${x + s + 1} ${y}L${x} ${y + s + 1}L${x - s - 1} ${y}Z" class="${cls}"/>`,
    circulo: `<circle cx="${x}" cy="${y}" r="${s - 1}" class="${cls}"/>`,
  };
  return f[forma] || f.circulo;
}

// lugares numerados: o número aparece no radar e na lista
function lugaresNumerados() {
  return state.zonas.lugares.filter(l => l.tipo !== "casa").map((l, i) => ({ l, n: i + 1 }));
}

function radarHtml(opts = {}) {
  const c = casaZ();
  const centro = temPos(c) ? c : gps.pos;
  if (!centro) return `<p class="empty">Cadastre a casa com a posição para montar o radar${opts.print ? "" : ", ou ligue a sua posição"}.</p>`;
  const R = 140, C = 160;
  const pts = lugaresNumerados().filter(({ l }) => temPos(l)).map(o => ({ ...o, d: distancia(centro, o.l), g: rumo(centro, o.l) }));
  const voce = !opts.print && gps.pos && temPos(c) ? { d: distancia(c, gps.pos), g: rumo(c, gps.pos) } : null;
  const max = Math.max(150, ...pts.map(p => p.d), voce && voce.d < 30000 ? voce.d : 0);
  const borda = bordaRadar(max);
  // raiz quadrada: o que está perto não se amontoa no centro
  const xy = (d, g) => { const r = R * Math.sqrt(Math.min(d, borda) / borda); return [C + r * Math.sin(rad(g)), C - r * Math.cos(rad(g))]; };
  // anéis em números redondos (1, 2 ou 5 × 10ⁿ), perto de 1/9 e 4/9 da borda
  const redondo = v => { const e = 10 ** Math.floor(Math.log10(v)); return [1, 2, 5, 10].map(k => k * e).reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a); };
  const aneis = [redondo(borda / 9), redondo(borda * 4 / 9), borda].map(d => ({ r: R * Math.sqrt(d / borda), d }));
  return `<svg class="radar" viewBox="0 0 320 320" role="img" aria-label="Radar com ${pts.length} lugares em volta de ${temPos(c) ? "casa" : "você"}, norte para cima, borda em ${fmtDist(borda)}">
    <circle cx="${C}" cy="${C}" r="${R}" class="fundo"/>
    ${aneis.map(a => `<circle cx="${C}" cy="${C}" r="${a.r.toFixed(1)}" class="anel"/><text x="${C + 3}" y="${(C - a.r + 11).toFixed(1)}" class="escala">${fmtDist(a.d)}</text>`).join("")}
    <line x1="${C}" y1="${C - R}" x2="${C}" y2="${C + R}" class="eixo"/><line x1="${C - R}" y1="${C}" x2="${C + R}" y2="${C}" class="eixo"/>
    <text x="${C}" y="${C - R - 6}" class="norte">N</text><text x="${C + R + 8}" y="${C + 4}" class="ponto">L</text><text x="${C}" y="${C + R + 14}" class="ponto">S</text><text x="${C - R - 8}" y="${C + 4}" class="ponto">O</text>
    ${opts.print ? "" : `<g class="varredura"><path d="M${C} ${C}L${C} ${C - R}A${R} ${R} 0 0 1 ${(C + R * Math.sin(rad(30))).toFixed(1)} ${(C - R * Math.cos(rad(30))).toFixed(1)}Z"/></g>`}
    ${temPos(c) ? marcador("casa", C, C + 3, "m-casa") : `<circle cx="${C}" cy="${C}" r="5" class="m-voce"/>`}
    ${pts.map(p => { const [x, y] = xy(p.d, p.g); const fora = p.d > borda;
      return `<g class="g-${grupoDe(p.l)}">${marcador(GRUPOS_LUGAR[grupoDe(p.l)].forma, x, y, "m")}<text x="${(x + 10).toFixed(1)}" y="${(y - 6).toFixed(1)}" class="rot">${p.n}${fora ? "›" : ""}</text></g>`; }).join("")}
    ${voce ? (() => { const [x, y] = xy(voce.d, voce.g); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" class="m-voce"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" class="m-voce-aura"/><text x="${(x + 9).toFixed(1)}" y="${(y + 14).toFixed(1)}" class="rot voce">você${voce.d > borda ? " ›" : ""}</text>`; })() : ""}
  </svg>`;
}

function legendaHtml() {
  const c = casaZ();
  const ref = gps.pos;
  const itens = lugaresNumerados();
  if (!itens.length) return "";
  return `<ul class="rows legenda">${itens.map(({ l, n }) => {
    const dc = deCasa(l);
    const dv = ref && temPos(l) ? `você: ${fmtDist(distancia(ref, l))} ${fmtRumo(rumo(ref, l))} · ${fmtAPe(distancia(ref, l))} a pé` : "";
    return `<li><a href="#lugar/${l.id}">
      <span class="num g-${grupoDe(l)}">${n}</span>
      <span class="grow"><span class="nm">${esc(l.nome)}</span><span class="sub">${esc(TIPOS_LUGAR[l.tipo]?.nome || "")}${temPos(l) ? "" : " · sem posição"}</span>
      ${dv ? `<span class="sub voce">${dv}</span>` : ""}</span>
      <span class="right sub">${dc ? esc(dc.replace(" de casa", "")) : ""}</span>
    </a></li>`;
  }).join("")}</ul>`;
}

function gpsInfo() {
  if (gps.erro) return `<p class="sub alerta-txt">${esc(gps.erro)}</p>`;
  if (!gps.ligado) return "";
  if (!gps.pos) return `<p class="sub">Procurando o GPS…</p>`;
  const c = casaZ();
  return `<p class="sub">Você está ${temPos(c) ? `a ${fmtDist(distancia(c, gps.pos))} ${fmtRumo(rumo(c, gps.pos))} de casa` : "no centro do radar"} · precisão de ${Math.round(gps.precisao)} m. Distâncias em linha reta.</p>`;
}

function atualizarRadar() {
  const box = document.getElementById("radarBox");
  if (!box) return;
  box.innerHTML = radarHtml() + gpsInfo();
  const leg = document.getElementById("legendaBox");
  if (leg) leg.innerHTML = legendaHtml();
}

// ---------- telas ----------

function viewZonas() {
  const z = state.zonas;
  const c = casaZ();
  const grupos = Object.entries(GRUPOS_LUGAR).filter(([g]) => g !== "casa");
  const falta = [
    !c && "a casa",
    !z.lugares.some(l => l.tipo === "encontro1") && "o ponto de encontro principal",
    !z.lugares.some(l => ["hospital", "upa"].includes(l.tipo)) && "um hospital ou UPA",
  ].filter(Boolean);
  return `
  <section class="stack">
    <a class="back" href="#familia">‹ Família</a>
    <div class="head"><h1>Zonas</h1><a class="btn small" href="#lugar">Adicionar lugar</a></div>
    <p class="sub">Lugares em volta de casa, desenhados aqui no app: funciona sem internet. Norte para cima.</p>
    ${falta.length ? `<p class="alert amarelo">Falta cadastrar ${falta.join(", ")}.</p>` : ""}

    <div class="card">
      <div class="head"><h2><span class="mod">01</span> · Radar</h2>
        <button class="btn small ${gps.ligado ? "" : "ghost"}" id="bGps" type="button">${gps.ligado ? "Desligar minha posição" : "Mostrar minha posição"}</button></div>
      <div id="radarBox">${radarHtml()}${gpsInfo()}</div>
      <ul class="chips legenda-formas">${grupos.map(([g, v]) => `<li class="g-${g}"><svg viewBox="-10 -12 20 22" width="14" height="14" aria-hidden="true">${marcador(v.forma, 0, 0, "m")}</svg>${esc(v.nome)}</li>`).join("")}</ul>
      <p class="sub">A posição só é lida com esta tela aberta e não sai do aparelho. O GPS funciona sem internet.</p>
    </div>

    <div class="card flush">
      <h2><span class="mod">02</span> · Lugares</h2>
      ${c ? `<ul class="rows"><li><a href="#lugar/${c.id}"><span class="num g-casa">⌂</span><span class="grow"><span class="nm">${esc(c.nome)}</span><span class="sub">${esc(c.endereco || "")}${temPos(c) ? "" : " · sem posição"}</span></span></a></li></ul>` : ""}
      <div id="legendaBox">${legendaHtml()}</div>
      ${z.lugares.length ? "" : `<p class="empty">Nenhum lugar. Comece pela casa: abra Adicionar lugar estando em casa e toque em "Usar minha posição".</p>`}
    </div>

    <div class="card flush">
      <div class="head"><h2><span class="mod">03</span> · Rotas</h2><a class="btn small" href="#rota">Adicionar</a></div>
      ${z.rotas.length ? `<ul class="rows">${z.rotas.map(r => {
        const de = lugar(r.de), para = lugar(r.para);
        const d = temPos(de) && temPos(para) ? distancia(de, para) : null;
        return `<li><a href="#rota/${r.id}"><span class="grow"><span class="nm">${esc(r.nome || `${de?.nome || "?"} → ${para?.nome || "?"}`)}</span>
          <span class="sub">${r.modo === "carro" ? "de carro" : "a pé"}${d ? ` · ${fmtDist(d)} em linha reta` : ""}${r.alternativa ? " · tem alternativa" : " · sem alternativa"}</span></span><span aria-hidden="true">›</span></a></li>`;
      }).join("")}</ul>` : `<p class="empty">Nenhuma rota. Comece pela volta da escola e do trabalho para casa, e de casa até o ponto de encontro.</p>`}
    </div>
  </section>`;
}

function viewLugar(id) {
  const f = state.familia;
  const temCasa = casaZ();
  const novo = { nome: "", tipo: temCasa ? "encontro1" : "casa", endereco: "", tel: "", obs: "", lat: null, lon: null };
  const l = id ? lugar(id) : novo;
  if (!l) return `<p class="empty">Lugar não encontrado.</p>`;
  if (!id && l.tipo === "casa") { l.nome = "Casa"; l.endereco = f.endereco; }
  if (!id && l.tipo === "encontro1") l.nome = f.encontro.principal;
  const tipos = Object.entries(TIPOS_LUGAR).filter(([k]) => k !== "casa" || !temCasa || temCasa.id === id);
  return `
  <section class="stack">
    <a class="back" href="#zonas">‹ Zonas</a>
    <h1>${id ? "Lugar" : "Novo lugar"}</h1>
    <form id="fLugar" class="card form" data-id="${id || ""}">
      <label>Tipo<select id="lTipo">${tipos.map(([k, t]) => `<option value="${k}" ${k === l.tipo ? "selected" : ""}>${esc(t.nome)}</option>`).join("")}</select></label>
      <label>Nome<input id="lNome" value="${esc(l.nome)}" required placeholder="Ex.: Hospital Regional"></label>
      <label>Endereço <span class="opt">(opcional)</span><input id="lEnd" value="${esc(l.endereco)}"></label>
      <label>Telefone <span class="opt">(opcional)</span><input id="lTel" type="tel" inputmode="tel" value="${esc(l.tel)}"></label>
      <fieldset><legend>Posição</legend>
        <button class="btn ghost" id="bMinhaPos" type="button">◎ Usar minha posição agora</button>
        <label>Ou cole do Google Maps <span class="opt">(link ou números)</span><input id="lColar" placeholder="-15.79390, -47.88280"></label>
        <p class="sub" id="lPosInfo">${temPos(l) ? `Gravado: ${fmtCoord(l)}${deCasa(l) ? ` · ${deCasa(l)}` : ""}` : "Sem posição ainda."}</p>
        <div class="row2">
          <label>Latitude<input id="lLat" inputmode="decimal" value="${temPos(l) ? l.lat : ""}"></label>
          <label>Longitude<input id="lLon" inputmode="decimal" value="${temPos(l) ? l.lon : ""}"></label>
        </div>
        <p class="sub">No Maps, toque e segure no lugar: os números aparecem na busca, e é só copiar. Link curto (maps.app.goo.gl) não traz as coordenadas.</p>
      </fieldset>
      <label>Observação <span class="opt">(opcional)</span><input id="lObs" value="${esc(l.obs)}" placeholder="Ex.: entrada pela rua de trás, aberto 24 h"></label>
      <button class="btn" type="submit">Salvar</button>
    </form>
    ${id && temPos(l) ? `<a class="btn ghost" href="${linkLugar(l)}" target="_blank" rel="noopener">Abrir no Google Maps</a>` : ""}
    ${id ? `<div id="delLugarArea"><button class="btn ghost danger" id="delLugar" type="button">Excluir lugar</button></div>` : ""}
  </section>`;
}

function viewRota(id) {
  const ls = state.zonas.lugares;
  if (ls.length < 2) return `<section class="stack"><a class="back" href="#zonas">‹ Zonas</a><p class="empty">Cadastre pelo menos dois lugares (por exemplo, a escola e a casa) para montar uma rota.</p></section>`;
  const c = casaZ();
  const sugereDe = ls.find(l => ["escola", "trabalho"].includes(l.tipo)) || ls.find(l => l !== c);
  const r = id ? rotaZ(id) : { nome: "", de: sugereDe?.id, para: c?.id || ls[0].id, modo: "pe", principal: "", alternativa: "", obs: "" };
  if (!r) return `<p class="empty">Rota não encontrada.</p>`;
  const opts = sel => ls.map(l => `<option value="${l.id}" ${l.id === sel ? "selected" : ""}>${esc(l.nome)}</option>`).join("");
  const link = id ? linkRota(r) : null;
  return `
  <section class="stack">
    <a class="back" href="#zonas">‹ Zonas</a>
    <h1>${id ? "Rota" : "Nova rota"}</h1>
    <form id="fRota" class="card form" data-id="${id || ""}">
      <div class="row2">
        <label>De<select id="rDe">${opts(r.de)}</select></label>
        <label>Para<select id="rPara">${opts(r.para)}</select></label>
      </div>
      <label>Como<select id="rModo"><option value="pe" ${r.modo !== "carro" ? "selected" : ""}>a pé</option><option value="carro" ${r.modo === "carro" ? "selected" : ""}>de carro</option></select></label>
      <label>Nome <span class="opt">(opcional)</span><input id="rNome" value="${esc(r.nome)}" placeholder="Ex.: Escola → casa"></label>
      <label>Caminho principal<textarea id="rPrin" rows="4" placeholder="Ex.: sair pelo portão da rua A, seguir a avenida até a padaria, virar à direita…">${esc(r.principal)}</textarea></label>
      <label>Caminho alternativo <span class="opt">(se o principal estiver alagado ou fechado)</span><textarea id="rAlt" rows="4">${esc(r.alternativa)}</textarea></label>
      <label>Pontos de atenção <span class="opt">(opcional)</span><input id="rObs" value="${esc(r.obs)}" placeholder="Ex.: a baixada da rua C alaga com chuva forte"></label>
      <button class="btn" type="submit">Salvar</button>
    </form>
    ${link ? `<a class="btn ghost" href="${link}" target="_blank" rel="noopener">Ver no Google Maps</a><p class="sub">O Google Maps precisa de internet, ou da área da cidade baixada nele (Maps › foto do perfil › Mapas off-line).</p>` : ""}
    ${id ? `<div id="delLugarArea"><button class="btn ghost danger" id="delRota" type="button">Excluir rota</button></div>` : ""}
  </section>`;
}

// cartão do Hub: os lugares que mais importam numa emergência
function cardZonasHub() {
  const c = casaZ();
  const chave = ["encontro1", "encontro2", "upa", "hospital", "abrigo"];
  const ls = state.zonas.lugares.filter(l => chave.includes(l.tipo)).sort((a, b) => chave.indexOf(a.tipo) - chave.indexOf(b.tipo)).slice(0, 4);
  return `<div class="card flush">
    <div class="head"><h2><span class="mod">03</span> · Zonas</h2><a class="btn small ghost" href="#zonas">Radar</a></div>
    ${ls.length ? `<ul class="rows">${ls.map(l => `<li><a href="#lugar/${l.id}"><span class="num g-${grupoDe(l)}">${esc(TIPOS_LUGAR[l.tipo].nome.split(" ")[0][0])}</span>
      <span class="grow"><span class="nm">${esc(l.nome)}</span><span class="sub">${esc(TIPOS_LUGAR[l.tipo].nome)}</span></span><span class="right sub">${esc(deCasa(l).replace(" de casa", ""))}</span></a></li>`).join("")}</ul>`
      : `<p class="empty">${c ? "Cadastre o ponto de encontro e o hospital ou UPA mais perto." : "Cadastre a casa, o ponto de encontro e o hospital ou UPA mais perto."}</p>`}
  </div>`;
}

// parte da versão para imprimir
function impressoZonas() {
  const z = state.zonas;
  if (!z.lugares.length) return "";
  return `<h2>Zonas · lugares</h2>
    ${casaZ() && lugaresNumerados().some(({ l }) => temPos(l)) ? `<div class="radar-print">${radarHtml({ print: true })}</div>` : ""}
    <table><thead><tr><th>Nº</th><th>Lugar</th><th>Tipo</th><th>Endereço e telefone</th><th>De casa</th><th>Coordenadas</th></tr></thead>
    <tbody>${[...(casaZ() ? [{ l: casaZ(), n: "⌂" }] : []), ...lugaresNumerados()].map(({ l, n }) => `<tr><td>${n}</td><td>${esc(l.nome)}</td><td>${esc(TIPOS_LUGAR[l.tipo]?.nome || "")}</td>
      <td>${[l.endereco, l.tel].filter(Boolean).map(esc).join(" · ") || "—"}${l.obs ? `<br>${esc(l.obs)}` : ""}</td><td>${esc(deCasa(l)) || "—"}</td><td>${temPos(l) ? fmtCoord(l) : "—"}</td></tr>`).join("")}</tbody></table>
    ${z.rotas.length ? `<h2>Rotas</h2>${z.rotas.map(r => `<p><b>${esc(r.nome || `${lugar(r.de)?.nome} → ${lugar(r.para)?.nome}`)}</b> (${r.modo === "carro" ? "de carro" : "a pé"})<br>
      Principal: ${esc(r.principal) || "—"}<br>Alternativo: ${esc(r.alternativa) || "—"}${r.obs ? `<br>Atenção: ${esc(r.obs)}` : ""}</p>`).join("")}` : ""}`;
}

// ---------- ações ----------

function mostrarPos(lat, lon, origem) {
  document.getElementById("lLat").value = +lat.toFixed(6);
  document.getElementById("lLon").value = +lon.toFixed(6);
  const c = casaZ(), id = document.getElementById("fLugar").dataset.id;
  const p = { lat, lon };
  const longe = temPos(c) && c.id !== id ? ` · ${fmtDist(distancia(c, p))} ${fmtRumo(rumo(c, p))} de casa` : "";
  document.getElementById("lPosInfo").textContent = `${origem}: ${lat.toFixed(5)}, ${lon.toFixed(5)}${longe}. Toque em Salvar.`;
}

document.addEventListener("click", e => {
  const t = e.target.closest("button");
  if (!t) return;
  if (t.id === "bGps") {
    if (gps.ligado) { desligarGps(); gps.pos = null; } else ligarGps();
    render();
  }
  if (t.id === "bMinhaPos") {
    const info = document.getElementById("lPosInfo");
    if (!navigator.geolocation) { info.textContent = "Este aparelho não tem localização."; return; }
    info.textContent = "Procurando o GPS… pode levar alguns segundos.";
    t.disabled = true;
    navigator.geolocation.getCurrentPosition(p => {
      t.disabled = false;
      mostrarPos(p.coords.latitude, p.coords.longitude, `GPS (precisão de ${Math.round(p.coords.accuracy)} m)`);
    }, err => { t.disabled = false; info.textContent = erroGps(err); }, { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 });
  }
  if (t.id === "delLugar" || t.id === "delRota") {
    document.getElementById("delLugarArea").innerHTML = `<div class="confirm"><span>${t.id === "delLugar" ? "Excluir o lugar e as rotas que passam por ele?" : "Excluir a rota?"}</span>
      <button class="btn small danger" id="${t.id}Sim" type="button">Excluir</button><button class="btn small ghost" id="delNo" type="button">Cancelar</button></div>`;
  }
  if (t.id === "delLugarSim") {
    const id = location.hash.split("/")[1];
    state.zonas.lugares = state.zonas.lugares.filter(l => l.id !== id);
    state.excluidos.lugares.push(id);
    state.zonas.rotas.filter(r => r.de === id || r.para === id).forEach(r => state.excluidos.rotas.push(r.id));
    state.zonas.rotas = state.zonas.rotas.filter(r => r.de !== id && r.para !== id);
    save(); toast("Lugar excluído"); location.hash = "#zonas";
  }
  if (t.id === "delRotaSim") {
    const id = location.hash.split("/")[1];
    state.zonas.rotas = state.zonas.rotas.filter(r => r.id !== id);
    state.excluidos.rotas.push(id);
    save(); toast("Rota excluída"); location.hash = "#zonas";
  }
});

document.addEventListener("input", e => {
  if (e.target.id !== "lColar") return;
  const v = e.target.value.trim();
  if (!v) return;
  const p = lerCoordenadas(v);
  if (p) mostrarPos(p.lat, p.lon, "Do Maps");
  else document.getElementById("lPosInfo").textContent = /goo\.gl|maps\.app/.test(v)
    ? "Link curto não traz as coordenadas. No Maps, toque e segure no lugar e copie os números."
    : "Não achei coordenadas aqui. Cole os números (ex.: -15.79390, -47.88280) ou o link longo do Maps.";
});

document.addEventListener("change", e => {
  if (e.target.id !== "lTipo") return;
  const nome = document.getElementById("lNome");
  if (nome.value) return;
  const f = state.familia;
  nome.value = { casa: "Casa", encontro1: f.encontro.principal, encontro2: f.encontro.secundario }[e.target.value] || "";
  if (e.target.value === "casa" && !document.getElementById("lEnd").value) document.getElementById("lEnd").value = f.endereco;
});

document.addEventListener("submit", e => {
  const f = e.target;
  if (f.id === "fLugar") {
    e.preventDefault();
    const v = id => document.getElementById(id).value.trim();
    const lat = parseFloat(v("lLat").replace(",", ".")), lon = parseFloat(v("lLon").replace(",", "."));
    const comPos = Number.isFinite(lat) && Number.isFinite(lon);
    if (comPos && (Math.abs(lat) > 90 || Math.abs(lon) > 180)) return toast("Coordenadas fora do mapa. Confira os números.");
    if ((v("lLat") || v("lLon")) && !comPos) return toast("Preencha latitude e longitude, ou deixe as duas em branco.");
    const dados = { nome: v("lNome"), tipo: v("lTipo"), endereco: v("lEnd"), tel: v("lTel"), obs: v("lObs"), lat: comPos ? lat : null, lon: comPos ? lon : null };
    if (!dados.nome) return toast("Dê um nome ao lugar.");
    if (dados.tipo === "casa" && casaZ() && casaZ().id !== f.dataset.id) return toast("A casa já está cadastrada.");
    if (f.dataset.id) Object.assign(lugar(f.dataset.id), dados);
    else state.zonas.lugares.push({ id: uid(), ...dados });
    // a Família usa o mesmo endereço e os mesmos pontos de encontro
    const fam = state.familia;
    if (dados.tipo === "casa" && dados.endereco && !fam.endereco) fam.endereco = dados.endereco;
    if (dados.tipo === "encontro1" && !fam.encontro.principal) fam.encontro.principal = dados.nome;
    if (dados.tipo === "encontro2" && !fam.encontro.secundario) fam.encontro.secundario = dados.nome;
    save(); toast(comPos ? "Lugar salvo" : "Lugar salvo, sem posição: ele não aparece no radar");
    location.hash = "#zonas";
  }
  if (f.id === "fRota") {
    e.preventDefault();
    const v = id => document.getElementById(id).value.trim();
    const dados = { de: v("rDe"), para: v("rPara"), modo: v("rModo"), nome: v("rNome"), principal: v("rPrin"), alternativa: v("rAlt"), obs: v("rObs") };
    if (dados.de === dados.para) return toast("Escolha lugares diferentes em De e Para.");
    if (!dados.principal) return toast("Descreva o caminho principal.");
    if (f.dataset.id) Object.assign(rotaZ(f.dataset.id), dados);
    else state.zonas.rotas.push({ id: uid(), ...dados });
    save(); toast("Rota salva"); location.hash = "#zonas";
  }
});
