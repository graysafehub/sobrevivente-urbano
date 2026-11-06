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

## Consumo medido (fase 5)

- O app mede quanto a casa gasta de cada item pelas saídas de **consumo** (doação, perda e descarte não contam), nos últimos 90 dias a partir do primeiro registro do item. Vale com pelo menos 14 dias de registro e 2 saídas.
- Na tela do item, "Consumo medido" mostra a média por dia, a comparação com a base estimada e quanto dura o que há em casa nesse ritmo. Antes de ter dados suficientes, mostra quanto falta.
- Em itens de consumo diário, "Usar o consumo medido nas metas" troca a base pelo medido: metas = consumo medido × dias da meta, e a autonomia do Hub usa o mesmo número. "Voltar à base estimada" desfaz.
- No Hub, "Consumo medido ›" lista os itens medidos e os que ainda estão medindo.

## Dois celulares (fase 5)

Em Sistema › "Dois celulares", sem servidor e sem conta.

- **Primeira vez:** instale o app no outro celular e use lá Backup › Restaurar com um arquivo deste. Assim os dois começam com os mesmos itens.
- **Para acertar:** "Enviar para o outro celular" abre o menu de compartilhar do Android (WhatsApp, Drive…). No outro, "Juntar arquivo do outro celular". Depois o segundo envia de volta e o primeiro junta também.
- **Como junta:** entram os lotes, as compras e as saídas que só existem no outro; cada lote é refeito como quantidade inicial menos tudo que saiu dele nos dois celulares, então saídas feitas nos dois não se perdem. Entram também fichas, contatos, lugares, rotas e códigos de barras novos. Nada é apagado, a não ser o que foi excluído de propósito no outro (o app anota as exclusões). Se a mesma meta ou ficha foi mudada nos dois, fica a deste celular.
- **Desfazer:** o app guarda como estava antes da última junção, e "Desfazer a última junção" volta.
- O backup também pode ser enviado direto pelo menu de compartilhar ("Enviar backup").

## Plano de comunicação

Em Família › "Plano de comunicação", para quando a crise pega a família separada.

- **Para todos:** voltar para casa se for seguro; se não der, ponto principal, depois o secundário; quanto tempo esperar em cada ponto; ficar onde está se for perigoso sair; SMS curto com mensagens combinadas (OK, CASA, P1, P2, FICO, AJUDA, editáveis); o contato fora da cidade como ponte; horário fixo para tentar contato; canal do rádio, se houver.
- **Cada pessoa:** onde costuma estar (lugar das Zonas), a rota de volta e, para criança, quem busca na escola.
- **Quem usa este celular:** cada aparelho diz de quem é. O Hub e a Família mostram o plano dessa pessoa, e o cartão de bolso sai no nome dela, com o plano no verso. Isso fica só no aparelho: ao restaurar um backup de outro celular, o app pergunta de novo.
- O plano vai para os outros celulares pela junção e sai na versão impressa.

## Absorvedor de oxigênio e lenço para todos

- **Absorvedor de oxigênio** entrou no catálogo, com guia pela ficha da Utah State University (2011): quantidade por tamanho de recipiente (1 L, 50 a 100 cc; 2 L, 200 cc; 5 L, 500 cc), só para alimento seco (menos de 10% de umidade, risco de botulismo), só em recipiente que barra o ar (PET, vidro, lata, saco aluminizado), usar em 15 minutos depois de abrir o pacote e guardar os que sobram em pote fechado. Os guias de arroz, feijão, macarrão e aveia apontam para ele.
- **Lenço umedecido para higiene:** item novo, por pessoa (1 pacote a cada 2 semanas, estimativa). O lenço do bebê continua à parte.

## Preço base

Cada item do catálogo tem um preço base (seed.js, `PRECO_BASE`), de uma pesquisa básica de varejo de nov/2026, sem cidade definida. Ele entra quando o item não tem preço digitado nem preço pago: a lista de compras e o Hub já estimam o custo desde o começo. Na Entrada, ao digitar o preço pago, o app compara com o base: bom preço (abaixo), na média (até 10% acima), acima (até 30%) ou caro. O preço pago de verdade passa a valer no lugar do base.

## Metas que crescem e hora de recebimento dos avisos

- **Metas:** 3 dias, 1 semana e 2 semanas no começo. Ao passar para a meta de 1 semana, abre a de 1 mês; na de 2 semanas, 1 mês e meio; e assim por diante, de 15 em 15 dias (sempre duas acima da atual). Itens por dia e por pessoa multiplicam pelos dias; itens por casa somam, a cada nível, o quanto a meta cresce de 1 para 2 semanas (equipamento, com as duas iguais, não cresce).
- **Avisos:** cada aviso mostra quando chegou ao app ("Recebido 05/11 09:51"), a primeira vez que apareceu numa leitura do INMET; novas leituras não mudam essa hora. O INMET não informa a hora de emissão, só o início e o fim.

## Uso do dia a dia

- **Guia de crise "Calor forte e tempo seco":** cuidados no calor e com umidade abaixo de 30%, grupos mais sensíveis e sinais para procurar atendimento (Ministério da Saúde e Secretaria Municipal da Saúde de SP). Avisos do INMET de baixa umidade e onda de calor apontam para ele.
- **Manutenção periódica:** trocar a água guardada (6 meses), conferir power banks (3 meses), testar lanternas, rádio e pilhas, revisar mochila e documentos, simulado do plano de comunicação. Aparece no Hub quando vence; "Feito" marca a data. Na junção de dois celulares vale a data mais recente.
- **Use primeiro:** no Hub, os lotes de comida, água, bebê e higiene que vencem em até 90 dias (ou no aviso do item, se maior), com o botão "Usei" que abre a Saída.
- **Busca de item** na Entrada e na Saída; se sobra um item só, ele já fica escolhido.
- **Repetir a última compra** na Entrada: preenche quantidade, marca, especificação, preço e onde guardou.

## Testes

```bash
node tests/testes.js
```

Sem instalar nada. Confere metas (inclusive as que crescem), consumo medido, junção de dois celulares, coordenadas, avaliação de preço, migração de dados antigos e plano de comunicação. Rode antes de publicar.

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
| `consumo.js` | consumo medido pelas saídas |
| `sync.js` | junção de dois celulares por arquivo |
| `plano.js` | plano de comunicação e quem usa o celular |
| `manutencao.js` | tarefas de manutenção periódica |
| `tests/testes.js` | testes das contas (não vai para o celular) |
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

Suba a versão em `sw.js` (hoje `su-v20`) para o celular baixar a versão nova.
