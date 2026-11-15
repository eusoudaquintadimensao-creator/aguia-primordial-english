# Memorial Marguerite Porete (`/marguerite/`)

Página: https://eusoudaquintadimensao-creator.github.io/aguia-primordial-english/marguerite/

## Seções
Herói (representação artística + aviso de que não existe retrato autêntico) · 01 Quem foi · 02 O livro (+ fólio 1r do manuscrito de Chantilly) · 03 O processo (+ os artigos condenados) · 04 A fogueira · 05 Depois do fogo: o livro sem nome (1946, Romana Guarnieri) · ✦ As palavras dela (3 citações reais: francês médio do manuscrito de Chantilly + inglês medieval de "M. N." ed. Kirchberger 1927) · 06 Se ela pudesse falar (monólogo — **texto imaginado em homenagem**) · 07 Memorial (números com faixas e fontes + nomes) · Vigília: acender uma vela (contador no localStorage) · 08 Reflexão · ⬇ O livro · Fontes.

PT/EN em todo o texto (botão PT | EN, ou `?lang=en`).

## Áudio
- Voz da Aurora (XTTS v2, `ref2.wav`), em português e inglês: `marguerite/voz/{pt,en}/{quem,livro,processo,fogueira,depois,monologo,memorial,reflexao}.mp3`.
- Legenda sincronizada palavra por palavra: `*.json` (`t` = início de cada palavra do texto exibido, em segundos), gerado por `analise/marguerite/alinhar.py` (faster-whisper com marcação de palavras + alinhamento com o texto).
- Gerador: `analise/marguerite/gravar_ml.py job-pt.json` (cópia do padrão `/workspace/aguia-voz/gravar_aurora.py` com `LANG_TTS=pt|en`).
- O áudio só baixa quando a pessoa toca. O `sw.js` guarda cada fala ouvida (mesmo com pedidos Range) e o botão "Guardar a narração" baixa tudo de um idioma para ouvir sem internet. Se um MP3 faltar, a página usa a voz do aparelho.

## Imagens
- `marguerite/img/fogueira-m.webp` (1080×1920), `fogueira-d.webp` (1920×1080), `rosto.webp` (900×1200), `velas.webp` (1600×900) — geradas por IA, **representação artística**.
- `marguerite/img/ms-f1r.webp`, `ms-f37v.webp` — fotos reais do manuscrito de Chantilly MS 157 (Wikimedia Commons, domínio público; microfilme CNRS/IRHT).

## Livro
- Manuscrito de Chantilly MS 157, PDF 256 p. (Commons) — domínio público (só link, 48 MB).
- `marguerite/livro/le-mirouer-des-simples-ames-chantilly-wikisource.epub` — transcrição do Wikisource (texto medieval em domínio público; transcrição CC BY-SA 4.0). Hospedado.
- Kirchberger 1927 (Internet Archive) — domínio público nos EUA; só link.
- Traduções modernas (Babinsky 1993, Colledge/Marler/Grant 1999, Guarnieri/Verdeyen 1986) — só referência, sem arquivo.

## Atualizar
Texto: `analise/marguerite/conteudo.py` → `conteudo.json`; página: `molde.html` + `build.py`; depois regravar o áudio do trecho mudado (apagar o `.mp3.log` correspondente) e rodar `alinhar.py pt en`. Teste: `node teste/marguerite.js`.
