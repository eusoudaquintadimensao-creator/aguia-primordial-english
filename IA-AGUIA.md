# IA Águia Primordial (local, funciona sem internet)

Página: `/ia/` — https://eusoudaquintadimensao-creator.github.io/aguia-primordial-english/ia/

## Como responde
- Só com o que está no site e no app (`ia/kb.json`, gerado por `analise/ia/build_kb.py` a partir de todas as páginas do app, das seções do site e de 35 respostas curtas escritas a partir desse conteúdo) e com as 6.239 palavras do feed (`feed/data/palavras.json`).
- Busca BM25 com acentos normalizados, sinônimos em português e inglês, prefixos (aprendo ↔ aprender) e cobertura da pergunta. Se a pergunta não estiver no site, ela diz que não sabe e mostra temas próximos.
- Dicionário: "como se diz X em inglês", "o que significa X", "X em inglês" → palavra do vocabulário, com foto e link para o cartão no feed.
- Sem crédito, sem limite, sem servidor.

## Vozes (escolha no botão 🎙️)
- **Aurora**: a apresentadora do podcast Sol Nascente — XTTS v2 com `ref2.wav` (padrão `/workspace/aguia-voz/gravar_aurora.py`).
- **Águia**: a mesma voz-base (no padrão do projeto, Águia = Aurora), um pouco mais grave e com eco suave.
- **Conhecimento Solar**: o apresentador do app (edge-tts pt-PT-DuarteNeural, rate −6%, pitch −22 Hz, como `jarvis-rede-social/vozes/grava.py`).
- 35 falas gravadas por voz em `ia/voz/<voz>/<id>.mp3` (carregam só quando tocam; botão "Guardar as vozes" baixa tudo para usar sem internet). O resto usa a voz do aparelho.

## Sem internet
`sw.js` guarda a página, o motor, a base, a águia e as 6.239 palavras na primeira visita. Testado com a rede desligada (Chrome headless): respostas e dicionário funcionam.

## Atualizar
1. Editar `analise/ia/respostas.json` (respostas curtas) e rodar `python3 analise/ia/build_kb.py`.
2. Gravar as falas novas (job json → gravar_aurora.py; edge-tts para o Conhecimento Solar).
3. Trocar a versão em `sw.js`. Teste: `node teste/ia.js`.
