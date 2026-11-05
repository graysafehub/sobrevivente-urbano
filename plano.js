// Plano de comunicação: o que cada um faz se a família estiver separada quando a crise começar.
// O plano é da família (vai para os outros celulares pela junção); quem usa cada celular
// (state.config.dono) é deste aparelho e personaliza o Hub, a Família e o cartão de bolso.

const MENSAGENS_PADRAO = [
  "OK = estou bem e em lugar seguro",
  "CASA = cheguei em casa",
  "P1 = indo para o ponto principal (ou já estou lá)",
  "P2 = indo para o ponto secundário",
  "FICO = estou seguro aqui e vou esperar passar",
  "AJUDA = preciso de ajuda, me ligue",
].join("\n");

const planoPadrao = () => ({ esperaMin: 60, horario: "de hora em hora, nos 5 primeiros minutos", radio: "", mensagens: MENSAGENS_PADRAO, obs: "", pessoas: {} });
const plano = () => state.familia.plano;
const dono = () => pessoa(state.config.dono);
const ehCrianca = p => { const n = idade(p?.nascimento); return n !== null && n < 12; };

// "OK = estou bem" → { cod: "OK", txt: "estou bem" }
function mensagensPlano() {
  return String(plano().mensagens || "").split("\n").map(l => l.trim()).filter(Boolean).map(l => {
    const i = l.indexOf("=");
    return i > 0 ? { cod: l.slice(0, i).trim(), txt: l.slice(i + 1).trim() } : { cod: l, txt: "" };
  });
}

// passos para uma pessoa (ou gerais, sem pessoa)
function passosPlano(p) {
  const f = state.familia, pl = plano();
  const meu = (p && pl.pessoas[p.id]) || {};
  const ondeEsta = meu.lugar && lugar(meu.lugar);
  const rota = meu.rota && rotaZ(meu.rota);
  const busca = meu.buscaPor && pessoa(meu.buscaPor);
  const fora = f.contatos.find(c => c.fora);
  const enc1 = f.encontro.principal, enc2 = f.encontro.secundario;
  const passos = [];
  if (p && ehCrianca(p) && busca) {
    passos.push(`${ondeEsta ? `Se estiver em ${ondeEsta.nome}, fique lá` : "Se estiver na escola, fique lá"}: quem vai buscar é ${busca.nome}. Só saia com ${busca.nome} ou com quem a escola autorizar.`);
  } else {
    passos.push(`Se for seguro sair, volte para casa${ondeEsta ? ` saindo de ${ondeEsta.nome}` : ""}${rota ? ` pela rota "${rota.nome || `${lugar(rota.de)?.nome} → ${lugar(rota.para)?.nome}`}"` : ""}${rota?.alternativa ? "; se ela estiver bloqueada, pelo caminho alternativo" : ""}.`);
    passos.push(enc1
      ? `Se não der para chegar em casa, vá para o ponto principal: ${enc1}.${enc2 ? ` Se ele estiver bloqueado, para o secundário: ${enc2}.` : ""}`
      : "Se não der para chegar em casa, vá para o ponto de encontro (cadastre os pontos em Família).");
    passos.push(`Quem chegar a um ponto espera ${pl.esperaMin} minutos. Se ninguém vier, segue para o próximo; no último, fica em lugar seguro.`);
  }
  passos.push("Se for perigoso sair (enchente, temporal, tiroteio), fique onde está, em lugar seguro, e mande FICO.");
  passos.push("Para dar notícia, mande SMS curto para todos, com as mensagens combinadas. Ligue só se o SMS não passar.");
  if (fora) passos.push(`Se a rede daqui estiver cheia, avise ${fora.nome}, no ${fora.tel}: mora fora da cidade e repassa para a família.`);
  passos.push(`Tente contato ${pl.horario}. Fora disso, deixe o celular economizando bateria.`);
  if (pl.radio) passos.push(`Rádio: ${pl.radio}.`);
  if (meu.obs) passos.push(meu.obs);
  return passos;
}

// ---------- quem usa este celular ----------

function perguntaDonoHtml() {
  const ps = state.familia.pessoas;
  if (!ps.length) return "";
  return `<form class="card form alerta-card" id="fDono">
    <h2>Quem usa este celular?</h2>
    <p class="sub">O app mostra o plano e o cartão de bolso dessa pessoa. Vale só para este aparelho.</p>
    <label>Este celular é de<select id="dPessoa">${ps.map(p => `<option value="${p.id}" ${p.id === state.config.dono ? "selected" : ""}>${esc(p.nome)}</option>`).join("")}</select></label>
    <button class="btn" type="submit">Confirmar</button>
  </form>`;
}

// cartão do Hub: o plano de quem usa o celular
function cardPlanoHub() {
  if (!state.familia.pessoas.length) return "";
  if (!dono()) return `<a class="alert amarelo" href="#familia">[ CELULAR ] Diga quem usa este celular, para o app mostrar o plano dessa pessoa.</a>`;
  return `<div class="card">
    <div class="head"><h2>Se a família se separar · ${esc(dono().nome)}</h2><a class="btn small ghost" href="#plano">Plano</a></div>
    <ul class="passos">${passosPlano(dono()).slice(0, 3).map(t => `<li>${esc(t)}</li>`).join("")}</ul>
  </div>`;
}

// cartão da Família
function cardPlanoFamilia() {
  const d = dono();
  return `<div class="card">
    <div class="head"><h2><span class="mod">05</span> · Plano de comunicação</h2><a class="btn small" href="#plano">Editar</a></div>
    ${d ? `<p class="sub">Este celular é de <b>${esc(d.nome)}</b> · <a href="#" id="trocarDono">trocar</a></p>
      <ul class="passos">${passosPlano(d).map(t => `<li>${esc(t)}</li>`).join("")}</ul>`
      : `<ul class="passos">${passosPlano(null).map(t => `<li>${esc(t)}</li>`).join("")}</ul>`}
    <p class="sub">Mensagens: ${mensagensPlano().map(m => `<b>${esc(m.cod)}</b>${m.txt ? ` ${esc(m.txt)}` : ""}`).join(" · ")}</p>
  </div>`;
}

function viewPlano() {
  const f = state.familia, pl = plano();
  const lugaresOpt = sel => `<option value="">—</option>` + state.zonas.lugares.filter(l => l.tipo !== "casa").map(l => `<option value="${l.id}" ${l.id === sel ? "selected" : ""}>${esc(l.nome)}</option>`).join("");
  const rotasOpt = sel => `<option value="">—</option>` + state.zonas.rotas.map(r => `<option value="${r.id}" ${r.id === sel ? "selected" : ""}>${esc(r.nome || `${lugar(r.de)?.nome} → ${lugar(r.para)?.nome}`)}</option>`).join("");
  const adultos = f.pessoas.filter(p => !ehCrianca(p));
  return `
  <section class="stack">
    <a class="back" href="#familia">‹ Família</a>
    <h1>Plano de comunicação</h1>
    <p class="sub">O que cada um faz se a crise pegar a família separada. Vai para os outros celulares pela junção e sai no cartão de bolso e no papel.</p>
    <form id="fPlano" class="card form">
      <h2>Para todos</h2>
      <div class="row2">
        <label>Espera em cada ponto (min)<input id="plEspera" type="number" inputmode="numeric" min="5" step="5" value="${pl.esperaMin}"></label>
        <label>Rádio <span class="opt">(opcional)</span><input id="plRadio" value="${esc(pl.radio)}" placeholder="Ex.: canal 7"></label>
      </div>
      <label>Quando tentar contato<input id="plHorario" value="${esc(pl.horario)}"></label>
      <label>Mensagens combinadas <span class="opt">(uma por linha: CÓDIGO = significado)</span><textarea id="plMsgs" rows="6">${esc(pl.mensagens)}</textarea></label>
      ${f.pessoas.length ? `<h2>Cada pessoa</h2>
        ${f.pessoas.map(p => { const m = pl.pessoas[p.id] || {}; return `<fieldset data-pessoa="${p.id}"><legend>${esc(p.nome)}${ehCrianca(p) ? " · criança" : ""}</legend>
          <div class="row2">
            <label>Onde costuma estar<select data-campo="lugar">${lugaresOpt(m.lugar)}</select></label>
            ${ehCrianca(p) ? `<label>Quem busca<select data-campo="buscaPor"><option value="">—</option>${adultos.map(a => `<option value="${a.id}" ${a.id === m.buscaPor ? "selected" : ""}>${esc(a.nome)}</option>`).join("")}</select></label>`
              : `<label>Rota de volta<select data-campo="rota">${rotasOpt(m.rota)}</select></label>`}
          </div>
          <label>Combinado só desta pessoa <span class="opt">(opcional)</span><input data-campo="obs" value="${esc(m.obs || "")}" placeholder="Ex.: se estiver no ônibus, desce no terminal e vai a pé"></label>
        </fieldset>`; }).join("")}` : `<p class="empty">Cadastre as fichas em Família para combinar o plano de cada um.</p>`}
      ${state.zonas.lugares.length ? "" : `<p class="sub">Para escolher escola, trabalho e rotas, cadastre os lugares em <a href="#zonas">Zonas</a>.</p>`}
      <button class="btn" type="submit">Salvar plano</button>
    </form>
  </section>`;
}

// verso do cartão de bolso
function versoCartao(p) {
  const f = state.familia, pl = plano();
  const meu = (p && pl.pessoas[p.id]) || {};
  const busca = meu.buscaPor && pessoa(meu.buscaPor);
  const fora = f.contatos.find(c => c.fora);
  const linhas = p && ehCrianca(p) && busca
    ? [`Na escola, fique lá: quem busca é ${busca.nome}.`]
    : [`Volte para casa. Se não der: ${f.encontro.principal || "ponto de encontro"}${f.encontro.secundario ? `, depois ${f.encontro.secundario}` : ""}.`, `Espere ${pl.esperaMin} min em cada ponto.`];
  return `<div class="cartao verso">
    <b class="ct-t">Se a família se separar</b>
    ${linhas.map(l => `<span>${esc(l)}</span>`).join("")}
    <span>Perigoso sair? Fique em lugar seguro.</span>
    <span class="ct-h">SMS combinado:</span>
    <span>${mensagensPlano().map(m => esc(m.cod)).join(" · ")}</span>
    ${fora ? `<span class="ct-h">Rede cheia? Avise:</span><span>${esc(fora.nome)}: <b>${esc(fora.tel)}</b></span>` : ""}
    <span class="ct-f">Contato: ${esc(pl.horario)}${pl.radio ? ` · rádio ${esc(pl.radio)}` : ""}</span>
  </div>`;
}

function impressoPlano() {
  const f = state.familia;
  return `<h2>Plano de comunicação</h2>
    <ol>${passosPlano(null).map(t => `<li>${esc(t)}</li>`).join("")}</ol>
    ${f.pessoas.filter(p => plano().pessoas[p.id]).map(p => `<p><b>${esc(p.nome)}:</b> ${esc(passosPlano(p)[0])}</p>`).join("")}
    <p>Mensagens: ${mensagensPlano().map(m => `<b>${esc(m.cod)}</b> ${esc(m.txt)}`).join(" · ")}</p>`;
}

// ---------- ações ----------

document.addEventListener("submit", e => {
  const f = e.target;
  if (f.id === "fDono") {
    e.preventDefault();
    state.config.dono = document.getElementById("dPessoa").value;
    state.config.perguntarDono = false;
    save(); toast(`Este celular é de ${dono()?.nome}`); render();
  }
  if (f.id === "fPlano") {
    e.preventDefault();
    const pl = plano();
    pl.esperaMin = Math.max(5, Math.round(num("plEspera")) || 60);
    pl.radio = document.getElementById("plRadio").value.trim();
    pl.horario = document.getElementById("plHorario").value.trim() || planoPadrao().horario;
    pl.mensagens = document.getElementById("plMsgs").value.trim() || MENSAGENS_PADRAO;
    for (const fs of f.querySelectorAll("fieldset[data-pessoa]")) {
      const dados = {};
      for (const c of fs.querySelectorAll("[data-campo]")) if (c.value.trim()) dados[c.dataset.campo] = c.value.trim();
      pl.pessoas[fs.dataset.pessoa] = dados;
    }
    save(); toast("Plano salvo"); location.hash = "#familia";
  }
});

document.addEventListener("click", e => {
  if (e.target.id !== "trocarDono") return;
  e.preventDefault();
  state.config.dono = null; state.config.perguntarDono = true;
  save(); render();
});
