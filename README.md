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

- **Metas pela família, com base de 1 pessoa:** cada item tem uma base (Editar › Meta › "Como calcular"): por pessoa por dia, por adulto (12+) por dia ou por bebê (até 2 anos) por dia, que o app multiplica pelas pessoas das fichas e pelos dias da meta (3, 7, 14); por pessoa ou por adulto, sem depender dos dias (lanterna, power bank, apito); ou por casa, com metas fixas (rádio, botijão, dinheiro). Bases de consumo vindas do Ready.gov e da BYU, explicadas no guia de cada item. Sem fichas, vale a família base: 5 pessoas, 2 adultos, 1 bebê. A autonomia do Hub usa o consumo diário de cada item.
- **Itens novos:** pano ou coador para filtrar água, abridor de lata manual, repelente, máscara PFF2, escova de dentes reserva, pasta de dente e apito.
- **Guia de compra:** cada item do catálogo mostra como escolher, quanto comprar, como guardar (com prazos e o porquê) e, quando houver, como preparar para guardar, com as fontes (Ready.gov, Saúde de SP, BYU, USU, Kansas State, Embrapa, USDA, fabricantes). Itens sem fonte específica dizem isso. Na lista de compras, tocar no item abre o guia; o `+` registra a compra.
- **Preço:** a Entrada aceita o preço pago (total); o app guarda o preço por unidade no lote. Cada item pode ter um preço de referência (Editar), usado para o que está em casa sem preço e para estimar a lista de compras; sem ele, vale o último preço pago. O Hub mostra o valor do estoque e quanto falta gastar para a meta; a lista de compras e o papel mostram os valores.
- **Código de barras:** na Entrada, "Ler código de barras" usa a câmera (leitor nativo do Chrome no Android, funciona offline). Código novo: o app pergunta de qual item é e a marca, e grava. Código conhecido: preenche item, marca e especificação. Mesmo produto e marca, mesmo código; outra marca, outro código. Os códigos de um item aparecem na tela dele e podem ser desligados. Sem câmera, dá para digitar os números.

## Ajustes de validade e catálogo

- **Validade típica:** cada item pode ter quanto costuma durar, em meses (Editar). A Entrada já sugere a data de validade com isso; confira na embalagem.
- **Aviso:** é a antecedência, até 365 dias. Um aviso maior que 1 ano gravado antes vira validade típica sozinho.
- **Itens renomeados** continuam ligados ao catálogo e ao guia. Item criado à mão com nome parecido com um do catálogo (ex.: "Repelente de insetos") é ligado a ele, sem duplicar; se os dois já existiam (mesma categoria, unidade e cálculo), viram um só: fica o do catálogo, com o guia, recebendo o que está em casa, o histórico e os dados digitados no outro. Em Editar, "Juntar este item com" junta dois itens repetidos à mão.
- **Itens novos:** copos, pratos e talheres descartáveis; fórmula infantil; carregador e cabo de celular; analgésico adulto; água sanitária; luvas e botas de borracha; cópias dos documentos; cobertor ou manta; lona plástica e fita adesiva; alicate ou chave inglesa. Itens do catálogo que você excluiu não voltam.

## Guias de crise (fase 2.3)

No Hub, em "Guias de crise": tratar e guardar água, falta de luz, enchente e temporal, criança com febre ou diarreia. Cada guia tem passos curtos, o que não fazer, sinais para procurar atendimento, quanto há em casa dos itens que ele usa e as fontes (Ministério da Saúde, Defesa Civil Nacional, Secretaria da Saúde de SP e de PE, Ready.gov). O guia da criança mostra as fichas de menores de 12 anos com alergias e remédios. Em Sistema, "Imprimir os guias de crise" gera a versão em papel.

## Zonas (fase 3)

Em Família › "Zonas", ou no Hub.

- **Lugares:** casa, pontos de encontro, casa de parente, abrigo, hospital, UPA, UBS, farmácia, posto, mercado, revenda de gás, ponto de água, escola e trabalho. A posição entra pelo GPS ("Usar minha posição agora", em pé no lugar; funciona sem internet) ou colando o link longo ou os números copiados do Google Maps.
- **Radar:** desenho dos lugares em volta de casa, norte para cima, com distância e direção (N, NE, L…). Cada grupo tem forma e cor. "Mostrar minha posição" põe você no radar e mostra a distância e o tempo a pé até cada lugar, em linha reta. O GPS só fica ligado com a tela aberta, e a posição não sai do aparelho.
- **Rotas:** de um lugar a outro, a pé ou de carro, com caminho principal, alternativo e pontos de atenção, e o botão para abrir no Google Maps (precisa de internet ou da área baixada no Maps).
- **Papel:** a versão para imprimir traz o radar, a tabela dos lugares com coordenadas e as rotas.

## Avisos (fase 4)

No Hub, no quadro "Avisos do tempo · INMET", e na tela Avisos.

- **Avisos meteorológicos do INMET** (tempestade, chuvas intensas, ventos, baixa umidade, onda de calor…), de hoje e previstos, com riscos, instruções, severidade (amarelo, laranja, vermelho), link para o aviso no INMET e, quando há, o guia de crise ligado.
- Vale o aviso que cita o município escolhido (código IBGE) ou cuja área cobre a posição de casa gravada em Zonas. A lista vem do país inteiro e é filtrada no aparelho: a localização não é enviada.
- **Previsão de 5 dias** do INMET para o município (só o código do município vai ao INMET).
- Lê sozinho ao abrir o Hub, no máximo a cada 30 minutos, quando há internet. A última leitura fica guardada para consultar offline, com a hora; depois de 12 horas sem leitura, o app avisa.
- **Defesa Civil:** o sistema de alertas (Idap) não libera a leitura por outros sites, então o app orienta o SMS 40199 e os alertas de emergência do Android.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | estrutura da tela |
| `app.js` | toda a lógica |
| `seed.js` | catálogo inicial, metas, regra de cada meta e mochila padrão |
| `guias.js` | guia de compra de cada item e lista de fontes |
| `crises.js` | guias de crise |
| `zonas.js` | lugares, rotas e radar |
| `avisos.js` | avisos e previsão do INMET |
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

Suba a versão em `sw.js` (hoje `su-v13`) para o celular baixar a versão nova.
