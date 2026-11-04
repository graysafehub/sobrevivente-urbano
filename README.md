# GraySafe Hub

Projeto Sobrevivente Urbano. App de celular para controlar os insumos da família para crises. Funciona sem internet.

## O que já faz (versão 1)

- Catálogo inicial com as metas do plano escalonado: 3 dias, 1 semana e 2 semanas, para 5 pessoas.
- **Entrada:** cada compra vira um lote com quantidade, validade e onde foi guardado.
- **Saída:** desconta sozinho do lote que vence primeiro (rodízio).
- **Descarte:** remove um lote vencido e registra no histórico.
- **Semáforo:** vermelho (vencido ou abaixo da meta), amarelo (perto de vencer) e verde.
- **Alertas por item:** quantos dias antes de vencer avisar (padrão 60, ajustável em Mais) e um mínimo de quantidade. Com mínimo, o item fica amarelo abaixo da meta e vermelho abaixo do mínimo.
- **Hub:** Supply Grid com dias de autonomia por categoria (água, ração, energia, saúde, bebê), progresso de cada degrau, alertas e registro de eventos.
- **Lista de compras:** o que falta para a meta atual.
- **Backup:** gera um arquivo para baixar e restaurar.
- **Versão para imprimir:** inventário em papel, com a parte da família.

## Versão 2

- **Especificação por compra:** cada item pode dizer o que anotar na entrada (ex.: power bank → capacidade em mAh; fraldas → tamanho). O valor fica no lote, aparece no estoque, no histórico e no papel. A próxima entrada já sugere a última especificação.
- **Família:** fichas de saúde (nascimento, tipo sanguíneo, alergias, remédios de uso contínuo, condições, médico), sem números de documento e sem PIN, por decisão.
- **Contatos de emergência**, com aviso quando falta um parente fora da cidade, e botão de ligar.
- **Casa e pontos de encontro:** principal (perto de casa) e secundário (fora do bairro).
- **Mochila:** checklist ligado ao estoque (mostra se o item existe em casa) e com os remédios das fichas.
- **Cartão de bolso:** duas cópias para imprimir e recortar, com nome, alergias, telefones, endereço e ponto de encontro.

Dados antigos e backups antigos são convertidos sozinhos ao abrir.

## Versão 3

- **Metas pela família:** com fichas cadastradas, as metas usam o número de pessoas das fichas. Cada item tem uma regra (Editar › "A meta cresce com"): por pessoa (comida, água, higiene), por bebê de até 2 anos (fraldas, lenço, pomada) ou fixa (lanterna, rádio, kit…). As metas do catálogo são para a família base de 5 pessoas com 1 bebê.
- **Guia de compra:** cada item do catálogo mostra como escolher, como guardar e como preparar. Na lista de compras, tocar no item abre o guia; o `+` registra a compra.
- **Código de barras:** na Entrada, "Ler código de barras" usa a câmera (leitor nativo do Chrome no Android, funciona offline). Código novo: o app pergunta de qual item é e a marca, e grava. Código conhecido: preenche item, marca e especificação. Mesmo produto e marca, mesmo código; outra marca, outro código. Os códigos de um item aparecem na tela dele e podem ser desligados. Sem câmera, dá para digitar os números.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | estrutura da tela |
| `app.js` | toda a lógica |
| `seed.js` | catálogo inicial, metas, regra de cada meta e mochila padrão |
| `guias.js` | guia de compra de cada item |
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

Suba a versão em `sw.js` (hoje `su-v5`) para o celular baixar a versão nova.
