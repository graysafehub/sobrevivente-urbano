# Sobrevivente Urbano

App de celular para controlar os insumos da família para crises. Funciona sem internet.

## O que já faz (versão 1)

- Catálogo inicial com as metas do plano escalonado: 3 dias, 1 semana e 2 semanas, para 5 pessoas.
- **Entrada:** cada compra vira um lote com quantidade, validade e onde foi guardado.
- **Saída:** desconta sozinho do lote que vence primeiro (rodízio).
- **Descarte:** remove um lote vencido e registra no histórico.
- **Semáforo:** vermelho (vencido ou abaixo da meta), amarelo (perto de vencer) e verde.
- **Alertas por item:** quantos dias antes de vencer avisar (padrão 60, ajustável em Mais) e um mínimo de quantidade. Com mínimo, o item fica amarelo abaixo da meta e vermelho abaixo do mínimo.
- **Painel:** progresso de cada degrau, dias de água e o que consumir primeiro.
- **Lista de compras:** o que falta para a meta atual.
- **Backup:** gera um arquivo para baixar e restaurar.
- **Versão para imprimir:** inventário em papel.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | estrutura da tela |
| `app.js` | toda a lógica |
| `seed.js` | catálogo inicial e metas |
| `styles.css` | visual |
| `sw.js` | guarda o app no celular para abrir offline |
| `manifest.webmanifest` + `icons/` | permite instalar na tela inicial |

Os dados ficam só no celular (localStorage). Nada é enviado para servidor nenhum.

## Testar no computador

```bash
python -m http.server 8765 --directory C:/Users/crazy/SobreviventeUrbano
```

Depois abra http://localhost:8765.

## Ao alterar arquivos

Suba a versão em `sw.js` (`su-v1` → `su-v2`) para o celular baixar a versão nova.
