// Dois celulares (fase 5): sincronização por arquivo, sem servidor.
// Um celular gera o arquivo, o outro junta. Nada é apagado na junção, a não ser o que o outro
// celular excluiu de propósito (state.excluidos). Cada lote é refeito pelas saídas dos dois:
// quantidade inicial − soma das baixas de todas as saídas, então saídas feitas nos dois não se perdem.
// Em conflito de configuração (meta, nome, ficha editada nos dois), fica a deste celular.

// cópia de antes da última junção (KEY vem de app.js, que carrega depois deste arquivo)
const keyAntes = () => KEY + "-antes-juntar";
const normTxt = t => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const soDigitos = t => String(t || "").replace(/\D/g, "");

function carimbo() {
  const d = new Date();
  return `${isoHoje()}-${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
}

// envia pelo menu de compartilhar do Android (WhatsApp, Drive…); sem ele, baixa o arquivo
async function compartilharArquivo(nome, texto, titulo) {
  const arq = new File([texto], nome, { type: "application/json" });
  if (navigator.canShare?.({ files: [arq] })) {
    try { await navigator.share({ files: [arq], title: titulo }); return "compartilhado"; }
    catch (e) { if (e.name === "AbortError") return "cancelado"; }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(arq);
  a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  return "baixado";
}

// ---------- junção ----------

function juntarEstado(local, outro) {
  const r = { itens: 0, lotes: 0, movs: 0, pessoas: 0, contatos: 0, lugares: 0, rotas: 0, codigos: 0, excluidos: 0 };
  const ex = local.excluidos;
  const exO = outro.excluidos || novosExcluidos();

  // exclusões dos dois valem para os dois
  for (const [id, para] of Object.entries(exO.items)) if (!(id in ex.items) || (para && !ex.items[id])) ex.items[id] = para;
  for (const k of ["pessoas", "contatos", "mochila", "lugares", "rotas"]) ex[k] = [...new Set([...ex[k], ...(exO[k] || [])])];

  // item: id do outro celular → id daqui (o mesmo item pode ter ids diferentes nos dois)
  const mapa = {};
  const destino = id => {
    for (let i = 0, cur = id; i < 20; i++) {
      if (cur in mapa && mapa[cur] !== cur) { cur = mapa[cur]; continue; }
      if (cur in ex.items) { if (!ex.items[cur]) return null; cur = ex.items[cur]; continue; }
      return local.items.some(i => i.id === cur) ? cur : null;
    }
    return null;
  };

  // o que o outro excluiu e ainda existe aqui
  for (const it of [...local.items]) {
    if (!(it.id in ex.items)) continue;
    const para = ex.items[it.id] && local.items.find(i => i.id === destino(it.id));
    if (para) juntarItens(local, it.id, para.id);
    else {
      local.items = local.items.filter(i => i.id !== it.id);
      local.lotes = local.lotes.filter(l => l.itemId !== it.id);
      local.movs = local.movs.filter(m => m.itemId !== it.id);
      local.familia.mochila.forEach(m => { if (m.itemId === it.id) m.itemId = null; });
      for (const [cod, c] of Object.entries(local.codigos)) if (c.itemId === it.id) delete local.codigos[cod];
    }
    r.excluidos++;
  }

  for (const o of outro.items || []) {
    if (o.id in ex.items) continue;
    const aqui = local.items.find(i => i.id === o.id)
      || (o.base && local.items.find(i => i.base === o.base))
      || local.items.find(i => normTxt(i.nome) === normTxt(o.nome));
    if (aqui) {
      mapa[o.id] = aqui.id;
      for (const [k, v] of Object.entries(o)) if (aqui[k] === undefined || aqui[k] === null || aqui[k] === "") aqui[k] = v;
    } else {
      local.items.push({ ...o });
      mapa[o.id] = o.id;
      r.itens++;
    }
  }

  // lotes e movimentações: tudo que só existe no outro entra
  const lotesAqui = new Set(local.lotes.map(l => l.id));
  for (const l of outro.lotes || []) {
    const itemId = destino(l.itemId);
    if (!itemId || lotesAqui.has(l.id)) continue;
    local.lotes.push({ ...l, itemId, qtdInicial: l.qtdInicial ?? l.qtd });
    lotesAqui.add(l.id);
    r.lotes++;
  }
  const movsAqui = new Set(local.movs.map(m => m.id));
  for (const m of outro.movs || []) {
    const itemId = destino(m.itemId);
    if (!itemId || movsAqui.has(m.id)) continue;
    local.movs.push({ ...m, itemId });
    movsAqui.add(m.id);
    r.movs++;
  }
  local.movs.sort((a, b) => (a.data + (a.hora || "")).localeCompare(b.data + (b.hora || "")));
  // cada lote = quantidade inicial − tudo que saiu dele, nos dois celulares
  const baixas = {};
  for (const m of local.movs) for (const b of m.baixas || []) baixas[b.lote] = (baixas[b.lote] || 0) + b.qtd;
  for (const l of local.lotes) {
    if (l.qtdInicial == null) continue;
    l.qtd = Math.round((l.qtdInicial - (baixas[l.id] || 0)) * 1000) / 1000;
  }
  local.lotes = local.lotes.filter(l => l.qtd > 0);

  for (const [cod, c] of Object.entries(outro.codigos || {})) {
    const itemId = destino(c.itemId);
    if (itemId && !local.codigos[cod]) { local.codigos[cod] = { ...c, itemId }; r.codigos++; }
  }

  // família
  const f = local.familia, fo = outro.familia || {};
  f.pessoas = f.pessoas.filter(p => !ex.pessoas.includes(p.id));
  for (const p of fo.pessoas || []) {
    if (ex.pessoas.includes(p.id) || f.pessoas.some(x => x.id === p.id || normTxt(x.nome) === normTxt(p.nome))) continue;
    f.pessoas.push({ ...p }); r.pessoas++;
  }
  f.contatos = f.contatos.filter(c => !ex.contatos.includes(c.id));
  for (const c of fo.contatos || []) {
    if (ex.contatos.includes(c.id) || f.contatos.some(x => x.id === c.id || (soDigitos(x.tel) && soDigitos(x.tel) === soDigitos(c.tel)))) continue;
    f.contatos.push({ ...c }); r.contatos++;
  }
  f.mochila = f.mochila.filter(m => !ex.mochila.includes(m.id));
  for (const m of fo.mochila || []) {
    if (ex.mochila.includes(m.id)) continue;
    const aqui = f.mochila.find(x => x.id === m.id || normTxt(x.nome) === normTxt(m.nome));
    if (aqui) { aqui.ok = aqui.ok || m.ok; aqui.itemId ??= m.itemId && destino(m.itemId); }
    else f.mochila.push({ ...m, itemId: m.itemId && destino(m.itemId) });
  }
  f.plano ??= planoPadrao();
  for (const [pid, v] of Object.entries(fo.plano?.pessoas || {})) if (!Object.keys(f.plano.pessoas[pid] || {}).length) f.plano.pessoas[pid] = v;
  f.endereco ||= fo.endereco || "";
  f.encontro.principal ||= fo.encontro?.principal || "";
  f.encontro.secundario ||= fo.encontro?.secundario || "";

  // zonas
  const z = local.zonas, zo = outro.zonas || { lugares: [], rotas: [] };
  const mapaL = {};
  z.lugares = z.lugares.filter(l => !ex.lugares.includes(l.id));
  z.rotas = z.rotas.filter(x => !ex.rotas.includes(x.id) && !ex.lugares.includes(x.de) && !ex.lugares.includes(x.para));
  for (const l of zo.lugares) {
    if (ex.lugares.includes(l.id)) continue;
    const aqui = z.lugares.find(x => x.id === l.id || (l.tipo === "casa" && x.tipo === "casa") || (x.tipo === l.tipo && normTxt(x.nome) === normTxt(l.nome)));
    if (aqui) {
      mapaL[l.id] = aqui.id;
      if (!temPos(aqui) && temPos(l)) { aqui.lat = l.lat; aqui.lon = l.lon; }
    } else { z.lugares.push({ ...l }); mapaL[l.id] = l.id; r.lugares++; }
  }
  for (const x of zo.rotas) {
    if (ex.rotas.includes(x.id) || z.rotas.some(y => y.id === x.id)) continue;
    const de = mapaL[x.de], para = mapaL[x.para];
    if (!de || !para) continue;
    z.rotas.push({ ...x, de, para }); r.rotas++;
  }

  if (!local.avisos.municipio && outro.avisos?.municipio) local.avisos.municipio = outro.avisos.municipio;
  local.catalogo = [...new Set([...(local.catalogo || []), ...(outro.catalogo || [])])];
  return r;
}

function juntarArquivo(file) {
  const leitor = new FileReader();
  leitor.onload = () => {
    let outro;
    try {
      outro = JSON.parse(leitor.result);
      if (!Array.isArray(outro.items) || !Array.isArray(outro.lotes) || !outro.config) throw 0;
    } catch (e) { return toast("Esse arquivo não é do GraySafe Hub."); }
    try { localStorage.setItem(keyAntes(), JSON.stringify(state)); } catch (e) {}
    const r = juntarEstado(state, migrar(outro));
    state.config.ultimaJuncao = new Date().toISOString();
    save();
    const n = (q, um, varios) => q ? `${q} ${q === 1 ? um : varios}` : "";
    const partes = [
      n(r.lotes, "lote", "lotes"), n(r.movs, "movimentação", "movimentações"), n(r.itens, "item", "itens"),
      n(r.pessoas, "ficha", "fichas"), n(r.contatos, "contato", "contatos"), n(r.lugares, "lugar", "lugares"),
      n(r.rotas, "rota", "rotas"), n(r.codigos, "código", "códigos"),
    ].filter(Boolean);
    const entraram = partes.length === 1 && /^1 /.test(partes[0]) ? "Entrou" : "Entraram";
    state.config.resumoJuncao = partes.length ? `${entraram} ${partes.join(", ")}.` : "Nada novo: os dois celulares já estavam iguais.";
    if (r.excluidos) state.config.resumoJuncao += ` ${r.excluidos} ${r.excluidos === 1 ? "item excluído" : "itens excluídos"} no outro celular também saíram daqui.`;
    save();
    toast("Arquivos juntados");
    render();
  };
  leitor.readAsText(file);
}

function temDesfazer() {
  try { return !!localStorage.getItem(keyAntes()); } catch (e) { return false; }
}

// ---------- tela (Sistema) ----------

function cardSync() {
  const c = state.config;
  return `<div class="card form">
    <h2>Dois celulares</h2>
    <p class="sub">Para outra pessoa da casa registrar também. Na primeira vez, instale o app no outro celular e use lá Backup › Restaurar com um arquivo deste. Depois, para acertar os dois: um envia o arquivo, o outro junta, e envia de volta para o primeiro juntar também.</p>
    <button class="btn" id="bSyncEnviar" type="button">Enviar para o outro celular</button>
    <label class="btn ghost file">Juntar arquivo do outro celular<input id="bSyncJuntar" type="file" accept=".json,application/json"></label>
    ${c.ultimaJuncao ? `<p class="sub">Última junção: ${new Date(c.ultimaJuncao).toLocaleString("pt-BR").slice(0, 17)}. ${esc(c.resumoJuncao || "")}</p>` : ""}
    ${temDesfazer() ? `<button class="btn ghost" id="bSyncDesfazer" type="button">Desfazer a última junção</button>` : ""}
    <p class="sub">A junção soma as compras e saídas dos dois e não apaga nada, a não ser o que foi excluído de propósito no outro celular. Se a mesma meta ou ficha foi mudada nos dois, fica a deste celular.</p>
  </div>`;
}

document.addEventListener("click", async e => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.id === "bSyncEnviar") {
    const nome = `graysafe-sincronizar-${carimbo()}.json`;
    const como = await compartilharArquivo(nome, JSON.stringify(state), "GraySafe Hub · sincronizar");
    if (como !== "cancelado") toast(como === "compartilhado" ? "Arquivo enviado" : `Arquivo salvo: ${nome}`);
  }
  if (b.id === "bBackupEnviar") {
    state.config.ultimoBackup = isoHoje(); save();
    const como = await compartilharArquivo(`graysafe-backup-${isoHoje()}.json`, JSON.stringify(state, null, 1), "GraySafe Hub · backup");
    if (como !== "cancelado") toast(como === "compartilhado" ? "Backup enviado" : "Backup salvo");
    render();
  }
  if (b.id === "bSyncDesfazer") {
    if (b.dataset.confirm !== "1") { b.dataset.confirm = "1"; b.textContent = "Confirmar: voltar ao que era antes"; b.classList.add("danger"); return; }
    try {
      state = migrar(JSON.parse(localStorage.getItem(keyAntes())));
      localStorage.removeItem(keyAntes());
      save(); toast("Junção desfeita"); render();
    } catch (err) { toast("Não há junção para desfazer."); }
  }
});

document.addEventListener("change", e => {
  if (e.target.id === "bSyncJuntar" && e.target.files[0]) juntarArquivo(e.target.files[0]);
});
