// Manutenção periódica: o que precisa ser feito de tempos em tempos para a reserva funcionar na hora.
// state.manutencao guarda, por tarefa, a data em que foi feita pela última vez.
// Prazo: de onde ele vem fica em "porque" (guia do item ou sugestão do app, quando não há fonte).

window.TAREFAS = [
  { id: "agua", titulo: "Trocar a água guardada que você mesmo encheu", cadaDias: 180, porque: "O guia da água: trocar a cada 6 meses (Ready.gov).", item: "Água potável (garrafas)" },
  { id: "powerbank", titulo: "Conferir os power banks e completar até a metade", cadaDias: 90, porque: "O guia do power bank: guardar entre 40% e 60% e conferir a cada 3 meses.", item: "Power bank" },
  { id: "luz", titulo: "Testar lanternas, rádio e pilhas", cadaDias: 180, porque: "Sugestão do app: pilha vaza e equipamento parado falha sem aviso." },
  { id: "mochila", titulo: "Revisar a mochila: validades, remédios e roupas que ainda servem nas crianças", cadaDias: 180, porque: "Sugestão do app: criança cresce e remédio vence.", rota: "familia" },
  { id: "documentos", titulo: "Revisar cópias dos documentos, receitas e cartão de bolso", cadaDias: 365, porque: "O guia das cópias: revisar uma vez por ano e sempre que algo mudar.", item: "Cópias dos documentos" },
  { id: "simulado", titulo: "Simulado do plano: cada um manda o SMS combinado e diz para onde iria", cadaDias: 180, porque: "Sugestão do app: plano que nunca foi testado costuma falhar na primeira vez.", rota: "plano" },
];

const feitoEm = t => state.manutencao[t.id] || null;
// dias até vencer (negativo = atrasada); nunca feita = vence hoje
function prazoTarefa(t) {
  const f = feitoEm(t);
  return f ? t.cadaDias + diasAte(f) : 0;
}
const tarefasPendentes = () => TAREFAS.filter(t => prazoTarefa(t) <= 0);

function fmtPrazo(t) {
  const f = feitoEm(t), p = prazoTarefa(t);
  if (!f) return "nunca feita";
  if (p < 0) return `atrasada ${-p} ${-p === 1 ? "dia" : "dias"} · feita em ${fmtData(f)}`;
  if (p === 0) return `vence hoje · feita em ${fmtData(f)}`;
  return `próxima em ${p} ${p === 1 ? "dia" : "dias"} · feita em ${fmtData(f)}`;
}

function linkTarefa(t) {
  if (t.rota) return `#${t.rota}`;
  const it = t.item && itemPorNome(t.item);
  return it ? `#item/${it.id}` : null;
}

function linhaTarefa(t) {
  const p = prazoTarefa(t), link = linkTarefa(t);
  return `<li><div class="lote">
    <span class="grow"><span class="nm">${link ? `<a class="plain" href="${link}">${esc(t.titulo)}</a>` : esc(t.titulo)}</span>
      <span class="sub ${p <= 0 ? "alerta-txt" : ""}">${esc(fmtPrazo(t))}</span></span>
    <button class="btn small ${p <= 0 ? "" : "ghost"}" data-feito="${t.id}" type="button">Feito</button>
  </div></li>`;
}

// cartão do Hub: só aparece com tarefa pendente
function cardManutencaoHub() {
  const pend = tarefasPendentes();
  if (!pend.length) return "";
  return `<div class="card flush">
    <div class="head"><h2>Manutenção · ${pend.length} ${pend.length === 1 ? "pendente" : "pendentes"}</h2><a class="btn small ghost" href="#manutencao">Tudo</a></div>
    <ul class="rows">${pend.slice(0, 3).map(linhaTarefa).join("")}</ul>
  </div>`;
}

function viewManutencao() {
  const ordem = [...TAREFAS].sort((a, b) => prazoTarefa(a) - prazoTarefa(b));
  return `
  <section class="stack">
    <a class="back" href="#painel">‹ Hub</a>
    <h1>Manutenção</h1>
    <p class="sub">Reserva parada e esquecida é o que mais falha na hora. Toque em Feito quando fizer; a tarefa volta no prazo.</p>
    <div class="card flush"><ul class="rows">${ordem.map(linhaTarefa).join("")}</ul></div>
    <div class="card"><h2>De onde vêm os prazos</h2>
      <ul class="plain">${TAREFAS.map(t => `<li><b>${esc(t.titulo)}:</b> ${esc(t.porque)}</li>`).join("")}</ul></div>
  </section>`;
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-feito]");
  if (!b) return;
  state.manutencao[b.dataset.feito] = isoHoje();
  save(); toast("Marcado como feito hoje"); render();
});
