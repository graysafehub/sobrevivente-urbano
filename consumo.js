// Consumo medido (fase 5): quanto a casa gasta de verdade, pelas saídas de consumo registradas.
// Doação, perda e descarte não contam. Janela: dos últimos 90 dias, a partir do primeiro registro do item.
// Só vale com pelo menos 14 dias de registro e 2 saídas de consumo; antes disso, fica a base estimada.

const JANELA_DIAS = 90;
const MIN_DIAS = 14;
const MIN_SAIDAS = 2;

function consumoMedido(it) {
  const movs = state.movs.filter(m => m.itemId === it.id);
  const primeira = movs.reduce((min, m) => (!min || m.data < min ? m.data : min), null);
  if (!primeira) return { ok: false, dias: 0, saidas: 0, total: 0, porDia: null };
  const dias = Math.min(-diasAte(primeira), JANELA_DIAS);
  const inicio = hoje(); inicio.setDate(inicio.getDate() - dias);
  const desde = `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, "0")}-${String(inicio.getDate()).padStart(2, "0")}`;
  const saidas = movs.filter(m => m.tipo === "consumo" && m.data >= desde);
  const total = saidas.reduce((s, m) => s + m.qtd, 0);
  const ok = dias >= MIN_DIAS && saidas.length >= MIN_SAIDAS && total > 0;
  return { ok, dias, saidas: saidas.length, total, porDia: dias > 0 ? total / dias : null };
}

// o item usa o medido quando o usuário escolheu e já há medição válida
function usaMedido(it) {
  return !!it.usarMedido && porDia(it) && consumoMedido(it).ok;
}

const fmtDia = (v, un) => fmtQtd(Math.round(v * 1000) / 1000, un);
function comparacao(medido, base) {
  if (!base) return "";
  const dif = Math.round((medido / base - 1) * 100);
  if (Math.abs(dif) < 5) return "igual à base";
  return `${Math.abs(dif)}% ${dif > 0 ? "acima" : "abaixo"} da base`;
}

// "5 pessoas", "2 adultos", "1 bebê"
function quem(it) {
  const n = multiplicador(it);
  const [um, varios] = it.escala.startsWith("bebe") ? ["bebê", "bebês"] : it.escala.startsWith("adulto") ? ["adulto", "adultos"] : ["pessoa", "pessoas"];
  return `${n} ${n === 1 ? um : varios}`;
}

function consumoItemHtml(it) {
  const m = consumoMedido(it);
  if (!porDia(it) && !m.saidas) return "";
  const base = porDia(it) ? (it.qtd || 0) * multiplicador(it) : null;
  const dura = m.ok && m.porDia > 0 ? Math.floor(qtdValida(it.id) / m.porDia) : null;
  if (!m.ok) {
    return `<div class="card"><h2>Consumo medido</h2>
      <p class="sub">Para o app medir quanto a casa gasta, registre cada uso em Saída › consumo. Precisa de ${MIN_DIAS} dias de registro e ${MIN_SAIDAS} saídas de consumo; até agora: ${m.dias} ${m.dias === 1 ? "dia" : "dias"}, ${m.saidas} ${m.saidas === 1 ? "saída" : "saídas"}.</p>
    </div>`;
  }
  return `<div class="card">
    <div class="head"><h2>Consumo medido</h2>${usaMedido(it) ? `<span class="badge verde">em uso nas metas</span>` : ""}</div>
    <p><b>${fmtDia(m.porDia, it.unidade)} por dia</b> <span class="sub">· ${fmtQtd(Math.round(m.total * 1000) / 1000, it.unidade)} em ${m.saidas} saídas, nos últimos ${m.dias} dias</span></p>
    ${base !== null ? `<p class="sub">Base estimada: ${fmtDia(base, it.unidade)} por dia para ${quem(it)} · o medido está ${comparacao(m.porDia, base)}.</p>` : ""}
    ${dura !== null ? `<p class="sub">No ritmo medido, o que há em casa dura ${dura} ${dura === 1 ? "dia" : "dias"}.</p>` : ""}
    ${porDia(it) ? `<button class="btn small ${it.usarMedido ? "ghost" : ""}" id="bMedido" data-id="${it.id}" type="button">${it.usarMedido ? "Voltar à base estimada" : "Usar o consumo medido nas metas"}</button>
      <p class="sub">${it.usarMedido ? "As metas e a autonomia usam o consumo medido × dias da meta." : "Hoje as metas usam a base. Só conta o que foi registrado: se parte do uso não entrou como saída, o medido fica baixo." + (base && m.porDia < base * 0.8 ? " Numa crise, com todas as refeições feitas em casa, o gasto pode subir: com o medido bem abaixo da base, prefira manter a base." : "")}</p>` : ""}
  </div>`;
}

function viewConsumo() {
  const linhas = state.items.map(it => ({ it, m: consumoMedido(it) })).filter(x => x.m.saidas);
  const medidos = linhas.filter(x => x.m.ok);
  const medindo = linhas.filter(x => !x.m.ok);
  return `
  <section class="stack">
    <a class="back" href="#painel">‹ Hub</a>
    <h1>Consumo medido</h1>
    <p class="sub">Calculado pelas saídas de consumo dos últimos ${JANELA_DIAS} dias. Doação, perda e descarte não contam. Cada item precisa de ${MIN_DIAS} dias de registro e ${MIN_SAIDAS} saídas.</p>
    <div class="card flush">
      <h2><span class="mod">01</span> · Medidos</h2>
      ${medidos.length ? `<ul class="rows">${medidos.map(({ it, m }) => {
        const base = porDia(it) ? (it.qtd || 0) * multiplicador(it) : null;
        const dura = m.porDia > 0 ? Math.floor(qtdValida(it.id) / m.porDia) : null;
        return `<li><a href="#item/${it.id}"><span class="grow"><span class="nm">${esc(it.nome)}</span>
          <span class="sub">${base !== null ? `base ${fmtDia(base, it.unidade)}/dia · ${comparacao(m.porDia, base)}` : "sem base diária"}${dura !== null ? ` · dura ${dura} d` : ""}${usaMedido(it) ? " · em uso" : ""}</span></span>
          <span class="qty">${fmtDia(m.porDia, it.unidade)}<span class="sub">/dia</span></span></a></li>`;
      }).join("")}</ul>` : `<p class="empty">Nenhum item medido ainda. Registre o uso em Saída › consumo.</p>`}
    </div>
    ${medindo.length ? `<div class="card flush"><h2><span class="mod">02</span> · Medindo</h2><ul class="rows">${medindo.map(({ it, m }) =>
      `<li><a href="#item/${it.id}"><span class="grow nm">${esc(it.nome)}</span><span class="right sub">${m.dias} d · ${m.saidas} ${m.saidas === 1 ? "saída" : "saídas"}</span></a></li>`).join("")}</ul></div>` : ""}
  </section>`;
}

document.addEventListener("click", e => {
  const b = e.target.closest("#bMedido");
  if (!b) return;
  const it = item(b.dataset.id);
  if (!it) return;
  it.usarMedido = !it.usarMedido;
  save(); toast(it.usarMedido ? "Metas pelo consumo medido" : "Metas pela base estimada");
  render();
});
