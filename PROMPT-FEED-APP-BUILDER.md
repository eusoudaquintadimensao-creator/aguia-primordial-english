# Prompt para o Grok App Builder — consertar o FEED do Águia Primordial English

> Copie tudo abaixo da linha e cole no App Builder do app **zippy-pilot-pine-lotus.grok.me**.
> Referência funcionando (mesmos 6.239 cartões, já corrigido): https://eusoudaquintadimensao-creator.github.io/aguia-primordial-english/feed/

---

Quero corrigir a página **/feed** (e também /play/:tema, que usa o mesmo cartão). Não mude o conteúdo das palavras nem as outras páginas. Faça estas 5 mudanças:

## 1. Imagem ocupando a tela inteira do celular (sem barras pretas)

Hoje o cartão fica dentro de uma coluna `max-w-[460px]` centralizada num fundo preto (`fixed inset-0 flex items-center justify-center bg-black`). Em qualquer tela com mais de 460 px de largura — inclusive o celular no modo "site para computador" do Chrome (≈980 px) — sobra uma faixa estreita no meio com barras pretas dos lados. Além disso, a foto fica numa área `flex-1` (705 de 844 px no iPhone 14) e o texto fica num painel embaixo, com o rodapé fixo "homemcinza.com" por cima da palavra e o "DESLIZE" por cima da frase.

Faça assim:
- O cartão do feed ocupa **100% da largura e 100dvh de altura** (`position: fixed; inset: 0; width: 100vw; height: 100dvh`). Tire o `max-w-[460px]` desse cartão.
- A foto fica **atrás de tudo** com `object-fit: cover; object-position: center; width: 100%; height: 100%`.
- Por cima da foto, um degradê escuro só no terço de baixo (`linear-gradient(to top, rgba(0,0,0,.85), transparent 45%)`) e outro bem fraco no topo.
- Palavra em inglês, tradução e frase de exemplo ficam **sobre a foto**, no canto de baixo à esquerda, com `padding-bottom: calc(22px + env(safe-area-inset-bottom))` e `padding-right: 84px` para não encostar nos botões da direita.
- Botões (curtir, salvar, ouvir, velocidade, automático, enviar) numa coluna à direita, acima da legenda: `bottom: calc(150px + env(safe-area-inset-bottom))`.
- **Remova o rodapé fixo "homemcinza.com" de dentro do feed** (pode ficar na página Início/Sobre). Troque o texto "DESLIZE" por uma setinha pequena que some depois do primeiro deslize.
- Topo: barra transparente com voltar, tema e contador, com `padding-top: env(safe-area-inset-top)`.
- No `<meta name="viewport">` use `width=device-width, initial-scale=1, viewport-fit=cover`.
- Nenhum texto pode ficar sobre outro texto em 360×640, 390×844, 412×915 e 980×2124.

## 2. Áudio, legenda e imagem sincronizados

Hoje o áudio começa antes da imagem chegar (no 4G a foto de "rest stop" aparecia 3 s depois de toda a fala terminar) e o destaque avança **uma letra por vez por um relógio** (`88/velocidade` ms), ficando em média 1 a 2 letras atrás da voz e até 5 letras.

Faça assim:
- **A voz só começa quando a foto do cartão atual já carregou e foi decodificada** (`await img.decode()`), com limite de espera de 1,2 s. Se passar disso, fala mesmo assim.
- **Pré-carregue as fotos dos 2 próximos cartões** (`new Image()` + `decode()`) enquanto o atual toca. Mantenha só 3 cartões no DOM (anterior, atual, próximo).
- Destaque **palavra por palavra** (não letra): quebre a frase em `<span>` por palavra, guardando o início e o fim (índice de caractere) de cada uma.
- Use `utterance.onboundary` (evento `word`, campo `charIndex`) para acender a palavra exata que está sendo falada.
- Quando o aparelho não manda `onboundary` (muitos Android/iPhone), use um relógio por palavra: duração estimada = nº de letras × ms-por-letra daquela voz. Aprenda o ms-por-letra medindo `onstart`→`onend` de cada fala (média móvel, guardada no `localStorage` por idioma). Palavra falada = dourada; já ditas = brancas; próximas = 55% de opacidade.
- Ordem de cada cartão: inglês → português → frase em inglês; no modo automático, só vai para o próximo cartão **depois do `onend`** da última fala + 600 ms.
- Ao deslizar, chame `speechSynthesis.cancel()` antes de começar o próximo cartão.

## 3. Imagens nítidas e fixas (parar de "adivinhar" a foto)

Hoje cada cartão procura a foto **na hora**: tenta o resumo da Wikipédia pelo nome em inglês e, se não acha, faz uma busca no Commons pelo nome do arquivo. É daí que vêm as fotos erradas (ex.: *major* mostra um integrante da banda Major Lazer; *rot* mostra uma pintura da cidade Rot an der Rot; *rest stop* mostra um trem na Índia; *endpoint* mostra uma foto de 598×326 px). E às vezes baixa o arquivo original inteiro (mais de 1 MB por cartão).

Faça assim:
- Troque a busca na hora por um **mapa fixo palavra → arquivo** (um JSON estático por id). Use a lista da seção 5 e o arquivo `AUDITORIA-FEED-imagens.csv` (coluna "sugestao").
- Peça a miniatura do tamanho certo para a tela: largura = largura da tela × devicePixelRatio, arredondada para 500, 960, 1280 ou 1920 (`https://upload.wikimedia.org/wikipedia/commons/thumb/<a>/<ab>/<arquivo>/<largura>px-<arquivo>`). Nunca baixe o original se ele for maior que 1920 px.
- Não use foto com menos de 800 px de largura, nem mapa, logotipo, quadro de pintura ou retrato de pessoa famosa para uma palavra comum.
- Mostre o crédito (autor e licença) pequeno no canto de cima, com link para a página do arquivo.
- Para palavras abstratas (sentimentos, qualidades, verbos), quando não houver foto boa, mostre um **cartão tipográfico** bonito (palavra grande, emoji, degradê) em vez de uma foto qualquer.

## 4. Frases de exemplo

O gerador de frases cria frases erradas como "This is a major." e "This is a rot.". Para palavras que não são substantivos concretos (adjetivos, advérbios, abstratos), use "It is …" / "I feel …" ou só a palavra. Corrija pelo menos os cartões listados na seção 5.

## 5. Palavras com imagem que não combina (trocar)

Encontrei **4106 de 6.239 palavras** com algum problema de imagem (lista completa, com a foto atual e a sugestão, em `AUDITORIA-FEED-imagens.csv`: https://github.com/eusoudaquintadimensao-creator/aguia-primordial-english/blob/main/AUDITORIA-FEED-imagens.csv). Gravidade 3 = foto de outro assunto; 2 = não combina, sem imagem ou borrada; 1 = palpite/pesada/panorâmica. Para 771 delas já há foto livre conferida (coluna "sugestao").

Troque primeiro estas (as primeiras do feed e as mais graves). As imagens geradas estão em `https://eusoudaquintadimensao-creator.github.io/aguia-primordial-english/feed/img/g/<id>.webp` (1080×1920):

| id | palavra | hoje | trocar por |
|---|---|---|---|
| 3250 | zoom (ampliar) | foto achada por busca de nome de arquivo (palpite) | imagem gerada: feed/img/g/3250.webp |
| 3478 | strict (rígido) | foto achada por busca de nome de arquivo (palpite) | imagem gerada: feed/img/g/3478.webp |
| 3860 | northeast (nordeste) | foto achada por busca de nome de arquivo (palpite) | imagem gerada: feed/img/g/3860.webp |
| 4760 | inland (interiorano) | foto achada por busca de nome de arquivo (palpite) | imagem gerada: feed/img/g/4760.webp |
| 4824 | rot (apodrecer) | foto achada por busca de nome de arquivo (palpite) | imagem gerada: feed/img/g/4824.webp |
| 4870 | terror (terror) | foto achada por busca de nome de arquivo (palpite) | imagem gerada: feed/img/g/4870.webp |
| 5221 | major (maior) | foto achada por busca de nome de arquivo (palpite) | imagem gerada: feed/img/g/5221.webp |
| 89 | doorbell camera (câmera da porta) | sem imagem (o app mostra só o emoji) | imagem gerada: feed/img/g/89.webp |
| 150 | tape measure (trena) | sem imagem (o app mostra só o emoji) | imagem gerada: feed/img/g/150.webp |
| 274 | serving dish (travessa) | foto achada por busca de nome de arquivo (palpite) | imagem gerada: feed/img/g/274.webp |
| 830 | sideburn (costeleta) | sem imagem (o app mostra só o emoji) | imagem gerada: feed/img/g/830.webp |
| 1252 | hill (colina) | sem imagem (o app mostra só o emoji) | imagem gerada: feed/img/g/1252.webp |
| 1336 | ash tree (freixo) | baixa resolução (490×592 px, borra em tela cheia) | imagem gerada: feed/img/g/1336.webp |
| 1755 | daughter-in-law (nora) | sem imagem (o app mostra só o emoji) | imagem gerada: feed/img/g/1755.webp |
| 1825 | scientist (cientista) | sem imagem (o app mostra só o emoji) | imagem gerada: feed/img/g/1825.webp |
| 1880 | marker (caneta hidrográfica) | sem imagem (o app mostra só o emoji) | imagem gerada: feed/img/g/1880.webp |
| 2007 | minutes (ata) | texto/diagrama/logo | imagem gerada: feed/img/g/2007.webp |
| 2345 | kids menu (cardápio infantil) | sem imagem (o app mostra só o emoji) | imagem gerada: feed/img/g/2345.webp |
| 2434 | point (ponto) | sem imagem (o app mostra só o emoji) | imagem gerada: feed/img/g/2434.webp |
| 2565 | style (estilo) | foto achada por busca de nome de arquivo (palpite) | imagem gerada: feed/img/g/2565.webp |
| 3605 | nostalgia (nostalgia) | baixa resolução (604×800 px, borra em tela cheia) | imagem gerada: feed/img/g/3605.webp |
| 4423 | kilogram (quilograma) | não parece "kilogram" (IA de visão: posição 159 | imagem gerada: feed/img/g/4423.webp |
| 4549 | plant factory (usina) | sem imagem (o app mostra só o emoji) | imagem gerada: feed/img/g/4549.webp |
| 5008 | rest stop (parada de descanso) | foto achada por busca de nome de arquivo (palpite) | imagem gerada: feed/img/g/5008.webp |
| 507 | goji berry (goji) | foto achada por busca de nome de arquivo (palpite) | imagem gerada: feed/img/g/507.webp |
| 2177 | outskirts (periferia) | foto achada por busca de nome de arquivo (palpite) | imagem gerada: feed/img/g/2177.webp |
| 2951 | push (empurrar) | foto achada por busca de nome de arquivo (palpite) | imagem gerada: feed/img/g/2951.webp |
| 11 | room (cômodo) | não parece "room" (IA de visão: posição 1616 | https://commons.wikimedia.org/wiki/File:Gmas_Room_President_Garfield_Home.jpg |
| 27 | plug (plugue) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:Shaver_adaptor_plug_original.jpg |
| 52 | trash can (lixeira) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:Large_trash_can_at_home_closeup.jpg |
| 65 | coffee table (mesa de centro) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 71 | sheet (lençol) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 77 | heater (aquecedor) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:Space_heater.jpg |
| 92 | window pane (vidraça) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:Chagall%27s_America_Windows_Chicago_Art_Museum_2.JPG |
| 103 | utility room (despensa de utilidades) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:Laundry_room_%28tv%C3%A4ttstuga%29.JPG |
| 153 | roller (rolo de pintura) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:12_foot_smooth_roller.jpg |
| 154 | glue (cola) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:2023_Kleje.jpg |
| 155 | tape (fita adesiva) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:10cm_empty_tape_reel%2C_made_in_Belarus_02.jpg |
| 169 | stool (banqueta) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:Footstool_LACMA_M.2006.51.35.jpg |
| 185 | thread (linha) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 193 | microwave (micro-ondas) | não parece "microwave" (IA de visão: posição 1807 | https://commons.wikimedia.org/wiki/File:California_Kitchen_Microwave_Oven.jpg |
| 207 | plate (prato) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 215 | can (lata) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 234 | spatula (espátula) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:Degskrapor.png |
| 272 | coaster (porta-copos) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 284 | skillet (frigideira de ferro) | não parece "skillet" (IA de visão: posição 3040 | cartão tipográfico (emoji) até ter foto certa |
| 291 | range hood (coifa) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:California_Kitchen_Range_Hood.jpg |
| 494 | pitanga (pitanga) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 518 | pulp (polpa) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 571 | cilantro (coentro) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:2503Shingkang_Wansuy_Vegetables_47.jpg |
| 577 | sage (sálvia) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 629 | brandy (conhaque) | não parece "brandy" (IA de visão: posição 1786 | cartão tipográfico (emoji) até ter foto certa |
| 685 | suspenders (suspensório) | foto de banda/músico | https://commons.wikimedia.org/wiki/File:Setesdalsbunad_bunad_Valle_Setesdal_Norway_Drakt_mannsbunad_bukse_lokbukse_klaffebukse_broderi_s%C3%B8lvknapper_Norwegian_traditional_folk_costume_man_trousers_embroidery_filigree_silver_buttons_%28photo_2024%29_IMG_8776.jpg |
| 710 | flats (sapatilha) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 734 | pendant (pingente) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 747 | iris (íris) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:Iris_virginica_%28Virginia_iris%29_%28Newark%2C_Ohio%2C_USA%29_18.jpg |
| 785 | belly (barriga) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:ETalk2008-Belly.jpg |
| 818 | organ (órgão) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:Merton_College_Chapel_Organ%2C_Oxford%2C_UK_-_Diliff.jpg |
| 820 | cell (célula) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:Wilson1900Fig2.jpg |
| 837 | health (saúde) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:CDC_Adolescent_and_School_Health_PSA.jpg |
| 845 | pill (comprimido) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:Pill_%28NIH_BioArt_407_-_633313%29.png |
| 872 | toothache (dor de dente) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:A_man_suffering_from_Toothache.png |
| 873 | stomachache (dor de estômago) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:Abdominal_pain.jpg |
| 877 | flu (gripe) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 884 | cut (corte) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 888 | sprain (entorse) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:Ankle_sprain_--_Smart-Servier.jpg |
| 896 | stress (estresse) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 898 | depression (depressão) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:Grieving_shadow.jpg |
| 923 | recovery (recuperação) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 946 | floss (fio dental) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 1061 | boa (jiboia) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 1240 | ivy (hera) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 1243 | stone (rocha) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:Stone_bridge_in_Bj%C3%A4rekustens_nature_reserve.jpg |
| 1264 | creek (córrego) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 1280 | oasis (oásis) | não parece "oasis" (IA de visão: posição 2673 | cartão tipográfico (emoji) até ter foto certa |
| 1297 | echo (eco) | foto achada por busca de nome de arquivo (palpite) | cartão tipográfico (emoji) até ter foto certa |
| 1389 | shower (chuva rápida) | foto achada por busca de nome de arquivo (palpite) | https://commons.wikimedia.org/wiki/File:Dusche_ohne_Tuer_Walk_in_Dusche_Glasprofi24.jpg |

Palavras sem imagem boa: mostre o cartão tipográfico (palavra grande + emoji + degradê), nunca uma foto qualquer.

## 6. Teste antes de publicar
- iPhone 14 (390×844), Android (412×915) e Chrome em "site para computador" (980 px): foto cobrindo a tela inteira, nenhum texto sobre outro.
- Ligar a voz: a palavra dourada tem que ser a palavra falada (em ≥ 95% do tempo), e a foto tem que aparecer antes da voz começar.
- Rede 4G lenta: a voz não pode começar com a tela ainda sem foto.

Pronto. Não mexa no resto do aplicativo.
