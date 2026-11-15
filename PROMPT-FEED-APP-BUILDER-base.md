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
