# Auditoria do feed — Águia Primordial English (15/11/2026)

App auditado: https://zippy-pilot-pine-lotus.grok.me/feed (6.239 cartões). Feed novo, já corrigido: https://eusoudaquintadimensao-creator.github.io/aguia-primordial-english/feed/

## 1. Por que a foto não enchia a tela
- O cartão fica numa coluna de no máximo **460 px** (`max-w-[460px]`) num fundo preto. Com o Chrome em "site para computador" (≈980 px de largura) sobra uma faixa de 460 px no meio, com barras pretas dos lados (print `prints/antes-980-modo-desktop.png`).
- No celular normal (390×844) a foto ocupa só a área de cima (705 de 844 px). O texto fica num painel embaixo, e o rodapé fixo **homemcinza.com** fica por cima da palavra; o **DESLIZE** fica por cima da frase (prints `prints/antes-390x844.png`, `prints/antes-412x915.png`).
- **Corrigido no feed novo:** foto em `object-fit: cover` na tela inteira (100dvh) em 390×844, 412×915 e 980×2124, legenda por cima da foto com degradê, respeita a área segura do iPhone, nenhum texto sobre outro (prints `prints/feed-depois-*.png`).

## 2. Áudio × legenda × imagem
- O app usa a voz do próprio aparelho (speechSynthesis): inglês → português → frase de exemplo.
- O destaque anda **uma letra por vez num relógio fixo** (88 ms ÷ velocidade). Medido com voz simulada de 12,5 letras/s: com eventos de palavra fica em média 1 letra atrás; sem eventos (comum no Android/iPhone) 2 letras atrás em média e até 5.
- A voz começa **antes da foto chegar**. Em 4G lento: "major" falado em 1,1 s e foto só em 2,7 s; "rest stop" a fala inteira terminou (16,5 s) e a foto só apareceu aos 19,6 s.
- **Corrigido no feed novo:** destaque palavra por palavra (evento de palavra quando o aparelho manda; senão relógio que aprende a velocidade real da voz). A voz só começa quando a foto do cartão já está decodificada (máx. 1,2 s), e as 2 próximas fotos são pré-carregadas. Medido: palavra certa acesa em 99,5–99,8% do tempo, no máximo 1 palavra de diferença, 0 de 18 falas com a tela sem foto (também em 4G lento).

## 3. Palavras com imagem que não combina
O app não tem uma foto fixa por palavra: ele **adivinha na hora**, pelo resumo da Wikipédia com o nome em inglês e, se não acha, por busca de nome de arquivo no Commons. Conferi as 6.239 com o mesmo método e com uma IA de visão (CLIP), além do tamanho real de cada arquivo.

- **4.106 de 6.239 palavras** com algum problema (lista completa: `AUDITORIA-FEED-imagens.csv`).
  - 2.652 fotos escolhidas por palpite de nome de arquivo;
  - 1.454 em que a foto não parece a palavra (IA de visão);
  - 1.057 em baixa resolução (menos de 800 px de largura: borra em tela cheia);
  - 615 sem imagem nenhuma;
  - 100 texto/diagrama/logo, 78 panorâmicas, 44 retratos de pessoa, 30 mapas, 25 fotos de banda/músico, 17 pinturas, 14 arquivos enormes baixados inteiros.
- Gravidade: 568 graves (foto de outro assunto), 2.374 médias, 1.164 leves.
- Exemplos: **major** → foto de um integrante da banda Major Lazer; **rot** (apodrecer) → pintura da cidade Rot an der Rot; **rest stop** → trem na Índia; **room** → plateia de teatro; **plug** → praça de pedágio; **trash can** → andaime industrial; **plate** → monges; **range hood** → soldados; **endpoint** → foto de 598×326 px.

## 4. O que foi corrigido no feed novo
- **40 imagens realistas em HD geradas** (1080×1920) para os primeiros cartões do feed e palavras sem foto boa (major, cheese, rest stop, iceberg, strawberry, chandelier, refrigerator…).
- **345 fotos trocadas** por fotos livres do Commons (≥ 1000×700) conferidas pela IA de visão.
- **382 fotos erradas removidas**: o cartão mostra a palavra grande com emoji em vez de uma foto de outro assunto.
- Miniatura do tamanho da tela (500/960/1280/1920 px), nunca o original de vários MB; crédito e licença em cada foto.
- Frases de exemplo corrigidas nos cartões que estavam erradas ("This is a major." → "It is in C major.", "I rot." → "Fruit can rot.", sentimentos → "I feel …").

## 5. Limites
- A IA de visão erra às vezes (palavras abstratas e com dois sentidos); por isso a coluna "gravidade" e a revisão manual dos primeiros cartões.
- O app do App Builder não foi alterado: não tenho acesso ao código. O pedido pronto para colar está em `PROMPT-FEED-APP-BUILDER.md`.
- A voz do feed é a do aparelho (como no app). As fotos do Commons precisam de internet; as 40 geradas ficam no site.
